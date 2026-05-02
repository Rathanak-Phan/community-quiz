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
        Schema::create('attempt_answers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('quiz_attempt_id')
                ->constrained('quiz_attempts')
                ->cascadeOnDelete();

            $table->foreignId('question_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('selected_option_id')
                ->nullable()
                ->constrained('question_options')
                ->nullOnDelete();

            $table->boolean('answer_boolean')->nullable();

            $table->text('answer_text')->nullable();

            $table->timestamps();

            // Ensure only one answer per question per attempt
            $table->unique(['quiz_attempt_id', 'question_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attempt_answers');
    }
};
