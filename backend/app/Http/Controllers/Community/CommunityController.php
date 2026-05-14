<?php

namespace App\Http\Controllers\Community;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\CommunityMember;
use App\Services\CommunityService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CommunityController extends Controller
{
    protected $communityService;

    public function __construct(CommunityService $communityService)
    {
        $this->communityService = $communityService;
    }
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
                return $query->where('status', 'published')
                             ->where('visibility', 'public');
            })
            ->when($user, function ($query) use ($user) {
                if ($user->isAdmin()) {
                    return $query; // Admin sees everything (all status, all visibility)
                }
                
                return $query->where(function ($q) use ($user) {
                    // Published public communities
                    $q->where('status', 'published')->where('visibility', 'public')
                      // OR Private communities where user is a member
                      ->orWhere(function ($sq) use ($user) {
                          $sq->where('status', 'published')
                            ->where('visibility', 'private')
                            ->whereHas('members', function ($m) use ($user) {
                                $m->where('user_id', $user->id)
                                  ->where('status', 'approved');
                            });
                      })
                      // OR User's own communities (even if draft or private)
                      ->orWhere('created_by', $user->id);
                });
            })
            ->withCount('members')
            ->get();

        return response()->json($communities);
    }

    public function myCommunities()
    {
        $user = auth()->user();
        
        $communities = Community::whereHas('members', function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->where('status', 'approved');
            })
            ->withCount('members')
            ->get();

        return response()->json([
            'data' => $communities
        ]);
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
            'status' => 'required|in:draft,published',
            'cover_image' => 'nullable|mimes:jpg,jpeg,png|max:2048'
        ]);

        $community = $this->communityService->createCommunity(
            $request->all() + ['cover_image' => $request->file('cover_image')],
            auth()->id()
        );

        return response()->json($community, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Community $community)
    {
        $user = auth('sanctum')->user();

        // Draft check
        if ($community->status === 'draft') {
            if (!$user || ($community->created_by !== $user->id && !$user->isAdmin())) {
                return response()->json(['message' => 'Community is in draft mode'], 403);
            }
        }

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

            if (!$isMember && !$user->isAdmin() && $community->created_by !== $user->id) {
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

            if (!$isMember && !$user->isAdmin()) {
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
            'status' => 'required|in:draft,published',
            'cover_image' => 'nullable|mimes:jpg,jpeg,png|max:2048'
        ]);

        $data = [
            'name' => $request->name,
            'description' => $request->description,
            'visibility' => $request->visibility,
            'status' => $request->status,
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

        $result = $this->communityService->joinCommunity($community, $user->id);

        return response()->json([
            'message' => $result['message'],
            'status' => $result['status']
        ]);
    }

    public function joinByCode(Request $request)
    {
        $request->validate([
            'invite_code' => 'required|string'
        ]);

        $community = Community::where('invite_code', $request->invite_code)->first();

        if (!$community) {
            return response()->json(['message' => 'Invalid invite code'], 404);
        }

        if ($community->status === 'draft') {
            return response()->json(['message' => 'This community is currently in draft mode and cannot be joined via invite code.'], 403);
        }

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

        // When joining by code, it's always approved instantly (since it's an invite)
        CommunityMember::create([
            'community_id' => $community->id,
            'user_id' => $user->id,
            'role' => 'member',
            'status' => 'approved'
        ]);

        return response()->json([
            'message' => 'Joined community successfully via invite code',
            'status' => 'approved',
            'community_id' => $community->id
        ]);
    }

    public function regenerateInviteCode(Community $community)
    {
        if ($community->created_by !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $community->update([
            'invite_code' => Str::random(8)
        ]);

        return response()->json([
            'message' => 'Invite code regenerated',
            'invite_code' => $community->invite_code
        ]);
    }

    public function leave(Community $community)
    {
        $user = auth()->user();

        $member = CommunityMember::where([
            'community_id' => $community->id,
            'user_id' => $user->id
        ])->first();

        if (!$member) {
            return response()->json([
                'message' => 'Not a member of this community'
            ], 400);
        }

        // Owner cannot leave, they must delete the community
        if ($community->created_by === $user->id) {
            return response()->json([
                'message' => 'As the owner, you cannot leave. You must delete the community instead.'
            ], 400);
        }

        $member->delete();

        return response()->json([
            'message' => 'Left community successfully'
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
        if ($member->community->created_by !== auth()->id()) {
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

        if ($member->community->created_by !== auth()->id()) {
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
        if ($community->created_by !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $pendingMembers = $community->members()
            ->where('status', 'pending')
            ->with('user:id,name,email')
            ->get();

        return response()->json($pendingMembers);
    }
}
