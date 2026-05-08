<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->nullable();
            $table->string('headline')->nullable();
            $table->text('bio')->nullable();
            $table->string('location')->nullable();
            $table->string('website')->nullable();
            $table->string('github_handle')->nullable();
            $table->string('twitter_handle')->nullable();
            $table->string('linkedin_handle')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'avatar', 'headline', 'bio', 'location', 'website', 
                'github_handle', 'twitter_handle', 'linkedin_handle'
            ]);
        });
    }
};
