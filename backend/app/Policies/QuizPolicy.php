<?php

namespace App\Policies;

use App\Models\Quiz;
use App\Models\User;

class QuizPolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        //
    }

    public function view(User $user, Quiz $quiz){
        $community = $quiz->community;

        // PUBLIC → allow all users
        if ($community->visibility === 'public') {
            return true;
        }

        // PRIVATE → must be approved member
        return $community->members()
            ->where('user_id', $user->id)
            ->where('status', 'approved')
            ->exists();
    }
}
