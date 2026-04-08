<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\QuizMaker\CategoryController;
use App\Http\Controllers\QuizMaker\CommunityController;
use Illuminate\Routing\Route;

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
});

/*
|--------------------------------------------------------------------------
| Category Routes (Admin + Quiz Maker)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:admin,quiz_maker'])->group(function () {

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| Quiz Routes (Quiz Maker ONLY)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:quiz_maker'])->group(function () {

    Route::post('/quizzes', [QuizController::class, 'store']);
    Route::put('/quizzes/{id}', [QuizController::class, 'update']);
});
