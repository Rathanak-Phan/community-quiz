<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // GET ALL
    public function index(Request $request)
    {
        $user = $request->user();

        // Admin → all categories
        if ($user->role->name === 'admin') {
            return response()->json(Category::all());
        }

        // Quiz Maker → own categories
        return response()->json(
            Category::where('user_id', $user->id)->get()
        );
    }

    // Not needed for API
    public function create() {}

    // CREATE
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $category = Category::create([
            'name' => $request->name,
            'user_id' => $request->user()->id
        ]);

        return response()->json($category, 201);
    }

    // SHOW
    public function show(Category $category)
    {
        $this->authorize('view', $category);

        return response()->json($category);
    }

    // Not needed for API
    public function edit() {}

    // UPDATE
    public function update(Request $request, Category $category)
    {
        $this->authorize('update', $category);

        $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $category->update([
            'name' => $request->name
        ]);

        return response()->json($category);
    }

    // DELETE
    public function destroy(Request $request, Category $category)
    {
        $this->authorize('delete', $category);

        $category->delete();

        return response()->json([
            'message' => 'Deleted successfully'
        ]);
    }
}
