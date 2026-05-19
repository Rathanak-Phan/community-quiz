<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizAttemptDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Get the last answered question ID
        $lastAnswer = $this->answers()->orderBy('updated_at', 'desc')->first();
        $lastQuestionId = $lastAnswer ? $lastAnswer->question_id : null;

        // Calculate Rank and Total Participants (separated: anonymous guest vs registered real users, and by challenge token)
        $submissions = \App\Models\Submission::where('quiz_id', $this->quiz_id)
            ->where('is_anonymous', $this->is_anonymous)
            ->where('challenge_token', $this->challenge_token)
            ->orderBy('score', 'desc')
            ->orderBy('submitted_at', 'asc')
            ->get();

        $rank = 1;
        $totalParticipants = $submissions->count();
        if ($totalParticipants == 0 && $this->status === 'submitted') {
            $totalParticipants = 1;
            $rank = 1;
        } else {
            $found = false;
            foreach ($submissions as $index => $s) {
                if ($s->quiz_attempt_id == $this->id) {
                    $rank = $index + 1;
                    $found = true;
                    break;
                }
            }
            if (!$found && $this->status === 'submitted') {
                $rank = \App\Models\Submission::where('quiz_id', $this->quiz_id)
                    ->where('is_anonymous', $this->is_anonymous)
                    ->where('challenge_token', $this->challenge_token)
                    ->where('score', '>', $this->score)
                    ->count() + 1;
                $totalParticipants += 1;
            }
        }

        return [
            'id' => $this->id,
            'quiz_id' => $this->quiz_id,
            'user_id' => $this->user_id,
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
            'expires_at' => $this->started_at ? $this->started_at->addSeconds($this->quiz->questions->sum(function($q) {
                if ($q->time_limit > 0) return $q->time_limit;
                return $this->quiz->has_timer ? ($this->quiz->default_time_limit ?: 30) : 3600; // Default 1 hour if no timer
            })) : null,
            'submission_id' => $this->submission?->id,
            'rank' => $rank,
            'total_participants' => $totalParticipants,

            // Relations
            'quiz' => new QuizResource($this->whenLoaded('quiz')),
            'questions' => $this->quiz ? QuestionResource::collection($this->quiz->questions) : [],
            'answers' => AttemptAnswerResource::collection($this->whenLoaded('answers')),

            // Resume helper
            'last_question_id' => $lastQuestionId,
        ];
    }
}
