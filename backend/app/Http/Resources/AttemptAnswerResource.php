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
            'answer_boolean' => $this->answer_boolean,
            'answer_text' => $this->answer_text,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
