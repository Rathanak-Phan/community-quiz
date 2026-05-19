<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizAttemptResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = auth()->user();
        $isOwner = $user && $user->id === $this->user_id;
        $isAdmin = $user && $user->isAdmin();
        
        $userData = null;
        if ($this->relationLoaded('user') && $this->user) {
            if ($this->is_anonymous && !$isOwner && !$isAdmin) {
                $userData = [
                    'id' => null,
                    'name' => $this->anonymous_name ?: 'Anonymous User',
                    'avatar' => null,
                ];
            } else {
                $userData = new UserResource($this->user);
            }
        } elseif ($this->is_anonymous) {
            $userData = [
                'id' => null,
                'name' => $this->anonymous_name ?: 'Anonymous User',
                'avatar' => null,
            ];
        }

        // Calculate Rank and Total Participants (separated: anonymous guest vs registered real users, and by challenge token)
        $submissions = \App\Models\Submission::where('quiz_id', $this->quiz_id)
            ->where('is_anonymous', $this->is_anonymous)
            ->where('challenge_token', $this->challenge_token)
            ->with('quizAttempt')
            ->get();

        // Sort by score DESC, and duration (completed_at - started_at) ASC
        $sortedSubmissions = $submissions->sort(function ($a, $b) {
            // First tie-breaker: Score descending
            if ($a->score !== $b->score) {
                return $b->score <=> $a->score;
            }
            
            // Second tie-breaker: Duration taken ascending
            $durationA = PHP_INT_MAX;
            $durationB = PHP_INT_MAX;
            
            if ($a->quizAttempt && $a->quizAttempt->started_at && $a->quizAttempt->completed_at) {
                $durationA = strtotime($a->quizAttempt->completed_at) - strtotime($a->quizAttempt->started_at);
            }
            if ($b->quizAttempt && $b->quizAttempt->started_at && $b->quizAttempt->completed_at) {
                $durationB = strtotime($b->quizAttempt->completed_at) - strtotime($b->quizAttempt->started_at);
            }
            
            if ($durationA !== $durationB) {
                return $durationA <=> $durationB;
            }
            
            // Third fallback: submitted_at ascending
            return strtotime($a->submitted_at) <=> strtotime($b->submitted_at);
        })->values();

        $rank = null;
        $totalParticipants = $sortedSubmissions->count();
        foreach ($sortedSubmissions as $index => $s) {
            if ($s->quiz_attempt_id == $this->id) {
                $rank = $index + 1;
                break;
            }
        }

        return [
            'id' => $this->id,
            'quiz_id' => $this->quiz_id,
            'user_id' => $this->is_anonymous && !$isOwner && !$isAdmin ? null : $this->user_id,
            'mode' => $this->mode,
            'is_anonymous' => $this->is_anonymous,
            'anonymous_name' => $this->anonymous_name,
            'challenge_token' => $this->challenge_token,
            'status' => $this->status,
            'started_at' => $this->started_at,
            'completed_at' => $this->completed_at,
            'score' => $this->score,
            'max_score' => $this->max_score,
            'grading_status' => $this->grading_status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user' => $userData,
            'rank' => $rank,
            'total_participants' => $totalParticipants,
            'quiz' => new QuizResource($this->whenLoaded('quiz')),
            'answers' => AttemptAnswerResource::collection($this->whenLoaded('answers')),
        ];
    }
}
