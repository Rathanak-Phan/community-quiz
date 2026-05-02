<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;

use App\Models\Category;
use App\Models\Quiz;
use App\Models\Community;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/dashboard/quiz-maker",
     *     tags={"Dashboard"},
     *     summary="Get statistics for Quiz Maker dashboard",
     *     operationId="dashboardQuizMaker",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Dashboard statistics retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="total_categories", type="integer"),
     *             @OA\Property(property="total_quizzes", type="integer"),
     *             @OA\Property(property="total_communities", type="integer"),
     *             @OA\Property(property="total_submissions", type="integer"),
     *             @OA\Property(property="pending_reviews", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function quizMakerDashboard()
    {
        $userId = auth()->id();

        // 1. Total categories created by user
        $totalCategories = Category::where('user_id', $userId)->count();

        // 2. Total quizzes created
        $totalQuizzes = Quiz::where('created_by', $userId)->count();

        // 3. Total communities owned
        $totalCommunities = Community::where('created_by', $userId)->count();

        // Get IDs of quizzes created by user for nested counts
        $quizIds = Quiz::where('created_by', $userId)->pluck('id');

        // 4. Total quiz submissions (on quizzes created by user)
        $totalSubmissions = QuizAttempt::whereIn('quiz_id', $quizIds)
            ->where('status', 'submitted')
            ->count();

        // 5. Pending short-answer reviews
        $pendingReviews = QuizAttempt::whereIn('quiz_id', $quizIds)
            ->where('grading_status', 'pending')
            ->count();

        return response()->json([
            'total_categories' => $totalCategories,
            'total_quizzes' => $totalQuizzes,
            'total_communities' => $totalCommunities,
            'total_submissions' => $totalSubmissions,
            'pending_reviews' => $pendingReviews,
        ]);
    }
}
