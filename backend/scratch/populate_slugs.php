<?php

use App\Models\Quiz;
use App\Models\Category;
use App\Models\Community;
use Illuminate\Support\Str;

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Populating slugs...\n";

Quiz::whereNull('slug')->cursor()->each(function ($quiz) {
    $quiz->slug = Str::slug($quiz->title) . '-' . uniqid();
    $quiz->save();
    echo "Quiz: {$quiz->title} -> {$quiz->slug}\n";
});

Category::whereNull('slug')->cursor()->each(function ($category) {
    $category->slug = Str::slug($category->name);
    $category->save();
    echo "Category: {$category->name} -> {$category->slug}\n";
});

Community::whereNull('slug')->cursor()->each(function ($community) {
    $community->slug = Str::slug($community->name) . '-' . uniqid();
    $community->save();
    echo "Community: {$community->name} -> {$community->slug}\n";
});

echo "Done!\n";
