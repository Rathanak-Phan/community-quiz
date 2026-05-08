<?php

namespace App\Http\Requests\Quiz;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuizRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'category_id' => 'sometimes|required|exists:categories,id',
            'community_id' => [
                'sometimes',
                'required',
                'exists:communities,id',
                function ($attribute, $value, $fail) {
                    $user = auth()->user();
                    if ($user->isAdmin()) {
                        return;
                    }
                    $isMember = \App\Models\CommunityMember::where('community_id', $value)
                        ->where('user_id', $user->id)
                        ->where('status', 'approved')
                        ->exists();
                    if (!$isMember) {
                        $fail('You must be a member of the community to move a quiz to it.');
                    }
                },
            ],
            'description' => 'sometimes|nullable|string',
            'cover_image' => 'sometimes|nullable|image|mimes:jpg,jpeg,png|max:2048',
            'status' => 'sometimes|nullable|string|in:draft,published',
        ];
    }
}
