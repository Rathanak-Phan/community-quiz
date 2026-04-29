<?php

namespace App\Policies;

use App\Models\Question;
use App\Models\User;

class QuestionPolicy
{
    /**
     * Determine whether the user can manage the question.
     */
    public function manage(User $user, Question $question): bool
    {
        return $user->id === $question->quiz->created_by
            || strtolower($user->role->name) === 'admin';
    }
}
