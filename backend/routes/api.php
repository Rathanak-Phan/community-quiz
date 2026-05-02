<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Community\CommunityController;
use App\Http\Controllers\Quiz\QuizController;
use App\Http\Controllers\Quiz\QuestionController;
use App\Http\Controllers\Quiz\QuestionOptionController;
use App\Http\Controllers\Quiz\QuizAttemptController;
use App\Http\Controllers\Quiz\ShareController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\User\FavoriteController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// OAuth
Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirect']);
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'callback']);

// For Postman testing
Route::post('/login-token', [AuthController::class, 'loginToken']);

// Sharing
Route::get('/quizzes/{id}/share', [ShareController::class, 'shareQuiz']);
Route::get('/submissions/{id}/share', [ShareController::class, 'shareResult']);

/*
|--------------------------------------------------------------------------
| Protected Routes (ALL AUTH USERS)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);

    /*
    |--------------------------------------------------------------------------
    | Community Routes (ALL AUTH USERS)
    |--------------------------------------------------------------------------
    */

    Route::get('/communities', [CommunityController::class, 'index']);
    Route::post('/communities', [CommunityController::class, 'store']);
    Route::put('/communities/{community}', [CommunityController::class, 'update']);
    Route::delete('/communities/{community}', [CommunityController::class, 'destroy']);

    // Join community
    Route::post('/communities/{community}/join', [CommunityController::class, 'join']);

    // Approve / Reject
    Route::post('/community-members/{id}/approve', [CommunityController::class, 'approve']);
    Route::post('/community-members/{id}/reject', [CommunityController::class, 'reject']);

    // Quiz Attempt
    Route::post('/quizzes/{quiz}/start', [QuizAttemptController::class, 'start']);
    Route::get('/attempts/{attempt}', [QuizAttemptController::class, 'show']);
    Route::post('/attempts/{attempt}/answer', [QuizAttemptController::class, 'submitAnswer']);
    Route::post('/attempts/{attempt}/submit', [QuizAttemptController::class, 'submit']);
    Route::get('/attempts/{attempt}/review', [QuizAttemptController::class, 'review']);
    Route::put('/answers/{id}/grade', [QuizAttemptController::class, 'gradeAnswer']);

    // Leaderboard
    Route::get('/quizzes/{quiz}/leaderboard', [QuizController::class, 'leaderboard']);

    // Favorites
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{favorite}', [FavoriteController::class, 'destroy']);

});

/*
|--------------------------------------------------------------------------
| Category Routes (Admin + Quiz Maker)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:admin,quiz_maker'])->group(function () {

    // Category
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);

    // Manual Reviews
    Route::get('/reviews/pending', [QuizAttemptController::class, 'pendingReviews']);

    // Dashboard
    Route::get('/dashboard/quiz-maker', [DashboardController::class, 'quizMakerDashboard']);

    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    // Quiz
    Route::get('/quizzes', [QuizController::class, 'index']);      // GET ALL
    Route::post('/quizzes', [QuizController::class, 'store']);     // CREATE
    Route::get('/quizzes/{quiz}', [QuizController::class, 'show']); // GET ONE
    Route::put('/quizzes/{quiz}', [QuizController::class, 'update']); // UPDATE
    Route::put('/quizzes/{quiz}', [QuizController::class, 'update']); // UPDATE (PATCH)
    Route::post('/quizzes/{quiz}', [QuizController::class, 'update']); // UPDATE (multipart/form-data friendly)
    Route::delete('/quizzes/{quiz}', [QuizController::class, 'destroy']); // DELETE

    // Questions
    Route::post('/questions/mcq', [QuestionController::class, 'storeMcq']);
    Route::post('/questions/true-false', [QuestionController::class, 'storeTrueFalse']);
    Route::post('/questions/short-answer', [QuestionController::class, 'storeShortAnswer']);

    // Options
    Route::get('/questions/{question}/options', [QuestionOptionController::class, 'index']);
    Route::post('/options', [QuestionOptionController::class, 'store']);
    Route::put('/options/{option}', [QuestionOptionController::class, 'update']);
    Route::delete('/options/{option}', [QuestionOptionController::class, 'destroy']);

});

/*
|--------------------------------------------------------------------------
| Admin Only Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    // User Management
    Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index']);
    Route::put('/users/{id}/role', [\App\Http\Controllers\Admin\UserController::class, 'updateRole']);
});

