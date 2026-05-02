<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Http\Requests\QuizAttempt\StartQuizAttemptRequest;
use App\Http\Resources\QuizAttemptResource;
use Illuminate\Http\Response;

class QuizAttemptController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/quizzes/{quiz}/start",
     *     tags={"Quiz Attempt"},
     *     summary="Start a quiz attempt",
     *     operationId="quizAttemptStart",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="quiz",
     *         in="path",
     *         required=true,
     *         description="Quiz ID",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"mode", "is_anonymous"},
     *             @OA\Property(property="mode", type="string", enum={"practice", "scored"}, example="scored"),
     *             @OA\Property(property="is_anonymous", type="boolean", example=false)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Quiz attempt started successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=409, description="Active attempt already exists")
     * )
     */
    public function start(StartQuizAttemptRequest $request, Quiz $quiz)
    {
        // 1. Check access (community rules)
        $this->authorize('view', $quiz);

        $user = auth()->user();

        // 2. Prevent multiple active attempts for same quiz
        $existingAttempt = QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)
            ->where('status', 'in_progress')
            ->first();

        if ($existingAttempt) {
            return response()->json([
                'message' => 'You already have an active attempt for this quiz.',
                'attempt' => new QuizAttemptResource($existingAttempt)
            ], Response::HTTP_CONFLICT);
        }

        // 3. Create attempt record
        $attempt = QuizAttempt::create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'mode' => $request->mode,
            'is_anonymous' => $request->is_anonymous,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        return (new QuizAttemptResource($attempt))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
