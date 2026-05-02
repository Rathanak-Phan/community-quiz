<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\Quiz;
use App\Models\Category;

class FavoriteResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $targetDetails = null;
        if ($this->favoritable instanceof Quiz) {
            $targetDetails = new QuizResource($this->favoritable);
        } elseif ($this->favoritable instanceof Category) {
            $targetDetails = new CategoryResource($this->favoritable);
        }

        return [
            'id' => $this->id,
            'target_type' => $this->favoritable_type === Quiz::class ? 'quiz' : 'category',
            'target_id' => $this->favoritable_id,
            'details' => $targetDetails,
            'created_at' => $this->created_at,
        ];
    }
}
