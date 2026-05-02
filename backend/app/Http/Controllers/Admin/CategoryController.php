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
        $user = $request->user();

        // Admin → all categories
        if ($user->role->name === 'admin') {
            return response()->json(
                Category::with('user')->get()
            );
        }

        // Quiz Maker → own categories
        return response()->json(
            Category::where('user_id', $user->id)->get()
        );
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
            'name' => 'required|string|max:255'
        ]);

        $category = Category::create([
            'name' => $request->name,
            'user_id' => $request->user()->id
        ]);

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
            'name' => 'required|string|max:255'
        ]);

        $category->update([
            'name' => $request->name
        ]);

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

        $category->delete();

        return response()->json([
            'message' => 'Deleted successfully'
        ]);
    }
}
