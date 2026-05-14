<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttemptAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_attempt_id',
        'question_id',
        'selected_option_id',
        'selected_options',
        'answer_boolean',
        'answer_text',
        'is_correct',
        'score',
        'graded_by',
        'graded_at',
        'feedback',
    ];

    protected $casts = [
        'answer_boolean' => 'boolean',
        'is_correct' => 'boolean',
        'graded_at' => 'datetime',
        'selected_options' => 'array',
    ];

    public function attempt()
    {
        return $this->belongsTo(QuizAttempt::class, 'quiz_attempt_id');
    }

    public function gradedBy()
    {
        return $this->belongsTo(User::class, 'graded_by');
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    public function selectedOption()
    {
        return $this->belongsTo(QuestionOption::class, 'selected_option_id');
    }
}
