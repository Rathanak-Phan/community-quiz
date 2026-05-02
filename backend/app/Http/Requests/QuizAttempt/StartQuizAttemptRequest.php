<?php

namespace App\Http\Requests\QuizAttempt;

use Illuminate\Foundation\Http\FormRequest;

class StartQuizAttemptRequest extends FormRequest
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
            'mode' => 'required|in:practice,scored',
            'is_anonymous' => 'required|boolean',
        ];
    }
}
