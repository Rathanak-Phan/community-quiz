<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'user_id',
        'mode',
        'is_anonymous',
        'status',
        'started_at',
        'completed_at',
        'score',
        'max_score',
        'grading_status',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function answers()
    {
        return $this->hasMany(AttemptAnswer::class);
    }

    public function submission()
    {
        return $this->hasOne(Submission::class);
    }
}
