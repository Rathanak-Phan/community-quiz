<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionResource extends JsonResource
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
            'quiz_id' => $this->quiz_id,
            'question_type' => $this->question_type,
            'question_text' => $this->question_text,
            'points' => (int)$this->points,
            'time_limit' => (int)$this->time_limit,
            'allow_multiple' => (bool)$this->allow_multiple,
            'image' => $this->image,
            'correct_answer' => $this->correct_answer,
            'options' => QuestionOptionResource::collection($this->whenLoaded('options')),
            'short_answer' => $this->whenLoaded('shortAnswer'),
        ];
    }
}
