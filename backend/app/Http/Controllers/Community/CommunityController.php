<?php

namespace App\Http\Controllers\Community;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\CommunityMember;
use Illuminate\Http\Request;

class CommunityController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @OA\Get(
     *     path="/api/communities",
     *     tags={"Community"},
     *     summary="Get all communities",
     *     operationId="communityIndex",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Communities retrieved successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    public function index()
    {
        $user = auth('sanctum')->user();

        $communities = Community::with('creator:id,name,email')
            ->when(!$user, function ($query) {
                return $query->where('visibility', 'public');
            })
            ->when($user, function ($query) use ($user) {
                if ($user->role === 'admin') return $query;
                
                return $query->where('visibility', 'public')
                    ->orWhere(function ($q) use ($user) {
                        $q->where('visibility', 'private')
                          ->whereHas('members', function ($m) use ($user) {
                              $m->where('user_id', $user->id)
                                ->where('status', 'approved');
                          });
                    });
            })
            ->withCount('members')
            ->get();

        return response()->json($communities);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @OA\Post(
     *     path="/api/communities",
     *     tags={"Community"},
     *     summary="Create a community",
     *     operationId="communityStore",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"name","visibility"},
     *                 @OA\Property(property="name", type="string", maxLength=255, example="General Knowledge Club"),
     *                 @OA\Property(property="description", type="string", nullable=true, example="A community for quiz lovers."),
     *                 @OA\Property(property="visibility", type="string", enum={"public","private"}, example="public"),
     *                 @OA\Property(property="cover_image", type="string", format="binary", nullable=true)
     *             )
     *         )
     *     ),
     *     @OA\Response(response=201, description="Community created successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'visibility' => 'required|in:public,private',
            'cover_image' => 'nullable|mimes:jpg,jpeg,png|max:2048'
        ]);

        $path = null;

        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')
                ->store('communities', 'public');
        }

        $community = Community::create([
            'name' => $request->name,
            'description' => $request->description,
            'visibility' => $request->visibility,
            'created_by' => auth()->id(),
            'cover_image' => $path
        ]);

        // Attach owner (IMPORTANT)
        $community->users()->attach(auth()->id(), [
            'role' => 'owner',
            'status' => 'approved'
        ]);

        return response()->json($community, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Community $community)
    {
        $user = auth('sanctum')->user();

        // Guest check
        if (!$user && $community->visibility === 'private') {
            return response()->json(['message' => 'Unauthenticated or Private Community'], 401);
        }

        // Auth check (if private, must be member or admin)
        if ($user && $community->visibility === 'private') {
            $isMember = $community->members()
                ->where('user_id', $user->id)
                ->where('status', 'approved')
                ->exists();

            if (!$isMember && $user->role !== 'admin') {
                return response()->json(['message' => 'Access Denied'], 403);
            }
        }

        return response()->json($community->load(['creator:id,name', 'members.user:id,name']));
    }

    public function quizzes(Community $community)
    {
        $user = auth('sanctum')->user();

        // Visibility check
        if ($community->visibility === 'private') {
            if (!$user) return response()->json(['message' => 'Unauthorized'], 401);
            
            $isMember = $community->members()
                ->where('user_id', $user->id)
                ->where('status', 'approved')
                ->exists();

            if (!$isMember && $user->role !== 'admin') {
                return response()->json(['message' => 'Access Denied'], 403);
            }
        }

        $quizzes = $community->quizzes()
            ->with(['category', 'creator:id,name'])
            ->withCount('attempts')
            ->get();

        return response()->json([
            'data' => $quizzes
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Community $community)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @OA\Put(
     *     path="/api/communities/{community}",
     *     tags={"Community"},
     *     summary="Update a community",
     *     operationId="communityUpdate",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="community",
     *         in="path",
     *         required=true,
     *         description="Community ID",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"name","visibility"},
     *                 @OA\Property(property="name", type="string", maxLength=255, example="Updated Community"),
     *                 @OA\Property(property="description", type="string", nullable=true, example="Updated description."),
     *                 @OA\Property(property="visibility", type="string", enum={"public","private"}, example="private"),
     *                 @OA\Property(property="cover_image", type="string", format="binary", nullable=true)
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Community updated successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Community not found")
     * )
     */
    public function update(Request $request, Community $community)
    {
        $this->authorize('update', $community);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'visibility' => 'required|in:public,private',
            'cover_image' => 'nullable|mimes:jpg,jpeg,png|max:2048'
        ]);

        $data = [
            'name' => $request->name,
            'description' => $request->description,
            'visibility' => $request->visibility,
        ];

        // Handle image
        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')
                ->store('communities', 'public');
        }

        $community->update($data);

        return response()->json([
            'message' => 'Community updated successfully',
            'data' => $community
        ]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @OA\Delete(
     *     path="/api/communities/{community}",
     *     tags={"Community"},
     *     summary="Delete a community",
     *     operationId="communityDestroy",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="community",
     *         in="path",
     *         required=true,
     *         description="Community ID",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Community deleted successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Community not found")
     * )
     */
    public function destroy(Community $community)
    {
        $this->authorize('delete', $community);

        $community->delete();

        return response()->json([
            'message' => 'Community deleted successfully'
        ]);
    }

    // join community
    /**
     * @OA\Post(
     *     path="/api/communities/{community}/join",
     *     tags={"Community"},
     *     summary="Join or request to join a community",
     *     operationId="communityJoin",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="community",
     *         in="path",
     *         required=true,
     *         description="Community ID",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Joined successfully or join request sent"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Community not found")
     * )
     */
    public function join(Community $community)
    {
        $user = auth()->user();

        // check already joined/requested
        $exits = CommunityMember::where([
            'community_id' => $community->id,
            'user_id' => $user->id
        ])->first();

        if ($exits) {
            return response()->json([
                'message' => 'Already joined or requested'
            ], 400);
        }

        // Public or private
        $status = $community->visibility === 'public'
            ? 'approved'
            : 'pending';

        CommunityMember::create([
            'community_id' => $community->id,
            'user_id' => $user->id,
            'role' => 'member',
            'status' => $status
        ]);

        return response()->json([
            'message' => $status === 'approved'
                ? 'Joined successfully'
                : 'Join request sent'
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/community-members/{id}/approve",
     *     tags={"Community"},
     *     summary="Approve a community member",
     *     operationId="communityApproveMember",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Community member ID",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Member approved"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Community member not found")
     * )
     */
    public function approve($id)
    {
        $member = CommunityMember::findOrFail($id);

        // Only owner can approve
        if ($member->community->owner_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $member->update([
            'status' => 'approved'
        ]);

        return response([
            'message' => 'Member approved'
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/community-members/{id}/reject",
     *     tags={"Community"},
     *     summary="Reject a community member",
     *     operationId="communityRejectMember",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Community member ID",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Member rejected"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Community member not found")
     * )
     */
    public function reject($id)
    {
        $member = CommunityMember::findOrFail($id);

        if ($member->community->owner_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $member->update([
            'status' => 'rejected'
        ]);

        return response()->json([
            'message' => 'Member rejected'
        ]);
    }

    public function pendingMembers(Community $community)
    {
        // Only owner can see pending members
        if ($community->creator->id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $pendingMembers = $community->members()
            ->where('status', 'pending')
            ->with('user:id,name,email')
            ->get();

        return response()->json($pendingMembers);
    }
}
