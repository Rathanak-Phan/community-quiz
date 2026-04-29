<?php

namespace App\Http\Requests\Question;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'option_text' => ['sometimes', 'required', 'string', 'max:255'],
            'is_correct'  => ['sometimes', 'required', 'boolean'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $option = $this->route('option');
            
            if (!$option) {
                return;
            }

            $question = $option->question;

            if ($this->has('is_correct') && $this->is_correct && $question->question_type === 'true_false') {
                $hasOtherCorrect = $question->options()
                    ->where('is_correct', true)
                    ->where('id', '!=', $option->id)
                    ->exists();

                if ($hasOtherCorrect) {
                    $validator->errors()->add('is_correct', 'True/False questions can only have one correct answer.');
                }
            }
        });
    }
}
