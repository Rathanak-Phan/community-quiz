<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionReviewResource extends JsonResource
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
            'question_type' => $this->question_type,
            'question_text' => $this->question_text,
            'image' => $this->image,
            'points' => $this->points,
            
            // Reference answers
            'correct_answer' => $this->correct_answer, // For True/False
            'options' => QuestionOptionResource::collection($this->whenLoaded('options')), // For MCQ
            'short_answer' => $this->whenLoaded('shortAnswer'), // For Short Answer
        ];
    }
}
