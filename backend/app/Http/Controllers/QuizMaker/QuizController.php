<?php

namespace App\Http\Controllers\QuizMaker;

use App\Http\Controllers\Controller;
use App\Http\Resources\QuizResource;
use App\Models\Quiz;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function show(Quiz $quiz)
    {
        $this->authorize('view', $quiz);

        return new QuizResource($quiz);
    }

    public function index()
    {
        $user = auth()->user();

        $quizzes = Quiz::whereHas('community', function ($q) use ($user) {

            $q->where('visibility', 'public')

                ->orWhere(function ($q2) use ($user) {
                    $q2->where('visibility', 'private')
                        ->whereHas('members', function ($m) use ($user) {
                            $m->where('user_id', $user->id)
                                ->where('status', 'approved');
                        });
                });
        })->get();

        return QuizResource::collection($quizzes);
    }
}
