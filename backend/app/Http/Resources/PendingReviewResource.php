<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PendingReviewResource extends JsonResource
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
        
        $userName = $this->user->name;
        if ($this->is_anonymous && !$isOwner && !$isAdmin) {
            $userName = 'Anonymous User';
        }

        return [
            'attempt_id' => $this->id,
            'quiz_title' => $this->quiz->title,
            'user_name' => $userName,
            'submitted_at' => $this->completed_at,
            'short_answer_count' => $this->answers()
                ->whereNull('score')
                ->whereHas('question', function($q) {
                    $q->where('question_type', 'short_answer');
                })
                ->count(),
        ];
    }
}
