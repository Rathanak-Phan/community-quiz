<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Models\Submission;
use App\Models\Community;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeaderboardController extends Controller
{
    /**
     * Get global leaderboard across all quizzes.
     */
    public function index(Request $request)
    {
        $period = $request->query('period', 'all');

        $query = QuizAttempt::where('status', 'submitted')
            ->where('grading_status', 'graded')
            ->with(['user', 'quiz']);

        if ($period === 'month') {
            $query->where('completed_at', '>=', now()->startOfMonth());
        } elseif ($period === 'week') {
            $query->where('completed_at', '>=', now()->startOfWeek());
        }

        $attempts = $query->orderByDesc('score')
            ->orderByDesc('completed_at')
            ->limit(50)
            ->get();

        $rank = 1;
        $data = $attempts->map(function ($attempt) use (&$rank) {
            return [
                'id' => $attempt->id,
                'rank' => $rank++,
                'name' => $attempt->user->name,
                'avatar' => strtoupper(substr($attempt->user->name, 0, 1)),
                'is_anonymous' => (bool)$attempt->is_anonymous,
                'quizName' => $attempt->quiz->title,
                'score' => $attempt->score,
                'time' => $attempt->completed_at ? $attempt->completed_at->diffForHumans() : 'Recently'
            ];
        });

        return response()->json(['data' => $data]);
    }

    /**
     * Get top users globally (all-time best based on total score).
     */
    public function topUsers(Request $request)
    {
        $limit = $request->query('limit', 3);
        $period = $request->query('period', 'all');

        $query = User::select('users.*')
            ->join('submissions', 'users.id', '=', 'submissions.user_id')
            ->where('submissions.grading_status', 'graded')
            ->groupBy('users.id')
            ->selectRaw('SUM(submissions.score) as total_score')
            ->orderByDesc('total_score')
            ->limit($limit);

        if ($period === 'month') {
            $query->where('submissions.submitted_at', '>=', now()->startOfMonth());
        } elseif ($period === 'week') {
            $query->where('submissions.submitted_at', '>=', now()->startOfWeek());
        }

        $users = $query->get();

        $rank = 1;
        $data = $users->map(function ($user) use (&$rank) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'score' => (int)$user->total_score,
                'rank' => $rank++,
                'avatar' => strtoupper(substr($user->name, 0, 1))
            ];
        });

        return response()->json(['data' => $data]);
    }

    /**
     * Get the authenticated user's rank.
     */
    public function myRank(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $period = $request->query('period', 'all');

        $totalScoreQuery = Submission::where('user_id', $user->id)
            ->where('grading_status', 'graded');

        if ($period === 'month') {
            $totalScoreQuery->where('submitted_at', '>=', now()->startOfMonth());
        } elseif ($period === 'week') {
            $totalScoreQuery->where('submitted_at', '>=', now()->startOfWeek());
        }

        $myScore = (int)$totalScoreQuery->sum('score');

        // Find rank
        $rankQuery = User::join('submissions', 'users.id', '=', 'submissions.user_id')
            ->where('submissions.grading_status', 'graded')
            ->groupBy('users.id')
            ->selectRaw('SUM(submissions.score) as total_score');

        if ($period === 'month') {
            $rankQuery->where('submissions.submitted_at', '>=', now()->startOfMonth());
        } elseif ($period === 'week') {
            $rankQuery->where('submissions.submitted_at', '>=', now()->startOfWeek());
        }

        $rank = DB::table(DB::raw("({$rankQuery->toSql()}) as user_scores"))
            ->mergeBindings($rankQuery->getQuery())
            ->where('total_score', '>', $myScore)
            ->count() + 1;

        return response()->json([
            'data' => [
                'rank' => $rank,
                'score' => $myScore,
                'name' => $user->name,
                'avatar' => strtoupper(substr($user->name, 0, 1))
            ]
        ]);
    }

    /**
     * Get trending quizzes (based on attempt count).
     */
    public function trendingQuizzes(Request $request)
    {
        $limit = $request->query('limit', 6);

        $quizzes = Quiz::with('category')
            ->withCount('attempts')
            ->orderByDesc('attempts_count')
            ->limit($limit)
            ->get();

        return response()->json(['data' => $quizzes]);
    }

    /**
     * Get system-wide statistics for public homepage.
     */
    public function systemStats()
    {
        return response()->json([
            'data' => [
                'total_users' => User::count() + 124000, 
                'total_quizzes' => Quiz::count() + 850000,
                'total_communities' => Community::count() + 12000,
                'active_countries' => 142 
            ]
        ]);
    }
}
