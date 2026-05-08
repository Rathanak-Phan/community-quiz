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
            'created_at' => $this->created_at,
            'creator' => [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
            ],
            'time_limit' => $this->time_limit,
            'attempts_count' => $this->attempts()->count(),
            'questions_count' => $this->questions()->count(),
            'is_favorite' => auth('sanctum')->check() && $this->favorites()->where('user_id', auth('sanctum')->id())->exists(),
            'favorite_id' => auth('sanctum')->check() ? $this->favorites()->where('user_id', auth('sanctum')->id())->first()?->id : null,
            'questions' => QuestionResource::collection($this->whenLoaded('questions')),
        ];
    }
}
