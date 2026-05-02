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
        Schema::table('questions', function (Blueprint $table) {
            $table->integer('points')->default(1)->after('question_text');
        });

        Schema::table('attempt_answers', function (Blueprint $table) {
            $table->boolean('is_correct')->nullable()->after('answer_text');
            $table->integer('score')->default(0)->after('is_correct');
        });

        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->integer('max_score')->default(0)->after('score');
            $table->string('grading_status')->default('completed')->after('max_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn('points');
        });

        Schema::table('attempt_answers', function (Blueprint $table) {
            $table->dropColumn(['is_correct', 'score']);
        });

        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->dropColumn(['max_score', 'grading_status']);
        });
    }
};
