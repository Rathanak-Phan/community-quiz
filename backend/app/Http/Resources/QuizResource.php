<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,

            'community' => [
                'id' => $this->community->id,
                'name' => $this->community->name,
                'visibility' => $this->community->visibility,
            ],
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->name,
            ],
            'category_id' => $this->category_id,
            'community_id' => $this->community_id,
            'cover_image' => $this->cover_image,
            'created_by' => $this->created_by,
            'status' => $this->status,
            'has_timer' => (bool)$this->has_timer,
            'default_time_limit' => $this->default_time_limit,
            'created_at' => $this->created_at,
            'creator' => [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
                'role' => $this->creator->role?->name,
            ],
            'attempts_count' => $this->attempts_count ?? $this->attempts()->count(),
            'questions_count' => $this->questions_count ?? $this->questions()->count(),
            'total_time' => $this->questions->sum(function($q) {
                if ($q->time_limit > 0) return $q->time_limit;
                return $this->has_timer ? ($this->default_time_limit ?: 30) : 0;
            }),
            'is_favorite' => auth('sanctum')->check() && $this->favorites()->where('user_id', auth('sanctum')->id())->exists(),
            'favorite_id' => auth('sanctum')->check() ? $this->favorites()->where('user_id', auth('sanctum')->id())->first()?->id : null,
            'questions' => QuestionResource::collection($this->whenLoaded('questions')),
        ];
    }
}
