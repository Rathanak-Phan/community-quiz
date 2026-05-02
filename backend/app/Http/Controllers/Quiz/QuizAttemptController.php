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
    public function submit(QuizAttempt $attempt)
    {
        if ($attempt->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        if ($attempt->status !== 'in_progress') {
            return response()->json(['message' => 'This attempt is already submitted.'], Response::HTTP_FORBIDDEN);
        }

        return DB::transaction(function () use ($attempt) {
            // 1. Calculate score
            $results = $this->scoringService->calculateScore($attempt);

            // 2. Update attempt status
            $attempt->update([
                'status' => 'submitted',
                'score' => $results['total_score'],
                'max_score' => $results['max_score'],
                'grading_status' => $results['grading_status'],
                'completed_at' => now(),
            ]);

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
                        'answer_boolean' => $attemptAnswer->answer_boolean,
                        'answer_text' => $attemptAnswer->answer_text,
                        'is_correct' => $attemptAnswer->is_correct,
                        'score' => $attemptAnswer->score,
                    ]);
                }
            }

            return new QuizAttemptDetailResource($attempt->load(['quiz.questions.options', 'answers']));
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
        if ($attempt->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        $attempt->load(['quiz.questions.options', 'answers']);
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
        $request->validate([
            'score' => 'required|integer|min:0',
            'feedback' => 'nullable|string',
        ]);

        $attemptAnswer = AttemptAnswer::findOrFail($id);
        $attempt = $attemptAnswer->attempt;
        
        // Authorization: Admin or Quiz Creator
        if (auth()->user()->role !== 'admin' && $attempt->quiz->created_by !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        $question = $attemptAnswer->question;
        $isCorrect = $request->score >= ($question->points / 2);

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
    public function pendingReviews()
    {
        $user = auth()->user();
        $query = QuizAttempt::where('grading_status', 'pending');

        if ($user->role !== 'admin') {
            $query->whereHas('quiz', fn($q) => $q->where('created_by', $user->id));
        }

        return PendingReviewResource::collection($query->with(['quiz', 'user'])->latest('completed_at')->get());
    }
}

