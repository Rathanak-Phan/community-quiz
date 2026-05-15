<?php

namespace App\Services;

use App\Models\Quiz;
use App\Models\Submission;

class ShareService
{
    protected $frontendUrl;

    public function __construct()
    {
        $this->frontendUrl = config('app.frontend_url', 'https://quizsphere.store');
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

    /**
     * Generate a Facebook share URL.
     */
    public function getFacebookShareUrl(string $url): string
    {
        return "https://www.facebook.com/sharer/sharer.php?u=" . urlencode($url);
    }

    /**
     * Generate a LinkedIn share URL.
     */
    public function getLinkedInShareUrl(string $url): string
    {
        return "https://www.linkedin.com/sharing/share-offsite/?url=" . urlencode($url);
    }
}
