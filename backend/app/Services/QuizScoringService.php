<?php

namespace App\Services;

use App\Models\QuizAttempt;
use App\Models\Question;
use App\Models\AttemptAnswer;

class QuizScoringService
{
    public function calculateScore(QuizAttempt $attempt): int
    {
        $score = 0;
        $attempt->load(['quiz.questions.options', 'quiz.questions.shortAnswer', 'answers']);
        $questions = $attempt->quiz->questions;
        $answers = $attempt->answers->keyBy('question_id');
        foreach ($questions as $question) {
            $answer = $answers->get($question->id);
            if (!$answer) {
                continue;
            }
            if ($this->isCorrect($question, $answer)) {
                $score++;
            }
        }
        return $score;
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
                $correct = strtolower($question->correct_answer) === 'true';
                return (bool)$answer->answer_boolean === $correct;
            case 'short_answer':
                if (!$answer->answer_text || !$question->shortAnswer) {
                    return false;
                }
                return strtolower(trim($answer->answer_text)) === strtolower(trim($question->shortAnswer->answer_text));
            default:
                return false;
        }
    }
}
