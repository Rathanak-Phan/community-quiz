<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\Quiz;
use App\Models\Category;
use App\Models\Community;

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
        $targetType = 'category';

        if ($this->favoritable instanceof Quiz) {
            $targetDetails = new QuizResource($this->favoritable);
            $targetType = 'quiz';
        } elseif ($this->favoritable instanceof Community) {
            $targetDetails = new CommunityResource($this->favoritable);
            $targetType = 'community';
        } elseif ($this->favoritable instanceof Category) {
            $targetDetails = new CategoryResource($this->favoritable);
            $targetType = 'category';
        }

        return [
            'id' => $this->id,
            'target_type' => $targetType,
            'target_id' => $this->favoritable_id,
            'details' => $targetDetails,
            'created_at' => $this->created_at,
        ];
    }
}
