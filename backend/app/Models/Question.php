<?php

namespace App\Models;

use App\Models\QuestionAnswer;
use App\Models\QuestionOption;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'question_type',
        'question_text',
        'correct_answer',
        'image',
    ];

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    public function options()
    {
        return $this->hasMany(QuestionOption::class);
    }

    public function shortAnswer()
    {
        return $this->hasOne(QuestionAnswer::class);
    }

    public function attemptAnswers()
    {
        return $this->hasMany(AttemptAnswer::class);
    }
}
