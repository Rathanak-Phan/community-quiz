<?php

namespace App\Http\Controllers\Quiz;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\Submission;
use App\Services\ShareService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShareController extends Controller
{
    protected $shareService;

    public function __construct(ShareService $shareService)
    {
        $this->shareService = $shareService;
    }

    /**
     * @OA\Get(
     *     path="/api/quizzes/{id}/share",
     *     tags={"Sharing"},
     *     summary="Get a public shareable link for a quiz",
     *     operationId="shareQuizLink",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Quiz ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Share URL generated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="quiz_id", type="integer", example=1),
     *             @OA\Property(property="share_url", type="string", example="http://localhost:5173/quiz/1")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Quiz not found")
     * )
     */
    public function shareQuiz($id): JsonResponse
    {
        $quiz = Quiz::findOrFail($id);
        $shareUrl = $this->shareService->generateQuizShareUrl($quiz);

        return response()->json([
            'quiz_id' => $quiz->id,
            'share_url' => $shareUrl
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/submissions/{id}/share",
     *     tags={"Sharing"},
     *     summary="Get a shareable link for a quiz result",
     *     operationId="shareResultLink",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Submission ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Share URL generated successfully"
     *     ),
     *     @OA\Response(response=404, description="Submission not found")
     * )
     */
    public function shareResult($id): JsonResponse
    {
        $submission = Submission::with(['quiz.creator', 'user.role'])->findOrFail($id);
        
        $shareUrl = route('share.result.preview', ['id' => $submission->id]);
        $frontendUrl = $this->shareService->generateResultShareUrl($submission);

        // Calculate Rank and Total Participants (separated: anonymous guest vs registered real users, and by challenge token)
        $submissions = Submission::where('quiz_id', $submission->quiz_id)
            ->where('is_anonymous', $submission->is_anonymous)
            ->where('challenge_token', $submission->challenge_token)
            ->orderBy('score', 'desc')
            ->orderBy('submitted_at', 'asc')
            ->get();

        $rank = 1;
        $totalParticipants = $submissions->count();
        foreach ($submissions as $index => $s) {
            if ($s->id == $submission->id) {
                $rank = $index + 1;
                break;
            }
        }

        return response()->json([
            'submission_id' => $submission->id,
            'score' => $submission->score,
            'max_score' => $submission->max_score,
            'quiz_title' => $submission->quiz ? $submission->quiz->title : 'Unknown Quiz',
            'quiz_creator_name' => $submission->quiz && $submission->quiz->creator ? $submission->quiz->creator->name : null,
            'user_id' => $submission->is_anonymous ? null : $submission->user_id,
            'user_role' => $submission->is_anonymous ? null : $submission->user?->role?->name,
            'user_name' => $submission->is_anonymous ? ($submission->anonymous_name ?: 'Someone') : ($submission->user ? $submission->user->name : 'Unknown User'),
            'is_anonymous' => (bool)$submission->is_anonymous,
            'challenge_token' => $submission->challenge_token,
            'share_url' => $shareUrl,
            'frontend_url' => $frontendUrl,
            'facebook_url' => $this->shareService->getFacebookShareUrl($shareUrl),
            'linkedin_url' => $this->shareService->getLinkedInShareUrl($shareUrl),
            'rank' => $rank,
            'total_participants' => $totalParticipants,
            'grading_status' => $submission->grading_status,
            'completed_at' => $submission->submitted_at
        ]);
    }

    /**
     * Show a public HTML preview for social media bots.
     */
    public function showSharePreview($id)
    {
        $submission = Submission::with(['quiz', 'user'])->findOrFail($id);
        $frontendUrl = $this->shareService->generateResultShareUrl($submission);
        
        return view('share.result', [
            'submission' => $submission,
            'frontend_url' => $frontendUrl,
            'frontendUrl' => $frontendUrl
        ]);
    }
}
