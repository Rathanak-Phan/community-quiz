<?php

namespace App\Http\Controllers\QuizMaker;

use App\Http\Controllers\Controller;
use App\Http\Requests\Question\StoreMcqRequest;
use App\Http\Requests\Question\StoreTrueFalseRequest;
use App\Models\Question;
use App\Models\Quiz;
use Illuminate\Support\Facades\DB;

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
            ]);

            foreach ($request->options as $index => $optionText) {
                $question->options()->create([
                    'option_text' => $optionText,
                    'is_correct' => $index === (int)$request->correct_option,
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
            'correct_answer' => $request->correct_answer ? 'true' : 'false',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'True/False Question created successfully',
            'data' => $question
        ], 201);
    }
}
