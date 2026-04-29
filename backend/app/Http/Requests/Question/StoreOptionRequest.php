<?php

namespace App\Http\Requests\Question;

use App\Models\Question;
use Illuminate\Foundation\Http\FormRequest;

class StoreOptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question_id' => ['required', 'exists:questions,id'],
            'option_text' => ['required', 'string', 'max:255'],
            'is_correct'  => ['required', 'boolean'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $question = Question::find($this->question_id);

            if (!$question) {
                return;
            }

            if ($question->question_type === 'short_answer') {
                $validator->errors()->add('question_id', 'Short answer questions do not use options.');
            }

            if ($this->is_correct && $question->question_type === 'true_false') {
                $hasCorrect = $question->options()->where('is_correct', true)->exists();
                if ($hasCorrect) {
                    $validator->errors()->add('is_correct', 'True/False questions can only have one correct answer.');
                }
            }
        });
    }
}
