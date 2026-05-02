<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'category_id',
        'community_id',
        'cover_image',
        'created_by'
    ];

    public function community()
    {
        return $this->belongsTo(Community::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    public function attempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }
}
