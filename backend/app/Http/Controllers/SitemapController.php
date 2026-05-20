<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Category;
use App\Models\Community;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;

class SitemapController extends Controller
{
    public function index()
    {
        $sitemap = Sitemap::create();

        // 1. Homepage
        $sitemap->add(Url::create('/')
            ->setPriority(1.0)
            ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY));

        // 2. All Quizzes (Using cursor for efficiency, mapping to valid frontend routes)
        Quiz::select('id', 'updated_at')->where('status', 'published')->cursor()->each(function (Quiz $quiz) use ($sitemap) {
            $sitemap->add(Url::create("/quizzes/{$quiz->id}")
                ->setLastModificationDate($quiz->updated_at)
                ->setPriority(0.8)
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY));
        });

        // 3. All Communities (Mapping to valid frontend routes)
        Community::select('id', 'updated_at')->where('status', 'published')->cursor()->each(function (Community $community) use ($sitemap) {
            $sitemap->add(Url::create("/communities/{$community->id}")
                ->setLastModificationDate($community->updated_at)
                ->setPriority(0.7)
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY));
        });

        return $sitemap->toResponse(request());
    }
}
