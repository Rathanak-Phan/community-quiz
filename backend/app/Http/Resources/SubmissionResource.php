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
                'name' => $this->is_anonymous ? 'Anonymous' : $this->user->name,
            ],
            'score' => $this->score,
            'max_score' => $this->max_score,
            'percentage' => round(($this->score / max($this->max_score, 1)) * 100, 2),
            'submitted_at' => $this->submitted_at,
            'share_url' => config('app.frontend_url', 'http://localhost:5173') . "/result/{$this->id}",
        ];
    }
}
