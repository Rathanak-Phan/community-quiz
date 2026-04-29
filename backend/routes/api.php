<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\QuizMaker\CategoryController;
use App\Http\Controllers\QuizMaker\CommunityController;
use App\Http\Controllers\QuizMaker\QuizController;
use App\Http\Controllers\QuizMaker\QuestionOptionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// For Postman testing
Route::post('/login-token', [AuthController::class, 'loginToken']);

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

    // Options
    Route::get('/questions/{question}/options', [QuestionOptionController::class, 'index']);
    Route::post('/options', [QuestionOptionController::class, 'store']);
    Route::put('/options/{option}', [QuestionOptionController::class, 'update']);
    Route::delete('/options/{option}', [QuestionOptionController::class, 'destroy']);

});

