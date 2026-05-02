<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Http\Requests\QuizAttempt\StartQuizAttemptRequest;
use App\Http\Resources\QuizAttemptResource;
use Illuminate\Http\Response;

use App\Http\Requests\QuizAttempt\SubmitAnswerRequest;
use App\Http\Resources\AttemptAnswerResource;
use App\Http\Resources\QuizAttemptDetailResource;
use App\Services\QuizScoringService;
use App\Models\AttemptAnswer;
use App\Models\Question;
use App\Http\Resources\QuestionReviewResource;
use App\Http\Resources\PendingReviewResource;
use Illuminate\Http\Request;

class QuizAttemptController extends Controller
{
    protected $scoringService;

    public function __construct(QuizScoringService $scoringService)
    {
        $this->scoringService = $scoringService;
    }

    /**
     * @OA\Get(
     *     path="/api/attempts/{attempt}",
     *     tags={"Quiz Attempt"},
     *     summary="Get quiz attempt details for resuming",
     *     operationId="quizAttemptShow",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="attempt",
     *         in="path",
     *         required=true,
     *         description="Quiz Attempt ID",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Quiz attempt details retrieved successfully",
     *         @OA\JsonContent(ref="#/components/schemas/QuizAttemptDetail")
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    public function show(QuizAttempt $attempt)
    {
        // 1. Check if attempt belongs to user
        if ($attempt->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        // 2. Load relationships
        $attempt->load(['quiz.questions.options', 'answers']);

        return new QuizAttemptDetailResource($attempt);
    }

    /**
     * @OA\Post(
     *     path="/api/attempts/{attempt}/submit",
     *     tags={"Quiz Attempt"},
     *     summary="Submit a quiz attempt",
     *     operationId="quizAttemptSubmit",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="attempt",
     *         in="path",
     *         required=true,
     *         description="Quiz Attempt ID",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Quiz attempt submitted successfully",
     *         @OA\JsonContent(ref="#/components/schemas/QuizAttemptDetail")
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="Not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function submit(QuizAttempt $attempt)
    {
        // 1. Check if attempt belongs to user
        if ($attempt->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        // 2. Check if attempt is in progress
        if ($attempt->status !== 'in_progress') {
            return response()->json(['message' => 'This attempt is already completed.'], Response::HTTP_FORBIDDEN);
        }

        // 3. Optional: Check if all questions are answered
        $questionCount = $attempt->quiz->questions()->count();
        $answerCount = $attempt->answers()->count();

        if ($answerCount < $questionCount) {
            return response()->json(['message' => 'Please answer all questions before submitting.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // 4. Calculate score
        $results = $this->scoringService->calculateScore($attempt);

        // 5. Update attempt record
        $attempt->update([
            'status' => 'submitted',
            'score' => $results['total_score'],
            'max_score' => $results['max_score'],
            'grading_status' => $results['grading_status'],
            'completed_at' => now(),
        ]);

        return new QuizAttemptDetailResource($attempt->load(['quiz.questions.options', 'answers']));
    }

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

    /**
     * @OA\Get(
     *     path="/api/attempts/{attempt}/review",
     *     tags={"Quiz Attempt"},
     *     summary="Get quiz attempt details for manual review",
     *     operationId="quizAttemptReview",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="attempt",
     *         in="path",
     *         required=true,
     *         description="Quiz Attempt ID",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Quiz attempt review data retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="grading_status", type="string"),
     *             @OA\Property(property="questions", type="array", @OA\Items(ref="#/components/schemas/QuestionReview")),
     *             @OA\Property(property="answers", type="array", @OA\Items(ref="#/components/schemas/AttemptAnswer"))
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function review(QuizAttempt $attempt)
    {
        // 1. Check if user is quiz maker or admin
        $quiz = $attempt->quiz;
        if ($quiz->created_by !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        // 2. Load relationships
        $attempt->load(['quiz.questions.options', 'quiz.questions.shortAnswer', 'answers.gradedBy']);

        return [
            'id' => $attempt->id,
            'status' => $attempt->status,
            'score' => $attempt->score,
            'max_score' => $attempt->max_score,
            'grading_status' => $attempt->grading_status,
            'quiz' => $attempt->quiz,
            'questions' => QuestionReviewResource::collection($attempt->quiz->questions),
            'answers' => AttemptAnswerResource::collection($attempt->answers),
        ];
    }

    /**
     * @OA\Post(
     *     path="/api/answers/{answer}/grade",
     *     tags={"Quiz Attempt"},
     *     summary="Grade a specific answer manually",
     *     operationId="quizAttemptGradeAnswer",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="answer",
     *         in="path",
     *         required=true,
     *         description="Attempt Answer ID",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"score"},
     *             @OA\Property(property="score", type="integer", example=5),
     *             @OA\Property(property="feedback", type="string", nullable=true, example="Good job!")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Answer graded successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="answer", ref="#/components/schemas/AttemptAnswer"),
     *             @OA\Property(property="attempt_summary", type="object")
     *         )
     *     )
     * )
     */
    public function gradeAnswer(Request $request, AttemptAnswer $answer)
    {
        $request->validate([
            'score' => 'required|integer|min:0',
            'feedback' => 'nullable|string',
        ]);

        // 1. Check if user is quiz maker or admin
        $attempt = $answer->attempt;
        $quiz = $attempt->quiz;
        if ($quiz->created_by !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        // 2. Update answer
        $question = $answer->question;
        $isCorrect = $request->score >= ($question->points / 2); // Simple heuristic or explicit flag

        $answer->update([
            'score' => $request->score,
            'is_correct' => $isCorrect,
            'feedback' => $request->feedback,
            'graded_by' => auth()->id(),
            'graded_at' => now(),
        ]);

        // 3. Recalculate attempt score
        $this->scoringService->recalculateTotalScore($attempt);

        return response()->json([
            'message' => 'Answer graded successfully',
            'answer' => new AttemptAnswerResource($answer->load('gradedBy')),
            'attempt_summary' => [
                'score' => $attempt->fresh()->score,
                'grading_status' => $attempt->fresh()->grading_status,
            ]
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/reviews/pending",
     *     tags={"Quiz Attempt"},
     *     summary="List all quiz attempts pending manual review",
     *     operationId="quizAttemptPendingReviews",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Pending reviews retrieved successfully"
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function pendingReviews()
    {
        $user = auth()->user();

        $query = QuizAttempt::where('grading_status', 'pending')
            ->with(['quiz', 'user']);

        // Role-based filtering
        if ($user->role !== 'admin') {
            $query->whereHas('quiz', function ($q) use ($user) {
                $q->where('created_by', $user->id);
            });
        }

        $attempts = $query->latest('completed_at')->get();

        return PendingReviewResource::collection($attempts);
    }
}
