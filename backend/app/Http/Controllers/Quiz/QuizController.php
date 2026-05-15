<?php

namespace App\Http\Controllers\Quiz;

use App\Http\Controllers\Controller;
use App\Http\Requests\Quiz\StoreQuizRequest;
use App\Http\Requests\Quiz\UpdateQuizRequest;
use App\Http\Resources\QuizResource;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Services\QuizService;
use App\Http\Resources\LeaderboardResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class QuizController extends Controller
{
    protected $quizService;

    public function __construct(QuizService $quizService)
    {
        $this->quizService = $quizService;
    }

    /**
     * @OA\Get(
     *     path="/api/quizzes/{quiz}",
     *     tags={"Quiz"},
     *     summary="Get a quiz",
     *     operationId="quizShow",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="quiz",
     *         in="path",
     *         required=true,
     *         description="Quiz ID",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Quiz retrieved successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Quiz not found")
     * )
     */
    public function show(Quiz $quiz)
    {
        $user = auth('sanctum')->user();

        // Draft check
        if ($quiz->status === 'draft') {
            if (!$user || ($quiz->created_by !== $user->id && !$user->isAdmin())) {
                abort(403, 'Quiz is in draft mode');
            }
        }

        if (\Illuminate\Support\Facades\Gate::forUser($user)->denies('view', $quiz)) {
            abort(403);
        }

        return new QuizResource($quiz->loadMissing(['community', 'category', 'creator.role']));
    }

    /**
     * @OA\Post(
     *     path="/api/quizzes",
     *     tags={"Quiz"},
     *     summary="Create a quiz",
     *     operationId="quizStore",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"title","category_id","community_id"},
     *                 @OA\Property(property="title", type="string", maxLength=255, example="World History Quiz"),
     *                 @OA\Property(property="category_id", type="integer", example=1),
     *                 @OA\Property(property="community_id", type="integer", example=1),
     *                 @OA\Property(property="description", type="string", nullable=true, example="A short quiz about world history."),
     *                 @OA\Property(property="cover_image", type="string", format="binary", nullable=true)
     *             )
     *         )
     *     ),
     *     @OA\Response(response=201, description="Quiz created successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    public function store(StoreQuizRequest $request)
    {
        $this->authorize('create', Quiz::class);

        $quiz = $this->quizService->create(
            $request->validated(),
            auth()->user()
        );

        return (new QuizResource($quiz->loadMissing(['community', 'category', 'creator.role'])))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * @OA\Get(
     *     path="/api/quizzes",
     *     tags={"Quiz"},
     *     summary="Get quizzes visible to the authenticated user",
     *     operationId="quizIndex",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Quizzes retrieved successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    /**
     * Get quizzes created by the authenticated user.
     */
    public function myQuizzes()
    {
        $user = auth()->user();
        $quizzes = Quiz::where('created_by', $user->id)
            ->with(['community', 'category', 'creator.role'])
            ->latest()
            ->get();

        return QuizResource::collection($quizzes);
    }

    public function index(Request $request)
    {
        $user = auth('sanctum')->user();

        $quizzes = Quiz::with(['community', 'category', 'creator.role'])
            ->when(!$user, function ($query) {
                // Guests see only published quizzes in public communities
                return $query->where('status', 'published')
                    ->whereHas('community', function ($q) {
                        $q->where('visibility', 'public')->where('status', 'published');
                    });
            })
            ->when($user, function ($query) use ($user) {
                if ($user->isAdmin()) return $query; // Admin sees everything

                return $query->where(function ($q) use ($user) {
                    // Own quizzes (any status, any community)
                    $q->where('created_by', $user->id)
                      // OR Published quizzes in visible communities
                      ->orWhere(function ($q2) use ($user) {
                          $q2->where('status', 'published')
                             ->whereHas('community', function ($qc) use ($user) {
                                 $qc->where('status', 'published')
                                    ->where(function ($qvis) use ($user) {
                                        $qvis->where('visibility', 'public')
                                             ->orWhereHas('members', function ($m) use ($user) {
                                                 $m->where('user_id', $user->id)
                                                   ->where('status', 'approved');
                                             });
                                    });
                             });
                      });
                });
            })->get();

        return QuizResource::collection($quizzes);
    }

    /**
     * @OA\Put(
     *     path="/api/quizzes/{quiz}",
     *     tags={"Quiz"},
     *     summary="Update a quiz",
     *     operationId="quizUpdatePut",
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
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="title", type="string", maxLength=255, example="Updated World History Quiz"),
     *                 @OA\Property(property="category_id", type="integer", example=1),
     *                 @OA\Property(property="community_id", type="integer", example=1),
     *                 @OA\Property(property="description", type="string", nullable=true, example="Updated quiz description."),
     *                 @OA\Property(property="cover_image", type="string", format="binary", nullable=true)
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Quiz updated successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Quiz not found")
     * )
     *
     * @OA\Post(
     *     path="/api/quizzes/{quiz}",
     *     tags={"Quiz"},
     *     summary="Update a quiz with multipart/form-data",
     *     operationId="quizUpdatePost",
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
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="title", type="string", maxLength=255, example="Updated World History Quiz"),
     *                 @OA\Property(property="category_id", type="integer", example=1),
     *                 @OA\Property(property="community_id", type="integer", example=1),
     *                 @OA\Property(property="description", type="string", nullable=true, example="Updated quiz description."),
     *                 @OA\Property(property="cover_image", type="string", format="binary", nullable=true)
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Quiz updated successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Quiz not found")
     * )
     */
    public function update(UpdateQuizRequest $request, Quiz $quiz)
    {
        $this->authorize('update', $quiz);

        $quiz = $this->quizService->update($quiz, $request->validated(), auth()->user());

        return new QuizResource($quiz->loadMissing(['community', 'category', 'creator.role']));
    }

    /**
     * @OA\Delete(
     *     path="/api/quizzes/{quiz}",
     *     tags={"Quiz"},
     *     summary="Delete a quiz",
     *     operationId="quizDestroy",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="quiz",
     *         in="path",
     *         required=true,
     *         description="Quiz ID",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Quiz deleted successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Quiz not found")
     * )
     */
    public function destroy(Quiz $quiz)
    {
        $this->authorize('delete', $quiz);

        if ($quiz->cover_image) {
            Storage::disk('public')->delete($quiz->cover_image);
        }

        $quiz->delete();

        return response()->json(['message' => 'Deleted']);
    }

    /**
     * @OA\Get(
     *     path="/api/quizzes/{quiz}/leaderboard",
     *     tags={"Quiz"},
     *     summary="Get quiz leaderboard",
     *     operationId="quizLeaderboard",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="quiz",
     *         in="path",
     *         required=true,
     *         description="Quiz ID",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Leaderboard retrieved successfully",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/LeaderboardEntry"))
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Quiz not found")
     * )
     */
    public function applyDefaultTimer(Quiz $quiz)
    {
        $this->authorize('update', $quiz);

        if (!$quiz->has_timer) {
            return response()->json(['message' => 'Timer is not enabled for this quiz'], 400);
        }

        $quiz->questions()->update(['time_limit' => $quiz->default_time_limit]);

        return response()->json(['message' => 'Applied to all questions']);
    }

    public function leaderboard(Quiz $quiz)
    {
        $attempts = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('status', 'submitted')
            ->where('grading_status', 'graded')
            ->with('user')
            ->orderByDesc('score')
            ->orderByDesc('completed_at') // Tie-breaker: latest submission first per scope
            ->get();

        $rank = 1;
        $leaderboard = $attempts->map(function ($attempt) use (&$rank) {
            $attempt->rank = $rank++;
            return $attempt;
        });

        return LeaderboardResource::collection($leaderboard);
    }
}
