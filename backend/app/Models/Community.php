<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Community extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'visibility',
        'cover_image',
        'created_by',
        'status',
        'invite_code'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($community) {
            if (empty($community->slug)) {
                $community->slug = \Illuminate\Support\Str::slug($community->name) . '-' . uniqid();
            }
        });
    }

    protected $appends = ['is_member', 'join_status', 'is_favorited'];

    public function getIsFavoritedAttribute()
    {
        $user = auth('sanctum')->user();
        if (!$user) return false;

        return $this->favorites()
            ->where('user_id', $user->id)
            ->exists();
    }

    public function favorites()
    {
        return $this->morphMany(Favorite::class, 'favoritable');
    }

    public function getIsMemberAttribute()
    {
        $user = auth('sanctum')->user();
        if (!$user) return false;

        return $this->members()
            ->where('user_id', $user->id)
            ->where('status', 'approved')
            ->exists();
    }

    public function getJoinStatusAttribute()
    {
        $user = auth('sanctum')->user();
        if (!$user) return null;

        $member = $this->members()
            ->where('user_id', $user->id)
            ->first();

        return $member ? $member->status : null;
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

    public function recentMembers()
    {
        return $this->users()
            ->wherePivot('status', 'approved')
            ->latest('community_members.created_at')
            ->limit(3);
    }
}
