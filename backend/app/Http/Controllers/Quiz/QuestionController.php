<?php

namespace App\Http\Controllers\Quiz;

use App\Http\Controllers\Controller;
use App\Http\Requests\Question\StoreMcqRequest;
use App\Http\Requests\Question\StoreShortAnswerRequest;
use App\Http\Requests\Question\StoreTrueFalseRequest;
use App\Models\Question;
use App\Models\Quiz;
use App\Http\Resources\QuestionResource;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/questions/mcq",
     *     tags={"Questions"},
     *     summary="Create a Multiple Choice Question (MCQ)",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"quiz_id", "question_text", "options", "correct_option"},
     *             @OA\Property(property="quiz_id", type="integer", example=1),
     *             @OA\Property(property="question_text", type="string", example="What is the capital of France?"),
     *             @OA\Property(
     *                 property="options",
     *                 type="array",
     *                 @OA\Items(type="string"),
     *                 example={"Berlin", "Paris", "Rome"}
     *             ),
     *             @OA\Property(property="correct_option", type="integer", example=1, description="Index of the correct option in the options array")
     *         )
     *     ),
     *     @OA\Response(response=201, description="MCQ created successfully"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=422, description="Validation Error")
     * )
     */
    public function storeMcq(StoreMcqRequest $request)
    {
        $quiz = Quiz::findOrFail($request->quiz_id);

        $this->authorize('update', $quiz);

        try {
            DB::beginTransaction();

            $question = Question::create([
                'quiz_id' => $quiz->id,
                'question_type' => 'multiple_choice',
                'question_text' => $request->question_text,
                'points' => $request->points ?? 1,
                'time_limit' => $request->time_limit ?? 30,
                'allow_multiple' => $request->boolean('allow_multiple', false),
            ]);

            $correctOptions = $request->has('correct_options') 
                ? (array) $request->correct_options 
                : [$request->correct_option];

            foreach ($request->options as $index => $optionText) {
                $question->options()->create([
                    'option_text' => $optionText,
                    'is_correct' => in_array($index, $correctOptions),
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'MCQ created successfully',
                'data' => $question->load('options')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create MCQ',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/questions/true-false",
     *     tags={"Questions"},
     *     summary="Create a True/False Question",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"quiz_id", "question_text", "correct_answer"},
     *             @OA\Property(property="quiz_id", type="integer", example=1),
     *             @OA\Property(property="question_text", type="string", example="The sky is blue."),
     *             @OA\Property(property="correct_answer", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(response=201, description="True/False Question created successfully"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=422, description="Validation Error")
     * )
     */
    public function storeTrueFalse(StoreTrueFalseRequest $request)
    {
        $quiz = Quiz::findOrFail($request->quiz_id);

        $this->authorize('update', $quiz);

        $question = Question::create([
            'quiz_id' => $quiz->id,
            'question_type' => 'true_false',
            'question_text' => $request->question_text,
            'points' => $request->points ?? 1,
            'time_limit' => $request->time_limit ?? 30,
            'correct_answer' => $request->correct_answer ? 'true' : 'false',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'True/False Question created successfully',
            'data' => $question
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/api/questions/short-answer",
     *     tags={"Questions"},
     *     summary="Create a Short Answer Question",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"quiz_id", "question_text", "correct_answer"},
     *             @OA\Property(property="quiz_id", type="integer", example=1),
     *             @OA\Property(property="question_text", type="string", example="What is the boiling point of water in Celsius?"),
     *             @OA\Property(property="correct_answer", type="string", example="100"),
     *             @OA\Property(property="is_manual_grading", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Short Answer Question created successfully"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=422, description="Validation Error")
     * )
     */
    public function storeShortAnswer(StoreShortAnswerRequest $request)
    {
        $quiz = Quiz::findOrFail($request->quiz_id);

        $this->authorize('update', $quiz);

        try {
            DB::beginTransaction();

            $question = Question::create([
                'quiz_id' => $quiz->id,
                'question_type' => 'short_answer',
                'question_text' => $request->question_text,
                'points' => $request->points ?? 1,
                'time_limit' => $request->time_limit ?? 30,
            ]);

            $question->shortAnswer()->create([
                'answer_text' => $request->correct_answer,
                'is_manual_grading' => $request->boolean('is_manual_grading', false),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Short Answer Question created successfully',
                'data' => $question->load('shortAnswer')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create Short Answer Question',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function index(Quiz $quiz)
    {
        $this->authorize('update', $quiz);

        $questions = $quiz->questions()
            ->with(['options', 'shortAnswer'])
            ->get();

        return QuestionResource::collection($questions);
    }

    public function show(Question $question)
    {
        $this->authorize('update', $question->quiz);
        return new QuestionResource($question->load(['options', 'shortAnswer']));
    }

    public function update(Request $request, Question $question)
    {
        $this->authorize('update', $question->quiz);

        $request->validate([
            'question_text' => 'required|string',
            'points' => 'nullable|integer',
            'image' => 'nullable|image|max:2048',
            'is_manual_grading' => 'nullable|boolean',
            'correct_answer' => 'required_if:is_manual_grading,0,false|nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $data = $request->only(['question_text', 'points', 'time_limit']);
            
            if ($request->has('allow_multiple')) {
                $data['allow_multiple'] = $request->boolean('allow_multiple');
            }

            if ($request->hasFile('image')) {
                $data['image'] = $request->file('image')->store('questions', 'public');
            }

            $question->update($data);

            // Handle type-specific updates
            if ($question->question_type === 'multiple_choice' && $request->has('options')) {
                $question->options()->delete();
                $correctOptions = $request->has('correct_options') 
                    ? (array) $request->correct_options 
                    : [$request->correct_option];

                foreach ($request->options as $index => $optionText) {
                    $question->options()->create([
                        'option_text' => $optionText,
                        'is_correct' => in_array($index, $correctOptions),
                    ]);
                }
            } elseif ($question->question_type === 'true_false' && $request->has('correct_answer')) {
                $question->update(['correct_answer' => $request->correct_answer ? 'true' : 'false']);
            } elseif ($question->question_type === 'short_answer') {
                $question->shortAnswer()->updateOrCreate(
                    ['question_id' => $question->id],
                    [
                        'answer_text' => $request->correct_answer,
                        'is_manual_grading' => $request->boolean('is_manual_grading', false)
                    ]
                );
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Question updated successfully',
                'data' => new QuestionResource($question->load(['options', 'shortAnswer']))
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update question',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Question $question)
    {
        $this->authorize('update', $question->quiz);

        $question->delete();

        return response()->json([
            'success' => true,
            'message' => 'Question deleted successfully'
        ]);
    }
}
