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
use App\Models\User;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [\App\Http\Controllers\Auth\ForgotPasswordController::class, 'sendResetLinkEmail']);
Route::post('/verify-reset-code', [\App\Http\Controllers\Auth\ForgotPasswordController::class, 'verifyResetCode']);
Route::post('/reset-password', [\App\Http\Controllers\Auth\ForgotPasswordController::class, 'reset']);

// OAuth
Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirect']);
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'callback']);

// For Postman testing
Route::post('/login-token', [AuthController::class, 'loginToken']);

// Email Verification
Route::get('/email/verify/{id}/{hash}', function (Request $request, $id, $hash) {
    $user = User::findOrFail($id);

    if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
        return response()->json(['message' => 'Invalid verification link'], 403);
    }

    if ($user->hasVerifiedEmail()) {
        return response()->json(['message' => 'Email already verified']);
    }

    if ($user->markEmailAsVerified()) {
        event(new \Illuminate\Auth\Events\Verified($user));
    }

    return response()->json([
        'message' => 'Email verified successfully. You can now login.'
    ]);
})->middleware(['signed'])->name('verification.verify');

Route::post('/email/verification-notification', function (Request $request) {
    $request->validate(['email' => 'required|email']);
    $user = User::where('email', $request->email)->first();

    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    if ($user->hasVerifiedEmail()) {
        return response()->json(['message' => 'Email already verified']);
    }

    $user->sendEmailVerificationNotification();

    return response()->json(['message' => 'Verification link sent']);
})->middleware(['throttle:6,1'])->name('verification.send');

Route::post('/email/verify-code', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'code' => 'required|string|size:6'
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user || !$user->verifyOTP($request->code)) {
        return response()->json(['message' => 'Invalid or expired code'], 400);
    }

    if ($user->hasVerifiedEmail()) {
        return response()->json(['message' => 'Email already verified']);
    }

    if ($user->markEmailAsVerified()) {
        event(new \Illuminate\Auth\Events\Verified($user));
    }

    return response()->json(['message' => 'Email verified successfully']);
});

// Sharing
Route::get('/quizzes/{id}/share', [ShareController::class, 'shareQuiz']);
Route::get('/submissions/{id}/share', [ShareController::class, 'shareResult']);
Route::get('/share/result/{id}', [ShareController::class, 'showSharePreview'])->name('share.result.preview');
Route::get('/share/quiz/{id}', [ShareController::class, 'showQuizPreview'])->name('share.quiz.preview');

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
Route::get('/users/{id}/profile', [\App\Http\Controllers\User\UserProfileController::class, 'show']);

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
    Route::post('/communities/join-by-code', [CommunityController::class, 'joinByCode']);
    Route::post('/communities/{community}/join', [CommunityController::class, 'join']);
    Route::post('/communities/{community}/leave', [CommunityController::class, 'leave']);
    Route::post('/communities/{community}/regenerate-invite-code', [CommunityController::class, 'regenerateInviteCode']);

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
    Route::post('/favorites/toggle', [FavoriteController::class, 'toggle']);
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
    Route::post('/quizzes/{quiz}/apply-default-timer', [QuizController::class, 'applyDefaultTimer']);
    Route::get('/quizzes/{quiz}/attempts', [QuizAttemptController::class, 'indexByQuiz']);

    // Questions & Options
    Route::get('/quizzes/{quiz}/questions', [QuestionController::class, 'index']);
    Route::post('/questions/mcq', [QuestionController::class, 'storeMcq']);
    Route::post('/questions/true-false', [QuestionController::class, 'storeTrueFalse']);
    Route::post('/questions/short-answer', [QuestionController::class, 'storeShortAnswer']);
    Route::put('/questions/{question}', [QuestionController::class, 'update']);
    Route::post('/questions/{question}', [QuestionController::class, 'update']); // multipart support
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
    Route::get('/users/stats', [\App\Http\Controllers\Admin\UserController::class, 'stats']);
    Route::post('/users', [\App\Http\Controllers\Admin\UserController::class, 'store']);
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

