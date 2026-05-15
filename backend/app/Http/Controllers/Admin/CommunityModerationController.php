<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Http\Resources\CommunityResource;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CommunityModerationController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/admin/communities",
     *     tags={"Admin Moderation"},
     *     summary="List all communities for moderation",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="List of all communities")
     * )
     */
    public function index(Request $request)
    {
        $query = Community::with(['creator']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('creator', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('visibility')) {
            $query->where('visibility', $request->visibility);
        }

        $communities = $query->latest()->paginate($request->query('per_page', 10));
        return CommunityResource::collection($communities);
    }

    /**
     * @OA\Delete(
     *     path="/api/admin/communities/{id}",
     *     tags={"Admin Moderation"},
     *     summary="Delete a community for moderation",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Community deleted")
     * )
     */
    public function destroy($id)
    {
        $community = Community::findOrFail($id);
        
        // Log deletion
        // \Log::info("Community ID {$id} deleted by Admin ID " . auth()->id());

        $community->delete();

        return response()->json([
            'message' => 'Community deleted successfully for moderation'
        ]);
    }
}
