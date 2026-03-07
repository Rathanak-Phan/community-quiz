<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains over 2000 video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the Laravel [Patreon page](https://patreon.com/taylorotwell).

### Premium Partners

- **[Vehikl](https://vehikl.com/)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Cubet Techno Labs](https://cubettech.com)**
- **[Cyber-Duck](https://cyber-duck.co.uk)**
- **[Many](https://www.many.co.uk)**
- **[Webdock, Fast VPS Hosting](https://www.webdock.io/en)**
- **[DevSquad](https://devsquad.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel/)**
- **[OP.GG](https://op.gg)**
- **[WebReinvent](https://webreinvent.com/?utm_source=laravel&utm_medium=github&utm_campaign=patreon-sponsors)**
- **[Lendio](https://lendio.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).




# 📁 Full Backend Folder Structure (Laravel)

```
backend/
│
├── app/
│   │
│   ├── Console/
│   │
│   ├── Exceptions/
│   │
│   ├── Http/
│   │   │
│   │   ├── Controllers/
│   │   │   │
│   │   │   ├── Auth/
│   │   │   │   ├── AuthController.php
│   │   │   │
│   │   │   ├── CategoryController.php
│   │   │   ├── CommunityController.php
│   │   │   ├── QuizController.php
│   │   │   ├── QuestionController.php
│   │   │   ├── AttemptController.php
│   │   │   ├── LeaderboardController.php
│   │   │   ├── FavoriteController.php
│   │   │   ├── DashboardController.php
│   │   │   └── SubmissionController.php
│   │   │
│   │   ├── Middleware/
│   │   │   ├── AdminMiddleware.php
│   │   │   ├── QuizMakerMiddleware.php
│   │   │   └── RoleMiddleware.php
│   │   │
│   │   ├── Requests/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginRequest.php
│   │   │   │   └── RegisterRequest.php
│   │   │   │
│   │   │   ├── CategoryRequest.php
│   │   │   ├── CommunityRequest.php
│   │   │   ├── QuizRequest.php
│   │   │   ├── QuestionRequest.php
│   │   │   └── AttemptRequest.php
│   │
│   ├── Models/
│   │   ├── User.php
│   │   ├── Category.php
│   │   ├── Community.php
│   │   ├── Quiz.php
│   │   ├── Question.php
│   │   ├── Answer.php
│   │   ├── Attempt.php
│   │   ├── Submission.php
│   │   ├── Favorite.php
│   │   └── CommunityMember.php
│   │
│   ├── Services/
│   │   ├── AuthService.php
│   │   ├── QuizService.php
│   │   ├── AttemptService.php
│   │   └── LeaderboardService.php
│   │
│   ├── Policies/
│   │   ├── CategoryPolicy.php
│   │   ├── QuizPolicy.php
│   │   └── CommunityPolicy.php
│   │
│   └── Helpers/
│       └── ImageUploadHelper.php
│
│
├── bootstrap/
│
├── config/
│
├── database/
│   │
│   ├── factories/
│   │
│   ├── migrations/
│   │   ├── create_users_table.php
│   │   ├── create_categories_table.php
│   │   ├── create_communities_table.php
│   │   ├── create_community_members_table.php
│   │   ├── create_quizzes_table.php
│   │   ├── create_questions_table.php
│   │   ├── create_answers_table.php
│   │   ├── create_attempts_table.php
│   │   ├── create_submissions_table.php
│   │   └── create_favorites_table.php
│   │
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── UserSeeder.php
│       ├── CategorySeeder.php
│       └── QuizSeeder.php
│
│
├── public/
│   └── index.php
│
├── routes/
│   ├── api.php
│   └── web.php
│
├── storage/
│   └── app/public/
│       ├── category-images/
│       ├── quiz-covers/
│       ├── community-covers/
│       └── question-images/
│
├── tests/
│
├── .env
├── composer.json
└── artisan
```

---

# 🧠 Important Backend Modules (Aligned With Project Scope)

Your backend **must match your system features**.

---

# 1️⃣ Authentication Module

Folder:

```
app/Http/Controllers/Auth/
```

Controller

```
AuthController.php
```

Functions

```
register()
login()
logout()
me()
```

Authentication method:

```
Laravel Sanctum
```

---

# 2️⃣ Category Management

Controller

```
CategoryController.php
```

Functions

```
index()
store()
show()
update()
destroy()
```

Rules:

| Role       | Permission |
| ---------- | ---------- |
| Admin      | CRUD all   |
| Quiz Maker | CRUD own   |

---

# 3️⃣ Community Management

Controller

```
CommunityController.php
```

Functions

```
createCommunity()
updateCommunity()
deleteCommunity()
joinCommunity()
approveJoinRequest()
```

Database

```
communities
community_members
```

---

# 4️⃣ Quiz Management

Controller

```
QuizController.php
```

Functions

```
createQuiz()
updateQuiz()
deleteQuiz()
getQuiz()
getCommunityQuizzes()
```

Quiz belongs to:

```
category
community
quiz_maker
```

---

# 5️⃣ Question Types

Controller

```
QuestionController.php
```

Question types:

```
MCQ
TRUE_FALSE
SHORT_ANSWER
```

---

# 6️⃣ Quiz Attempt

Controller

```
AttemptController.php
```

Functions

```
startAttempt()
submitAttempt()
saveForLater()
```

Database

```
attempts
submissions
```

---

# 7️⃣ Auto Grading

Auto grade:

```
MCQ
True / False
```

Manual grade:

```
Short Answer
```

Handled inside

```
AttemptService.php
```

---

# 8️⃣ Leaderboard

Controller

```
LeaderboardController.php
```

Sort rule:

```
ORDER BY score DESC
IF same score → latest submission first
```

---

# 9️⃣ Favorite System

Controller

```
FavoriteController.php
```

Features

```
save quiz
save category
remove favorite
```

---

# 🔟 Dashboard

Controller

```
DashboardController.php
```

Statistics

```
total categories
total quizzes
total communities
total submissions
pending short answer reviews
```

---

# 📂 Example API Routes

`routes/api.php`

```php
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('communities', CommunityController::class);
    Route::apiResource('quizzes', QuizController::class);

    Route::post('/quiz/{id}/attempt', [AttemptController::class, 'startAttempt']);
    Route::post('/quiz/{id}/submit', [AttemptController::class, 'submitAttempt']);

    Route::get('/leaderboard/{quiz}', [LeaderboardController::class, 'index']);

    Route::post('/favorites', [FavoriteController::class, 'store']);

    Route::get('/dashboard', [DashboardController::class, 'index']);
});
```

---

# 📊 Database Tables Overview

```
users
categories
communities
community_members
quizzes
questions
answers
attempts
submissions
favorites
```

This is **fully normalized database design** (good for thesis defense).

---
