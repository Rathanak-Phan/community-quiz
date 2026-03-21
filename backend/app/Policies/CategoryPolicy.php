<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    /**
     * Determine whether the user can view the category.
     * Quiz Maker can view their own categories.
     * Admin can view all categories.
     */
    public function view(User $user, Category $category): bool
    {
        // Admin can view all categories
        if ($user->role->name === 'admin') {
            return true;
        }

        // Quiz Maker can only view their own categories
        return $category->user_id === $user->id;
    }

    /**
     * Determine whether the user can update the category.
     * Quiz Maker can update their own categories.
     * Admin can update all categories.
     */
    public function update(User $user, Category $category): bool
    {
        // Admin can update all categories
        if ($user->role->name === 'admin') {
            return true;
        }

        // Quiz Maker can only update their own categories
        return $category->user_id === $user->id;
    }

    /**
     * Determine whether the user can delete the category.
     * Quiz Maker can delete their own categories.
     * Admin can delete all categories.
     */
    public function delete(User $user, Category $category): bool
    {
        // Admin can delete all categories
        if ($user->role->name === 'admin') {
            return true;
        }

        // Quiz Maker can only delete their own categories
        return $category->user_id === $user->id;
    }
}
