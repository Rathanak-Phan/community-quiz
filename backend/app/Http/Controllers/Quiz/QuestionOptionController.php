<?php

namespace App\Http\Controllers\Quiz;

use App\Http\Controllers\Controller;
use App\Http\Requests\Question\StoreOptionRequest;
use App\Http\Requests\Question\UpdateOptionRequest;
use App\Http\Resources\QuestionOptionResource;
use App\Models\Question;
use App\Models\QuestionOption;

class QuestionOptionController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/questions/{question}/options",
     *     tags={"Question Options"},
     *     summary="Get all options for a specific question",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="question",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function index(Question $question)
    {
        $options = $question->options;

        return response()->json([
            'success' => true,
            'data' => QuestionOptionResource::collection($options)
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/options",
     *     tags={"Question Options"},
     *     summary="Create option",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"question_id", "option_text", "is_correct"},
     *             @OA\Property(property="question_id", type="integer"),
     *             @OA\Property(property="option_text", type="string"),
     *             @OA\Property(property="is_correct", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function store(StoreOptionRequest $request)
    {
        $question = Question::findOrFail($request->question_id);

        $this->authorize('manage', $question);

        $option = QuestionOption::create($request->validated());

        return response()->json([
            'success' => true,
            'data' => new QuestionOptionResource($option)
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/options/{option}",
     *     tags={"Question Options"},
     *     summary="Update option",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="option",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="option_text", type="string"),
     *             @OA\Property(property="is_correct", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function update(UpdateOptionRequest $request, QuestionOption $option)
    {
        $this->authorize('manage', $option->question);

        $option->update($request->validated());

        return response()->json([
            'success' => true,
            'data' => new QuestionOptionResource($option)
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/options/{option}",
     *     tags={"Question Options"},
     *     summary="Delete option",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="option",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function destroy(QuestionOption $option)
    {
        $this->authorize('manage', $option->question);

        $option->delete();

        return response()->json([
            'success' => true,
            'data' => [
                'message' => 'Option deleted successfully'
            ]
        ]);
    }
}
