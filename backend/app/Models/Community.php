<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Community extends Model
{
    protected $fillable = [
        'name',
        'description',
        'visibility',
        'cover_image',
        'created_by'
    ];

    protected $appends = ['is_member'];

    public function getIsMemberAttribute()
    {
        $user = auth('sanctum')->user();
        if (!$user) return false;

        return $this->members()
            ->where('user_id', $user->id)
            ->where('status', 'approved')
            ->exists();
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'community_members')
            ->withPivot('role', 'status')
            ->withTimestamps();
    }

    // future use
    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }

    public function members(){
        return $this->hasMany(CommunityMember::class);
    }
}
