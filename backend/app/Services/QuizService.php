<?php

namespace App\Services;

use App\Models\CommunityMember;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class QuizService
{
    public function create(array $data, User $user): Quiz
    {
        // Assign creator
        $data['created_by'] = $user->id;

        // Check community membership
        $this->ensureApprovedMember($data['community_id'], $user);

        // Handle image upload (optional for now)
        if (($data['cover_image'] ?? null) instanceof UploadedFile) {
            $data['cover_image'] = $data['cover_image']->store('quiz-covers', 'public');
        }

        // Create quiz
        return Quiz::create($data);
    }

    public function update(Quiz $quiz, array $data, User $user): Quiz
    {
        if (array_key_exists('community_id', $data) && $data['community_id'] !== $quiz->community_id) {
            $this->ensureApprovedMember($data['community_id'], $user);
        }

        if (array_key_exists('cover_image', $data)) {
            if ($data['cover_image'] instanceof UploadedFile) {
                if ($quiz->cover_image) {
                    Storage::disk('public')->delete($quiz->cover_image);
                }

                $data['cover_image'] = $data['cover_image']->store('quiz-covers', 'public');
            } elseif ($data['cover_image'] === null) {
                if ($quiz->cover_image) {
                    Storage::disk('public')->delete($quiz->cover_image);
                }
            }
        }

        $quiz->update($data);

        return $quiz->refresh();
    }

    private function ensureApprovedMember(int $communityId, User $user): void
    {
        $isMember = CommunityMember::where('community_id', $communityId)
            ->where('user_id', $user->id)
            ->where('status', 'approved')
            ->exists();

        if (!$isMember) {
            throw new AuthorizationException('You are not a member of this community.');
        }
    }
}
