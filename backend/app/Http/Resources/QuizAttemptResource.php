<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizAttemptResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = auth()->user();
        $isOwner = $user && $user->id === $this->user_id;
        $isAdmin = $user && $user->isAdmin();
        
        $userData = null;
        if ($this->relationLoaded('user')) {
            if ($this->is_anonymous && !$isOwner && !$isAdmin) {
                $userData = [
                    'id' => null,
                    'name' => 'Anonymous User',
                    'avatar' => null,
                ];
            } else {
                $userData = new UserResource($this->user);
            }
        }

        return [
            'id' => $this->id,
            'quiz_id' => $this->quiz_id,
            'user_id' => $this->is_anonymous && !$isOwner && !$isAdmin ? null : $this->user_id,
            'mode' => $this->mode,
            'is_anonymous' => $this->is_anonymous,
            'status' => $this->status,
            'started_at' => $this->started_at,
            'completed_at' => $this->completed_at,
            'score' => $this->score,
            'max_score' => $this->max_score,
            'grading_status' => $this->grading_status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user' => $userData,
            'quiz' => new QuizResource($this->whenLoaded('quiz')),
            'answers' => AttemptAnswerResource::collection($this->whenLoaded('answers')),
        ];
    }
}
