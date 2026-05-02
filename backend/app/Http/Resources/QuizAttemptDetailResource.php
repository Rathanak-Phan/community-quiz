<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizAttemptDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Get the last answered question ID
        $lastAnswer = $this->answers()->orderBy('updated_at', 'desc')->first();
        $lastQuestionId = $lastAnswer ? $lastAnswer->question_id : null;

        return [
            'id' => $this->id,
            'quiz_id' => $this->quiz_id,
            'user_id' => $this->user_id,
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

            // Relations
            'quiz' => new QuizResource($this->whenLoaded('quiz')),
            'questions' => QuestionResource::collection($this->quiz->questions),
            'answers' => AttemptAnswerResource::collection($this->whenLoaded('answers')),

            // Resume helper
            'last_question_id' => $lastQuestionId,
        ];
    }
}
