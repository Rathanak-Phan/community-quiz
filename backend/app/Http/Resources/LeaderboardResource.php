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
        return [
            'rank' => $this->rank,
            'username' => $this->is_anonymous ? 'Anonymous' : $this->user->name,
            'score' => $this->score,
            'submitted_at' => $this->completed_at,
        ];
    }
}
