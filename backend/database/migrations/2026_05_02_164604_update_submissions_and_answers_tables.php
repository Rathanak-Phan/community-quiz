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
        Schema::table('submissions', function (Blueprint $table) {
            $table->integer('max_score')->default(0)->after('score');
            $table->enum('grading_status', ['pending', 'graded'])->default('graded')->after('max_score');
            $table->foreignId('quiz_attempt_id')->nullable()->after('user_id')->constrained('quiz_attempts')->nullOnDelete();
        });

        Schema::table('answers', function (Blueprint $table) {
            $table->foreignId('selected_option_id')->nullable()->after('question_id')->constrained('question_options')->nullOnDelete();
            $table->boolean('answer_boolean')->nullable()->after('selected_option_id');
            $table->decimal('score', 8, 2)->nullable()->after('is_correct');
            $table->text('feedback')->nullable()->after('score');
            $table->foreignId('graded_by')->nullable()->after('feedback')->constrained('users')->nullOnDelete();
            $table->timestamp('graded_at')->nullable()->after('graded_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropForeign(['quiz_attempt_id']);
            $table->dropColumn(['max_score', 'grading_status', 'quiz_attempt_id']);
        });

        Schema::table('answers', function (Blueprint $table) {
            $table->dropForeign(['selected_option_id']);
            $table->dropForeign(['graded_by']);
            $table->dropColumn(['selected_option_id', 'answer_boolean', 'score', 'feedback', 'graded_by', 'graded_at']);
        });
    }
};
