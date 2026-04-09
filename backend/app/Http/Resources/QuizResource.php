<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizResource extends JsonResource
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
            'title' => $this->title,
            'description' => $this->description,

            'community' => [
                'id' => $this->community->id,
                'name' => $this->community->name,
                'visibility' => $this->community->visibility,
            ],

            'category_id' => $this->category_id,
            'cover_image' => $this->cover_image,
        ];
    }
}
