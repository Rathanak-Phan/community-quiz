<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Http\Resources\QuizResource;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class QuizModerationController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/admin/quizzes",
     *     tags={"Admin Moderation"},
     *     summary="List all quizzes for moderation",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="List of all quizzes")
     * )
     */
    public function index()
    {
        $quizzes = Quiz::with(['category', 'community', 'creator'])
            ->withCount('favorites')
            ->latest()
            ->get();
        return QuizResource::collection($quizzes);
    }

    /**
     * @OA\Delete(
     *     path="/api/admin/quizzes/{id}",
     *     tags={"Admin Moderation"},
     *     summary="Delete a quiz for moderation",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Quiz deleted")
     * )
     */
    public function destroy($id)
    {
        $quiz = Quiz::findOrFail($id);
        
        // Log deletion if needed
        // \Log::info("Quiz ID {$id} deleted by Admin ID " . auth()->id());

        $quiz->delete();

        return response()->json([
            'message' => 'Quiz deleted successfully for moderation'
        ]);
    }

    /**
     * Get users who favorited a specific quiz.
     */
    public function quizFavorites($id)
    {
        $quiz = Quiz::findOrFail($id);
        $favorites = $quiz->favorites()->with('user')->latest()->get();
        
        return response()->json([
            'data' => $favorites->map(function($f) {
                return [
                    'id' => $f->id,
                    'user' => [
                        'id' => $f->user->id,
                        'name' => $f->user->name,
                        'email' => $f->user->email,
                    ],
                    'created_at' => $f->created_at
                ];
            })
        ]);
    }
}
