<?php

namespace App\Http\Requests\Question;

use Illuminate\Foundation\Http\FormRequest;

class StoreMcqRequest extends FormRequest
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
        $optionsCount = is_array($this->options) ? count($this->options) : 0;

        return [
            'quiz_id' => 'required|integer|exists:quizzes,id',
            'question_text' => 'required|string',
            'options' => 'required|array|min:2',
            'options.*' => 'required|string',
            'correct_option' => 'nullable|integer|min:0' . ($optionsCount > 0 ? '|max:' . ($optionsCount - 1) : ''),
            'correct_options' => 'nullable|array',
            'correct_options.*' => 'integer|min:0' . ($optionsCount > 0 ? '|max:' . ($optionsCount - 1) : ''),
            'time_limit' => 'required|integer|min:5',
        ];
    }
}
