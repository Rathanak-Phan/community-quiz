<?php

namespace App\Services;

use App\Models\QuizAttempt;
use App\Models\Question;
use App\Models\AttemptAnswer;
use App\Models\Submission;

class QuizScoringService
{
    public function calculateScore(QuizAttempt $attempt): array
    {
        $totalScore = 0;
        $maxScore = 0;
        $attempt->load(['quiz.questions.options', 'quiz.questions.shortAnswer', 'answers']);

        $questions = $attempt->quiz->questions;
        $answers = $attempt->answers->keyBy('question_id');

        $gradedAnswers = [];

        foreach ($questions as $question) {
            $answer = $answers->get($question->id);

            if (!$answer) {
                $gradedAnswers[$question->id] = [
                    'is_correct' => false,
                    'score' => 0,
                    'is_pending' => false,
                ];
                if ($question->question_type !== 'short_answer') {
                    $maxScore += $question->points;
                }
                continue;
            }

            if ($question->question_type === 'short_answer') {
                $isManual = $question->shortAnswer ? $question->shortAnswer->is_manual_grading : false;
                
                if ($isManual) {
                    $isCorrect = null;
                    $pointsEarned = null;
                    $isPending = true;
                } else {
                    $isCorrect = $this->isCorrect($question, $answer);
                    $pointsEarned = $isCorrect ? $question->points : 0;
                    $isPending = false;
                }
            } else {
                $maxScore += $question->points;
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

            if ($pointsEarned !== null && $question->question_type !== 'short_answer') {
                $totalScore += $pointsEarned;
            }
        }

        return [
            'total_score' => $totalScore,
            'max_score' => $maxScore,
            'grading_status' => collect($gradedAnswers)->contains('is_pending', true) ? 'pending' : 'graded',
            'graded_answers' => $gradedAnswers,
        ];
    }

    public function recalculateTotalScore(QuizAttempt $attempt): void
    {
        $attempt->load(['answers.question', 'quiz.questions']);
        
        // Sum only non-short-answer scores for the total score
        $totalScore = $attempt->answers->reject(function ($answer) {
            return $answer->question->question_type === 'short_answer';
        })->sum('score');
        
        // Sum only non-short-answer points for the max score
        $maxScore = $attempt->quiz->questions->where('question_type', '!=', 'short_answer')->sum('points');

        // Determine if grading is still pending for any short answer
        $isPending = $attempt->answers->contains(function ($answer) {
            return is_null($answer->score) && $answer->question->question_type === 'short_answer';
        });

        $attempt->update([
            'score' => $totalScore,
            'max_score' => $maxScore,
            'grading_status' => $isPending ? 'pending' : 'graded',
        ]);

        // Also update corresponding Submission if it exists
        if ($attempt->status === 'submitted') {
            $submission = Submission::where('quiz_attempt_id', $attempt->id)->first();
            if ($submission) {
                $submission->update([
                    'score' => $totalScore,
                    'max_score' => $maxScore,
                    'grading_status' => $isPending ? 'pending' : 'graded',
                ]);
            }
        }
    }

    private function isCorrect(Question $question, AttemptAnswer $answer): bool
    {
        switch ($question->question_type) {
            case 'multiple_choice':
                $correctOptionIds = $question->options->where('is_correct', true)->pluck('id')->toArray();
                
                if ($question->allow_multiple || count($correctOptionIds) > 1) {
                    // Multiple Select logic
                    $selectedIds = $answer->selected_options ?? [];
                    if (empty($selectedIds)) return false;
                    
                    return count($correctOptionIds) === count($selectedIds) && 
                           empty(array_diff($correctOptionIds, $selectedIds)) &&
                           empty(array_diff($selectedIds, $correctOptionIds));
                } else {
                    // Standard Single Choice logic
                    if (!$answer->selected_option_id) {
                        return false;
                    }
                    $option = $question->options->firstWhere('id', $answer->selected_option_id);
                    return $option && $option->is_correct;
                }
            case 'true_false':
                // Compare boolean values
                $correct = filter_var($question->correct_answer, FILTER_VALIDATE_BOOLEAN);
                return (bool)$answer->answer_boolean === $correct;
            case 'short_answer':
                if (!$answer->answer_text || !$question->shortAnswer) {
                    return false;
                }
                
                $userAnswer = strtolower(trim($answer->answer_text));
                $correctAnswers = explode(',', $question->shortAnswer->answer_text);
                
                foreach ($correctAnswers as $correct) {
                    if ($userAnswer === strtolower(trim($correct))) {
                        return true;
                    }
                }
                return false;
            default:
                return false;
        }
    }
}
