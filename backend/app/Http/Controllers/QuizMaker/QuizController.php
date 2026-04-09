<?php

namespace App\Http\Controllers\QuizMaker;

use App\Http\Controllers\Controller;
use App\Http\Requests\Quiz\StoreQuizRequest;
use App\Http\Requests\Quiz\UpdateQuizRequest;
use App\Http\Resources\QuizResource;
use App\Models\Quiz;
use App\Services\QuizService;
use Illuminate\Support\Facades\Storage;

class QuizController extends Controller
{
    protected $quizService;

    public function __construct(QuizService $quizService)
    {
        $this->quizService = $quizService;
    }

    public function show(Quiz $quiz)
    {
        $this->authorize('view', $quiz);

        return new QuizResource($quiz->loadMissing(['community', 'category', 'creator']));
    }

    public function store(StoreQuizRequest $request)
    {
        $this->authorize('create', Quiz::class);

        $quiz = $this->quizService->create(
            $request->validated(),
            auth()->user()
        );

        return (new QuizResource($quiz->loadMissing(['community', 'category', 'creator'])))
            ->response()
            ->setStatusCode(201);
    }

    public function index()
    {
        $user = auth()->user();

        $quizzes = Quiz::with(['community', 'category', 'creator'])
            ->whereHas('community', function ($q) use ($user) {

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

    public function update(UpdateQuizRequest $request, Quiz $quiz)
    {
        $this->authorize('update', $quiz);

        $quiz = $this->quizService->update($quiz, $request->validated(), auth()->user());

        return new QuizResource($quiz->loadMissing(['community', 'category', 'creator']));
    }

    public function destroy(Quiz $quiz)
    {
        $this->authorize('delete', $quiz);

        if ($quiz->cover_image) {
            Storage::disk('public')->delete($quiz->cover_image);
        }

        $quiz->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
