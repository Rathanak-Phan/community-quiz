<?php

namespace App\Http\Requests\QuizAttempt;

use Illuminate\Foundation\Http\FormRequest;

class SubmitAnswerRequest extends FormRequest
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
            'question_id' => 'required|exists:questions,id',
            'selected_option_id' => 'nullable|exists:question_options,id',
            'selected_options' => 'nullable|array',
            'selected_options.*' => 'exists:question_options,id',
            'answer_boolean' => 'nullable|boolean',
            'answer_text' => 'nullable|string',
        ];
    }
}
