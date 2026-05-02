<?php

namespace App\Services;

use App\Models\Quiz;
use App\Models\Submission;

class ShareService
{
    protected $frontendUrl;

    public function __construct()
    {
        $this->frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
    }

    /**
     * Generate a public shareable URL for a quiz.
     *
     * @param Quiz $quiz
     * @return string
     */
    public function generateQuizShareUrl(Quiz $quiz): string
    {
        return "{$this->frontendUrl}/quiz/{$quiz->id}";
    }

    /**
     * Generate a public shareable URL for a quiz result.
     *
     * @param Submission $submission
     * @return string
     */
    public function generateResultShareUrl(Submission $submission): string
    {
        return "{$this->frontendUrl}/result/{$submission->id}";
    }
}
