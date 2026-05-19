<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubmissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quiz' => new QuizResource($this->whenLoaded('quiz')),
            'user' => [
                'name' => $this->is_anonymous ? ($this->anonymous_name ?: 'Anonymous') : ($this->user ? $this->user->name : 'Anonymous'),
                'avatar' => $this->is_anonymous 
                    ? 'https://api.dicebear.com/7.x/adventurer/svg?seed=' . urlencode($this->anonymous_name ?: 'Anonymous')
                    : ($this->user ? $this->user->avatar : null),
            ],
            'score' => $this->score,
            'max_score' => $this->max_score,
            'percentage' => round(($this->score / max($this->max_score, 1)) * 100, 2),
            'grading_status' => $this->grading_status,
            'submitted_at' => $this->submitted_at,
            'share_url' => config('app.frontend_url', 'http://localhost:5173') . "/result/{$this->id}",
        ];
    }
}
