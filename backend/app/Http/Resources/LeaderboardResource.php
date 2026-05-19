<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaderboardResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $username = $this->is_anonymous ? ($this->anonymous_name ?: 'Anonymous') : ($this->user ? $this->user->name : 'Guest');
        $avatar = null;

        if ($this->user && $this->user->avatar) {
            $avatar = $this->user->avatar;
        } elseif ($this->is_anonymous || !$this->user) {
            $avatar = 'https://api.dicebear.com/7.x/adventurer/svg?seed=' . urlencode($username);
        } else {
            $avatar = strtoupper(substr($username, 0, 1));
        }

        return [
            'rank' => $this->rank,
            'username' => $username,
            'avatar' => $avatar,
            'score' => $this->score,
            'submitted_at' => $this->completed_at,
        ];
    }
}
