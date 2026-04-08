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
        'owner_id'
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'owner_id');
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
