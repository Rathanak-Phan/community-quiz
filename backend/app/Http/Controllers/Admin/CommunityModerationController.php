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
    public function index()
    {
        $communities = Community::with(['creator'])->latest()->get();
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
