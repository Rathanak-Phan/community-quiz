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
    public function index(Request $request)
    {
        $query = Quiz::with(['category', 'community', 'creator'])
            ->withCount('favorites');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhereHas('creator', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $quizzes = $query->latest()->paginate($request->query('per_page', 10));
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
        
        \App\Models\ActivityLog::log(
            'quiz_deleted_by_admin',
            "Deleted quiz '{$quiz->title}' (ID: {$quiz->id}) created by " . ($quiz->creator ? $quiz->creator->name : 'Unknown')
        );

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
