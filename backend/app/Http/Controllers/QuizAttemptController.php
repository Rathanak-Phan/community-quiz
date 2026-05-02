<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Http\Requests\QuizAttempt\StartQuizAttemptRequest;
use App\Http\Resources\QuizAttemptResource;
use Illuminate\Http\Response;

use App\Http\Requests\QuizAttempt\SubmitAnswerRequest;
use App\Http\Resources\AttemptAnswerResource;
use App\Models\AttemptAnswer;
use App\Models\Question;

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
     *     @OA\Response(
     *         response=201,
     *         description="Quiz attempt started successfully",
     *         @OA\JsonContent(ref="#/components/schemas/QuizAttempt")
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(
     *         response=409,
     *         description="Active attempt already exists",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="attempt", ref="#/components/schemas/QuizAttempt")
     *         )
     *     )
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

    /**
     * @OA\Post(
     *     path="/api/attempts/{attempt}/answer",
     *     tags={"Quiz Attempt"},
     *     summary="Submit or update an answer",
     *     operationId="quizAttemptSubmitAnswer",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="attempt",
     *         in="path",
     *         required=true,
     *         description="Quiz Attempt ID",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"question_id"},
     *             @OA\Property(property="question_id", type="integer", example=1),
     *             @OA\Property(property="selected_option_id", type="integer", nullable=true, example=1),
     *             @OA\Property(property="answer_boolean", type="boolean", nullable=true, example=true),
     *             @OA\Property(property="answer_text", type="string", nullable=true, example="Paris")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Answer saved successfully",
     *         @OA\JsonContent(ref="#/components/schemas/AttemptAnswer")
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="Not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function submitAnswer(SubmitAnswerRequest $request, QuizAttempt $attempt)
    {
        // 1. Check if attempt belongs to user
        if ($attempt->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        // 2. Check if attempt is in progress
        if ($attempt->status !== 'in_progress') {
            return response()->json(['message' => 'This attempt is already completed or cancelled.'], Response::HTTP_FORBIDDEN);
        }

        // 3. Verify question belongs to the quiz
        $question = Question::find($request->question_id);
        if ($question->quiz_id !== $attempt->quiz_id) {
            return response()->json(['message' => 'Question does not belong to this quiz.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // 4. Save or update answer
        $answer = AttemptAnswer::updateOrCreate(
            [
                'quiz_attempt_id' => $attempt->id,
                'question_id' => $request->question_id,
            ],
            [
                'selected_option_id' => $request->selected_option_id,
                'answer_boolean' => $request->answer_boolean,
                'answer_text' => $request->answer_text,
            ]
        );

        return new AttemptAnswerResource($answer);
    }
}
