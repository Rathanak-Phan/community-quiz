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

    public function create(User $user)
    {
        return in_array($user->role->name, ['admin', 'quiz_maker']);
    }

    public function view(User $user, Quiz $quiz)
    {
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

    public function update(User $user, Quiz $quiz)
    {
        return $user->id === $quiz->created_by || $user->role->name === 'admin';
    }

    public function delete(User $user, Quiz $quiz)
    {
        return $this->update($user, $quiz);
    }
}
