<?php

namespace App\Services;

use App\Models\QuizAttempt;
use App\Models\Question;
use App\Models\AttemptAnswer;

class QuizScoringService
{
    public function calculateScore(QuizAttempt $attempt): array
    {
        $totalScore = 0;
        $maxScore = 0;
        $hasShortAnswer = false;
        $attempt->load(['quiz.questions.options', 'quiz.questions.shortAnswer', 'answers']);

        $questions = $attempt->quiz->questions;
        $answers = $attempt->answers->keyBy('question_id');

        $gradedAnswers = [];

        foreach ($questions as $question) {
            $maxScore += $question->points;
            $answer = $answers->get($question->id);

            if ($question->question_type === 'short_answer') {
                $hasShortAnswer = true;
            }

            if (!$answer) {
                $gradedAnswers[$question->id] = [
                    'is_correct' => false,
                    'score' => 0,
                    'is_pending' => false,
                ];
                continue;
            }

            if ($question->question_type === 'short_answer') {
                // Short answers require manual review as per Step 3
                $isCorrect = null;
                $pointsEarned = null;
                $isPending = true;
            } else {
                $isCorrect = $this->isCorrect($question, $answer);
                $pointsEarned = $isCorrect ? $question->points : 0;
                $isPending = false;
            }

            // Update individual attempt answer record
            $answer->update([
                'is_correct' => $isCorrect,
                'score' => $pointsEarned,
            ]);

            $gradedAnswers[$question->id] = [
                'is_correct' => $isCorrect,
                'score' => $pointsEarned,
                'is_pending' => $isPending,
            ];

            if ($pointsEarned !== null) {
                $totalScore += $pointsEarned;
            }
        }

        return [
            'total_score' => $totalScore,
            'max_score' => $maxScore,
            'grading_status' => $hasShortAnswer ? 'pending' : 'graded',
            'graded_answers' => $gradedAnswers,
        ];
    }

    public function recalculateTotalScore(QuizAttempt $attempt): void
    {
        $attempt->load('answers');
        $totalScore = $attempt->answers->sum('score');
        
        // If any score is still null, it remains pending
        $isPending = $attempt->answers->contains(function ($answer) {
            return is_null($answer->score) && $answer->question->question_type === 'short_answer';
        });

        $attempt->update([
            'score' => $totalScore,
            'grading_status' => $isPending ? 'pending' : 'graded',
        ]);

        // Also update corresponding Submission if it exists
        if ($attempt->status === 'submitted') {
            $submission = Submission::where('quiz_attempt_id', $attempt->id)->first();
            if ($submission) {
                $submission->update([
                    'score' => $totalScore,
                    'grading_status' => $isPending ? 'pending' : 'graded',
                ]);
            }
        }
    }

    private function isCorrect(Question $question, AttemptAnswer $answer): bool
    {
        switch ($question->question_type) {
            case 'multiple_choice':
                if (!$answer->selected_option_id) {
                    return false;
                }
                $option = $question->options->firstWhere('id', $answer->selected_option_id);
                return $option && $option->is_correct;
            case 'true_false':
                // Compare boolean values
                $correct = filter_var($question->correct_answer, FILTER_VALIDATE_BOOLEAN);
                return (bool)$answer->answer_boolean === $correct;
            case 'short_answer':
                // We handle this as pending, but if we wanted to auto-grade:
                if (!$answer->answer_text || !$question->shortAnswer) {
                    return false;
                }
                return strtolower(trim($answer->answer_text)) === strtolower(trim($question->shortAnswer->answer_text));
            default:
                return false;
        }
    }
}
