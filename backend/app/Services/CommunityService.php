<?php

namespace App\Services;

use App\Models\Community;
use App\Models\CommunityMember;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CommunityService
{
    /**
     * Create a new community and assign the owner.
     */
    public function createCommunity(array $data, int $userId): Community
    {
        $path = null;
        if (isset($data['cover_image'])) {
            $path = $data['cover_image']->store('communities', 'public');
        }

        $community = Community::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'visibility' => $data['visibility'],
            'status' => $data['status'] ?? 'published',
            'created_by' => $userId,
            'cover_image' => $path,
            'invite_code' => Str::random(8)
        ]);

        // Attach owner
        $community->users()->attach($userId, [
            'role' => 'owner',
            'status' => 'approved'
        ]);

        return $community;
    }

    /**
     * Handle join request for a community.
     */
    public function joinCommunity(Community $community, int $userId): array
    {
        // Public or private
        $status = $community->visibility === 'public' ? 'approved' : 'pending';

        CommunityMember::create([
            'community_id' => $community->id,
            'user_id' => $userId,
            'role' => 'member',
            'status' => $status
        ]);

        return [
            'status' => $status,
            'message' => $status === 'approved' ? 'Joined successfully' : 'Join request sent'
        ];
    }
}
