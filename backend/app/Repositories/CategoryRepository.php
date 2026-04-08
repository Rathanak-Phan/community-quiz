<?php

namespace App\Repositories;

use App\Models\Category;

class CategoryRepository
{
    public function getAllForAdmin()
    {
        return Category::with('user')->latest()->get();
    }

    public function getByUser($userId)
    {
        return Category::where('user_id', $userId)->latest()->get();
    }

    public function create(array $data)
    {
        return Category::create($data);
    }

    public function update(Category $category, array $data)
    {
        $category->update($data);
        return $category;
    }

    public function delete(Category $category)
    {
        return $category->delete();
    }
}
