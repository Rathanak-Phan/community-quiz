<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommunityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'visibility' => $this->visibility,
            'cover_image' => $this->cover_image,
            'created_by' => $this->created_by,
            'creator' => [
                'id' => $this->creator?->id,
                'name' => $this->creator?->name,
            ],
            'members_count' => $this->whenCounted('members'),
            'created_at' => $this->created_at,
        ];
    }
}
