<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use Illuminate\Http\Request;
use App\Http\Resources\FavoriteResource;
use App\Models\Quiz;
use App\Models\Category;
use Illuminate\Http\Response;

class FavoriteController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/favorites",
     *     tags={"Favorites"},
     *     summary="List all user favorites",
     *     operationId="favoriteIndex",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Favorites retrieved successfully",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/Favorite"))
     *     )
     * )
     */
    public function index()
    {
        $favorites = auth()->user()->favorites()->with('favoritable')->get();
        return FavoriteResource::collection($favorites);
    }

    /**
     * @OA\Post(
     *     path="/api/favorites",
     *     tags={"Favorites"},
     *     summary="Add a quiz or category to favorites",
     *     operationId="favoriteStore",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"target_type", "target_id"},
     *             @OA\Property(property="target_type", type="string", enum={"quiz", "category"}),
     *             @OA\Property(property="target_id", type="integer")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Favorite saved successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Favorite")
     *     )
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'target_type' => 'required|string|in:quiz,category',
            'target_id' => 'required|integer',
        ]);

        $type = $request->target_type === 'quiz' ? Quiz::class : Category::class;
        $id = $request->target_id;

        // Verify target exists
        $target = $type::find($id);
        if (!$target) {
            return response()->json(['message' => 'Target not found'], Response::HTTP_NOT_FOUND);
        }

        $favorite = Favorite::firstOrCreate([
            'user_id' => auth()->id(),
            'favoritable_id' => $id,
            'favoritable_type' => $type,
        ]);

        return new FavoriteResource($favorite->load('favoritable'));
    }

    /**
     * @OA\Delete(
     *     path="/api/favorites/{favorite}",
     *     tags={"Favorites"},
     *     summary="Remove an item from favorites",
     *     operationId="favoriteDestroy",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="favorite",
     *         in="path",
     *         required=true,
     *         description="Favorite ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Favorite removed successfully"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="Favorite not found")
     * )
     */
    public function destroy(Favorite $favorite)
    {
        if ($favorite->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        $favorite->delete();

        return response()->json(['message' => 'Removed from favorites']);
    }
}
