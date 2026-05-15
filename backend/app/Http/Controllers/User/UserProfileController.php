<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserProfileController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/users/{id}/profile",
     *     tags={"User"},
     *     summary="Get public profile of a user",
     *     operationId="getUserProfile",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="User ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="User public profile"),
     *     @OA\Response(response=403, description="Profile not available"),
     *     @OA\Response(response=404, description="User not found")
     * )
     */
    public function show($id)
    {
        $user = User::with(['role'])->findOrFail($id);

        // 2. ROLE RESTRICTION (Only Quiz Maker and Normal User)
        if ($user->isAdmin()) {
            return response()->json([
                'message' => 'This profile is not available'
            ], 403);
        }

        // 4. USER STATISTICS (Exclude anonymous)
        $stats = $user->quizAttempts()
            ->where('is_anonymous', false)
            ->where('status', 'completed')
            ->select(
                DB::raw('COUNT(*) as total_attempts'),
                DB::raw('AVG(score) as average_score'),
                DB::raw('MAX(score) as highest_score')
            )
            ->first();

        // 5. QUIZ MAKER DATA
        $createdQuizzes = [];
        $totalCreated = 0;
        if ($user->isQuizMaker()) {
            $createdQuizzes = $user->quizzes()
                ->where('status', 'published')
                ->select('id', 'title', 'description', 'cover_image', 'created_at')
                ->get();
            $totalCreated = $createdQuizzes->count();
        }

        // 6. COMMUNITY DATA (Public joined communities + Private if viewer is member)
        $viewer = auth('sanctum')->user();
        $communities = $user->communities()
            ->wherePivot('status', 'approved')
            ->where(function($q) use ($viewer) {
                $q->where('visibility', 'public');
                if ($viewer) {
                    $q->orWhereHas('members', function($m) use ($viewer) {
                        $m->where('user_id', $viewer->id)->where('status', 'approved');
                    });
                }
            })
            ->select('communities.id', 'communities.name', 'communities.description', 'communities.cover_image', 'visibility')
            ->get();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'avatar' => $user->avatar,
                'role' => $user->role?->name,
                'bio' => $user->bio,
                'headline' => $user->headline,
                'location' => $user->location,
                'website' => $user->website,
                'github_handle' => $user->github_handle,
                'twitter_handle' => $user->twitter_handle,
                'linkedin_handle' => $user->linkedin_handle,
            ],
            'stats' => [
                'total_attempts' => (int) ($stats->total_attempts ?? 0),
                'average_score' => round((float) ($stats->average_score ?? 0), 2),
                'highest_score' => (float) ($stats->highest_score ?? 0),
            ],
            'quiz_maker_data' => $user->isQuizMaker() ? [
                'total_created' => $totalCreated,
                'quizzes' => $createdQuizzes
            ] : null,
            'communities' => $communities
        ]);
    }
}
