<?php

use App\Models\Quiz;
use App\Models\Question;
use App\Models\QuizAttempt;
use App\Models\AttemptAnswer;
use App\Models\User;
use App\Services\QuizScoringService;

// Ensure we have a user
$user = User::first() ?: User::factory()->create();

// Create a Quiz
$quiz = Quiz::create([
    'title' => 'Test Quiz',
    'description' => 'Test Description',
    'category_id' => 1,
    'community_id' => 1,
    'created_by' => $user->id,
]);

// 1. MCQ
$q1 = Question::create([
    'quiz_id' => $quiz->id,
    'question_type' => 'multiple_choice',
    'question_text' => 'What is 1+1?',
]);
$o1 = $q1->options()->create(['option_text' => '1', 'is_correct' => false]);
$o2 = $q1->options()->create(['option_text' => '2', 'is_correct' => true]);

// 2. True/False
$q2 = Question::create([
    'quiz_id' => $quiz->id,
    'question_type' => 'true_false',
    'question_text' => 'Is Laravel a PHP framework?',
    'correct_answer' => 'true',
]);

// 3. Short Answer
$q3 = Question::create([
    'quiz_id' => $quiz->id,
    'question_type' => 'short_answer',
    'question_text' => 'What is the capital of France?',
]);
$q3->shortAnswer()->create(['answer_text' => 'Paris']);

// Create Attempt
$attempt = QuizAttempt::create([
    'quiz_id' => $quiz->id,
    'user_id' => $user->id,
    'status' => 'in_progress',
    'mode' => 'scored',
    'started_at' => now(),
]);

// Correct Answer for Q1
AttemptAnswer::create([
    'quiz_attempt_id' => $attempt->id,
    'question_id' => $q1->id,
    'selected_option_id' => $o2->id,
]);

// Correct Answer for Q2
AttemptAnswer::create([
    'quiz_attempt_id' => $attempt->id,
    'question_id' => $q2->id,
    'answer_boolean' => true,
]);

// Incorrect Answer for Q3
AttemptAnswer::create([
    'quiz_attempt_id' => $attempt->id,
    'question_id' => $q3->id,
    'answer_text' => 'Berlin',
]);

// Test Scoring
$service = new QuizScoringService();
$score = $service->calculateScore($attempt);

echo "Calculated Score: $score (Expected: 2)\n";

// Test Case Sensitivity for Short Answer
$attempt2 = QuizAttempt::create([
    'quiz_id' => $quiz->id,
    'user_id' => $user->id,
    'status' => 'in_progress',
    'mode' => 'scored',
    'started_at' => now(),
]);

AttemptAnswer::create([
    'quiz_attempt_id' => $attempt2->id,
    'question_id' => $q3->id,
    'answer_text' => 'pArIs ', // Mixed case and whitespace
]);

$score2 = $service->calculateScore($attempt2);
echo "Calculated Score 2 (Short Answer case/trim): $score2 (Expected: 1)\n";
