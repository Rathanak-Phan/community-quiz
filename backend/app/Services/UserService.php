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
    public function getAllUsers(int $perPage = 15, ?string $search = null, ?int $roleId = null): LengthAwarePaginator
    {
        $query = User::with('role')->latest();

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($roleId) {
            $query->where('role_id', $roleId);
        }

        return $query->paginate($perPage);
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

    /**
     * Get user statistics.
     *
     * @return array
     */
    public function getUserStats(): array
    {
        return [
            'total' => User::count(),
            'admins' => User::where('role_id', 1)->count(),
            'quiz_makers' => User::where('role_id', 2)->count(),
            'regular_users' => User::where('role_id', 3)->count(),
        ];
    }
}
