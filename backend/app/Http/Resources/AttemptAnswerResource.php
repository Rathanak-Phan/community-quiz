<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttemptAnswerResource extends JsonResource
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
            'quiz_attempt_id' => $this->quiz_attempt_id,
            'question_id' => $this->question_id,
            'selected_option_id' => $this->selected_option_id,
            'selected_options' => $this->selected_options,
            'answer_boolean' => $this->answer_boolean,
            'answer_text' => $this->answer_text,
            'is_correct' => $this->is_correct,
            'score' => $this->score,
            'feedback' => $this->feedback,
            'graded_at' => $this->graded_at,
            'graded_by' => new UserResource($this->whenLoaded('gradedBy')),
            'question' => new QuestionResource($this->whenLoaded('question')),
            'selected_options_data' => $this->when($this->selected_options, function() {
                if (!$this->relationLoaded('question') || !$this->question->relationLoaded('options')) {
                    return null;
                }
                $options = $this->question->options->whereIn('id', (array)$this->selected_options);
                return QuestionOptionResource::collection($options);
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
