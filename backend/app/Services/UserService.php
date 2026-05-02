<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class UserService
{
    /**
     * Get all users with their roles.
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllUsers(int $perPage = 15): LengthAwarePaginator
    {
        return User::with('role')->latest()->paginate($perPage);
    }

    /**
     * Update user role.
     *
     * @param User $user
     * @param int $roleId
     * @return User
     */
    public function updateUserRole(User $user, int $roleId): User
    {
        $user->update([
            'role_id' => $roleId
        ]);

        return $user->load('role');
    }
}
