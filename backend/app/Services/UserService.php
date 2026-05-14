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

    /**
     * Create a new user.
     *
     * @param array $data
     * @return User
     */
    public function createUser(array $data): User
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($data['password']),
            'role_id' => $data['role_id'] ?? 3, // Default to User role
        ]);
    }
}
