<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // GET ALL
    /**
     * @OA\Get(
     *     path="/api/categories",
     *     tags={"Category"},
     *     summary="Get categories available to the authenticated user",
     *     operationId="categoryIndex",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Categories retrieved successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    public function index(Request $request)
    {
        $query = Category::with('user.role');

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $categories = $query->latest()->paginate($request->query('per_page', 15));
        
        return response()->json($categories);
    }

    // Not needed for API
    public function create() {}

    // CREATE
    /**
     * @OA\Post(
     *     path="/api/categories",
     *     tags={"Category"},
     *     summary="Create a category",
     *     operationId="categoryStore",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", maxLength=255, example="Science")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Category created successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        $category = Category::create([
            'name' => $request->name,
            'description' => $request->description,
            'icon' => $request->icon,
            'color' => $request->color,
            'user_id' => $request->user()->id
        ]);

        \App\Models\ActivityLog::log(
            'category_created',
            "Created a new quiz category: '{$category->name}' (ID: {$category->id})."
        );

        return response()->json($category, 201);
    }

    // SHOW
    /**
     * @OA\Get(
     *     path="/api/categories/{category}",
     *     tags={"Category"},
     *     summary="Get a category",
     *     operationId="categoryShow",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         required=true,
     *         description="Category ID",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Category retrieved successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Category not found")
     * )
     */
    public function show(Category $category)
    {
        $this->authorize('view', $category);

        return response()->json($category);
    }

    // Not needed for API
    public function edit() {}

    // UPDATE
    /**
     * @OA\Put(
     *     path="/api/categories/{category}",
     *     tags={"Category"},
     *     summary="Update a category",
     *     operationId="categoryUpdate",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         required=true,
     *         description="Category ID",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", maxLength=255, example="Updated Science")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Category updated successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Category not found")
     * )
     */
    public function update(Request $request, Category $category)
    {
        $this->authorize('update', $category);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        $category->update([
            'name' => $request->name,
            'description' => $request->description,
            'icon' => $request->icon,
            'color' => $request->color,
        ]);

        \App\Models\ActivityLog::log(
            'category_updated',
            "Updated quiz category '{$category->name}' (ID: {$category->id})."
        );

        return response()->json($category);
    }

    // DELETE
    /**
     * @OA\Delete(
     *     path="/api/categories/{category}",
     *     tags={"Category"},
     *     summary="Delete a category",
     *     operationId="categoryDestroy",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         required=true,
     *         description="Category ID",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Category deleted successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Category not found")
     * )
     */
    public function destroy(Request $request, Category $category)
    {
        $this->authorize('delete', $category);

        $categoryName = $category->name;
        $categoryId = $category->id;
        $category->delete();

        \App\Models\ActivityLog::log(
            'category_deleted',
            "Deleted quiz category '{$categoryName}' (ID: {$categoryId})."
        );

        return response()->json([
            'message' => 'Deleted successfully'
        ]);
    }
}
