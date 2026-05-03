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
        $submission = Submission::findOrFail($id);
        
        // Basic privacy check: if anonymous, the frontend should handle hiding names,
        // but here we just return the link.
        
        $shareUrl = $this->shareService->generateResultShareUrl($submission);

        return response()->json([
            'submission_id' => $submission->id,
            'score' => $submission->score,
            'share_url' => $shareUrl
        ]);
    }
}
