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
use App\Http\Controllers\SiteSettingController;
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
Route::get('/share/result/{id}', [ShareController::class, 'showSharePreview'])->name('share.result.preview');

// Public Browsing
Route::get('/communities', [CommunityController::class, 'index']);
Route::get('/communities/{community}', [CommunityController::class, 'show']);
Route::get('/communities/{community}/quizzes', [CommunityController::class, 'quizzes']);
Route::get('/quizzes', [QuizController::class, 'index']);
Route::get('/quizzes/trending', [\App\Http\Controllers\LeaderboardController::class, 'trendingQuizzes']);
Route::get('/system-stats', [\App\Http\Controllers\LeaderboardController::class, 'systemStats']);
Route::get('/leaderboard', [\App\Http\Controllers\LeaderboardController::class, 'index']);
Route::get('/leaderboard/top-users', [\App\Http\Controllers\LeaderboardController::class, 'topUsers']);
Route::get('/leaderboard/my-rank', [\App\Http\Controllers\LeaderboardController::class, 'myRank'])->middleware('auth:sanctum');
Route::get('/settings', [SiteSettingController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Protected Routes (ALL AUTH USERS)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/profile/avatar', [AuthController::class, 'updateAvatar']);

    // Community Join & Leave
    Route::post('/communities/{community}/join', [CommunityController::class, 'join']);
    Route::post('/communities/{community}/leave', [CommunityController::class, 'leave']);

    // User's own attempts & submissions
    Route::get('/my-attempts', [QuizAttemptController::class, 'myAttempts']);
    Route::get('/my-submissions', [QuizAttemptController::class, 'mySubmissions']);

    // Community Member Management
    Route::get('/communities/{community}/pending-members', [CommunityController::class, 'pendingMembers']);
    Route::post('/community-members/{id}/approve', [CommunityController::class, 'approve']);
    Route::post('/community-members/{id}/reject', [CommunityController::class, 'reject']);

    // Quiz Attempt
    Route::post('/quizzes/{quiz}/start', [QuizAttemptController::class, 'start']);
    Route::get('/attempts/{attempt}', [QuizAttemptController::class, 'show']);
    Route::post('/attempts/{attempt}/answer', [QuizAttemptController::class, 'submitAnswer']);
    Route::post('/attempts/{attempt}/submit', [QuizAttemptController::class, 'submit']);
    Route::get('/attempts/{attempt}/review', [QuizAttemptController::class, 'review']);
    Route::put('/answers/{id}/grade', [QuizAttemptController::class, 'gradeAnswer']);

    // Protected Stats
    Route::get('/quizzes/{quiz}/leaderboard', [QuizController::class, 'leaderboard']);

    // Favorites
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{favorite}', [FavoriteController::class, 'destroy']);

    // Maker Request
    Route::post('/maker-request', [\App\Http\Controllers\MakerRequestController::class, 'apply']);
    Route::get('/maker-status', [\App\Http\Controllers\MakerRequestController::class, 'status']);

    // Dashboard
    Route::get('/dashboard/student', [DashboardController::class, 'studentDashboard']);

    // Quiz Browsing (All authenticated users)
    Route::get('/quizzes/my', [\App\Http\Controllers\Quiz\QuizController::class, 'myQuizzes']);
    Route::get('/my-communities', [CommunityController::class, 'myCommunities']);
});

Route::get('/quizzes/{quiz}', [QuizController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Category & Management Routes (Admin + Quiz Maker)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:admin,quiz_maker'])->group(function () {

    // Category Management
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    // Community Management
    Route::post('/communities', [CommunityController::class, 'store']);
    Route::put('/communities/{community}', [CommunityController::class, 'update']);
    Route::delete('/communities/{community}', [CommunityController::class, 'destroy']);

    // Manual Reviews
    Route::get('/reviews/pending', [QuizAttemptController::class, 'pendingReviews']);

    // Dashboard
    Route::get('/dashboard/quiz-maker', [DashboardController::class, 'quizMakerDashboard']);
    Route::get('/dashboard/admin', [DashboardController::class, 'adminDashboard']);

    // Quiz Management
    Route::post('/quizzes', [QuizController::class, 'store']);
    Route::put('/quizzes/{quiz}', [QuizController::class, 'update']);
    Route::post('/quizzes/{quiz}', [QuizController::class, 'update']); // multipart support
    Route::delete('/quizzes/{quiz}', [QuizController::class, 'destroy']);

    // Questions & Options
    Route::get('/quizzes/{quiz}/questions', [QuestionController::class, 'index']);
    Route::post('/questions/mcq', [QuestionController::class, 'storeMcq']);
    Route::post('/questions/true-false', [QuestionController::class, 'storeTrueFalse']);
    Route::post('/questions/short-answer', [QuestionController::class, 'storeShortAnswer']);
    Route::put('/questions/{question}', [QuestionController::class, 'update']);
    Route::delete('/questions/{question}', [QuestionController::class, 'destroy']);
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
    Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index']);
    Route::put('/users/{id}/role', [\App\Http\Controllers\Admin\UserController::class, 'updateRole']);
    Route::delete('/users/{id}', [\App\Http\Controllers\Admin\UserController::class, 'destroy']);
    Route::get('/quizzes', [\App\Http\Controllers\Admin\QuizModerationController::class, 'index']);
    Route::delete('/quizzes/{id}', [\App\Http\Controllers\Admin\QuizModerationController::class, 'destroy']);
    Route::get('/quizzes/{id}/favorites', [\App\Http\Controllers\Admin\QuizModerationController::class, 'quizFavorites']);
    Route::get('/communities', [\App\Http\Controllers\Admin\CommunityModerationController::class, 'index']);
    Route::delete('/communities/{id}', [\App\Http\Controllers\Admin\CommunityModerationController::class, 'destroy']);
    Route::get('/maker-requests', [\App\Http\Controllers\Admin\MakerRequestController::class, 'index']);
    Route::get('/maker-requests/count', [\App\Http\Controllers\Admin\MakerRequestController::class, 'count']);
    Route::post('/maker-requests/{id}/approve', [\App\Http\Controllers\Admin\MakerRequestController::class, 'approve']);
    Route::post('/maker-requests/{id}/reject', [\App\Http\Controllers\Admin\MakerRequestController::class, 'reject']);
    Route::post('/settings', [SiteSettingController::class, 'update']);
});

