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
        return [
            'attempt_id' => $this->id,
            'quiz_title' => $this->quiz->title,
            'user_name' => $this->user->name,
            'submitted_at' => $this->completed_at,
            'short_answer_count' => $this->quiz->questions()
                ->where('question_type', 'short_answer')
                ->count(),
        ];
    }
}
