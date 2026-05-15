<?php

namespace App\Http\Controllers\Quiz;

use App\Http\Controllers\Controller;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Submission;
use App\Models\Answer;
use App\Models\AttemptAnswer;
use App\Models\Question;
use App\Http\Requests\QuizAttempt\StartQuizAttemptRequest;
use App\Http\Requests\QuizAttempt\SubmitAnswerRequest;
use App\Http\Resources\QuizAttemptResource;
use App\Http\Resources\QuizAttemptDetailResource;
use App\Http\Resources\AttemptAnswerResource;
use App\Http\Resources\PendingReviewResource;
use App\Http\Resources\QuestionReviewResource;
use App\Services\QuizScoringService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class QuizAttemptController extends Controller
{
    protected $scoringService;

    public function __construct(QuizScoringService $scoringService)
    {
        $this->scoringService = $scoringService;
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
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"mode", "is_anonymous"},
     *             @OA\Property(property="mode", type="string", enum={"practice", "scored"}),
     *             @OA\Property(property="is_anonymous", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Attempt started"),
     *     @OA\Response(response=409, description="Active attempt exists")
     * )
     */
    public function start(StartQuizAttemptRequest $request, Quiz $quiz)
    {
        $this->authorize('view', $quiz);
        $user = auth()->user();

        // Prevent multiple active attempts
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
     *     summary="Submit or update an answer (Save for later)",
     *     operationId="quizAttemptSubmitAnswer",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="attempt", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"question_id"},
     *             @OA\Property(property="question_id", type="integer"),
     *             @OA\Property(property="selected_option_id", type="integer", nullable=true),
     *             @OA\Property(property="answer_boolean", type="boolean", nullable=true),
     *             @OA\Property(property="answer_text", type="string", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Answer saved")
     * )
     */
    public function submitAnswer(SubmitAnswerRequest $request, QuizAttempt $attempt)
    {
        if ($attempt->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        if ($attempt->status !== 'in_progress') {
            return response()->json(['message' => 'This attempt is not active.'], Response::HTTP_FORBIDDEN);
        }

        $answer = AttemptAnswer::updateOrCreate(
            ['quiz_attempt_id' => $attempt->id, 'question_id' => $request->question_id],
            $request->validated()
        );

        return new AttemptAnswerResource($answer);
    }

    /**
     * @OA\Post(
     *     path="/api/attempts/{attempt}/submit",
     *     tags={"Quiz Attempt"},
     *     summary="Submit a quiz attempt for scoring",
     *     operationId="quizAttemptSubmit",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="attempt", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Attempt submitted")
     * )
     */
    public function submit(Request $request, QuizAttempt $attempt)
    {
        if ($attempt->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        if ($attempt->status !== 'in_progress') {
            return response()->json(['message' => 'This attempt is already submitted.'], Response::HTTP_FORBIDDEN);
        }

        return DB::transaction(function () use ($attempt, $request) {
            // 1. Calculate score
            $results = $this->scoringService->calculateScore($attempt);

            // 2. Update attempt status
            $updateData = [
                'status' => 'submitted',
                'score' => $results['total_score'],
                'max_score' => $results['max_score'],
                'grading_status' => $results['grading_status'],
                'completed_at' => now(),
            ];

            if ($request->has('is_anonymous')) {
                $updateData['is_anonymous'] = $request->boolean('is_anonymous');
                $attempt->is_anonymous = $updateData['is_anonymous']; // For immediate use below
            }

            $attempt->update($updateData);

            // 3. Create permanent Submission record if in scored mode
            if ($attempt->mode === 'scored') {
                $submission = Submission::create([
                    'quiz_id' => $attempt->quiz_id,
                    'user_id' => $attempt->user_id,
                    'quiz_attempt_id' => $attempt->id,
                    'score' => $results['total_score'],
                    'max_score' => $results['max_score'],
                    'grading_status' => $results['grading_status'],
                    'is_anonymous' => $attempt->is_anonymous,
                    'submitted_at' => now(),
                ]);

                // 4. Save individual answers to permanent table
                foreach ($attempt->answers as $attemptAnswer) {
                    Answer::create([
                        'submission_id' => $submission->id,
                        'question_id' => $attemptAnswer->question_id,
                        'selected_option_id' => $attemptAnswer->selected_option_id,
                        'selected_options' => $attemptAnswer->selected_options,
                        'answer_boolean' => $attemptAnswer->answer_boolean,
                        'answer_text' => $attemptAnswer->answer_text,
                        'is_correct' => $attemptAnswer->is_correct,
                        'score' => $attemptAnswer->score,
                    ]);
                }
            }

            return new QuizAttemptDetailResource($attempt->load(['quiz.questions.options', 'answers.question.shortAnswer']));
        });
    }

    /**
     * @OA\Get(
     *     path="/api/attempts/{attempt}",
     *     tags={"Quiz Attempt"},
     *     summary="Get attempt details for resuming",
     *     operationId="quizAttemptShow",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="attempt", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Attempt details")
     * )
     */
    public function show(QuizAttempt $attempt)
    {
        $user = auth()->user();

        // Authorization: Owner, Admin, or Quiz Creator
        if ($attempt->user_id != $user->id && 
            !$user->isAdmin() && 
            $attempt->quiz->created_by != $user->id) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        $attempt->load(['quiz.questions.options', 'answers.question.shortAnswer']);
        return new QuizAttemptDetailResource($attempt);
    }

    /**
     * @OA\Put(
     *     path="/api/answers/{id}/grade",
     *     tags={"Quiz Attempt"},
     *     summary="Grade a specific answer manually",
     *     operationId="quizAttemptGradeAnswerManual",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"score"},
     *             @OA\Property(property="score", type="integer"),
     *             @OA\Property(property="feedback", type="string", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Answer graded")
     * )
     */
    public function gradeAnswer(Request $request, $id)
    {
        $user = auth()->user();
        $request->validate([
            'score' => 'required|integer|min:0',
            'is_correct' => 'nullable|boolean',
            'feedback' => 'nullable|string',
        ]);

        $attemptAnswer = AttemptAnswer::findOrFail($id);
        $attempt = $attemptAnswer->attempt;
        
        // Authorization: Admin or Quiz Creator
        if (!$user->isAdmin() && $attempt->quiz->created_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        $question = $attemptAnswer->question;
        
        if ($request->score > $question->points) {
            return response()->json([
                'message' => "Score cannot exceed maximum points ({$question->points})"
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        
        // Use provided is_correct or calculate based on score (>= 50% is correct)
        $isCorrect = $request->has('is_correct') 
            ? $request->boolean('is_correct') 
            : ($request->score >= ($question->points / 2));

        $attemptAnswer->update([
            'score' => $request->score,
            'is_correct' => $isCorrect,
            'feedback' => $request->feedback,
            'graded_by' => auth()->id(),
            'graded_at' => now(),
        ]);

        // Also update corresponding permanent Answer record if it exists
        $submission = Submission::where('quiz_attempt_id', $attempt->id)->first();
        if ($submission) {
            $answer = Answer::where('submission_id', $submission->id)
                ->where('question_id', $attemptAnswer->question_id)
                ->first();
            if ($answer) {
                $answer->update([
                    'score' => $request->score,
                    'is_correct' => $isCorrect,
                    'feedback' => $request->feedback,
                    'graded_by' => auth()->id(),
                    'graded_at' => now(),
                ]);
            }
        }

        // Recalculate total scores
        $this->scoringService->recalculateTotalScore($attempt);

        return response()->json([
            'message' => 'Answer graded successfully',
            'answer' => new AttemptAnswerResource($attemptAnswer->load('question')),
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
     *     @OA\Response(response=200, description="Pending reviews")
     * )
     */
    public function pendingReviews(Request $request)
    {
        $user = auth()->user();
        $query = QuizAttempt::where('grading_status', 'pending');

        if (!$user->isAdmin()) {
            $query->whereHas('quiz', fn($q) => $q->where('created_by', $user->id));
        }

        return PendingReviewResource::collection($query->with(['quiz', 'user'])->latest('completed_at')->paginate($request->query('per_page', 10)));
    }

    /**
     * Get review details for a completed attempt.
     */
    public function review(QuizAttempt $attempt)
    {
        $user = auth()->user();

        // Authorization: Owner, Admin, or Quiz Creator
        if ($attempt->user_id != $user->id && 
            !$user->isAdmin() && 
            $attempt->quiz->created_by != $user->id) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        $attempt->load(['quiz.questions.options', 'answers.question.options', 'answers.question.shortAnswer']);
        return new QuizAttemptDetailResource($attempt);
    }

    /**
     * @OA\Get(
     *     path="/api/my-attempts",
     *     tags={"Quiz Attempt"},
     *     summary="List current user's in-progress attempts",
     *     operationId="quizAttemptMyAttempts",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="In-progress attempts")
     * )
     */
    public function myAttempts()
    {
        $attempts = QuizAttempt::where('user_id', auth()->id())
            ->where('status', 'in_progress')
            ->with(['quiz'])
            ->latest('started_at')
            ->get();

        return QuizAttemptResource::collection($attempts);
    }

    /**
     * @OA\Get(
     *     path="/api/my-submissions",
     *     tags={"Quiz Attempt"},
     *     summary="List current user's past submissions",
     *     operationId="quizAttemptMySubmissions",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Past submissions")
     * )
     */
    public function mySubmissions()
    {
        $submissions = Submission::where('user_id', auth()->id())
            ->with(['quiz'])
            ->latest('submitted_at')
            ->get();

        // We can reuse a resource or return raw. Let's use a simple map for now or create a resource.
        return response()->json([
            'data' => $submissions
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/quizzes/{quiz}/attempts",
     *     tags={"Quiz Attempt"},
     *     summary="List all attempts for a specific quiz (for Quiz Maker/Admin)",
     *     operationId="quizAttemptIndexByQuiz",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="quiz", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Quiz attempts")
     * )
     */
    public function indexByQuiz(Quiz $quiz)
    {
        $user = auth()->user();

        // Authorization: Admin or Quiz Creator
        if (!$user->isAdmin() && $quiz->created_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        $attempts = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('status', 'submitted')
            ->with(['user'])
            ->latest('completed_at')
            ->get();

        return QuizAttemptResource::collection($attempts);
    }
}

