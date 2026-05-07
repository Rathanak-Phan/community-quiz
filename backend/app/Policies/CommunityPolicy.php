<?php

namespace App\Policies;

use App\Models\Community;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CommunityPolicy
{
    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Community $community): bool
    {
        return $user->isAdmin() || $user->id === $community->created_by;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Community $community): bool
    {
        return $user->isAdmin() || $user->id === $community->created_by;
    }
}
