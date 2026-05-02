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
        Schema::table('question_options', function (Blueprint $table) {
            if (!Schema::hasColumn('question_options', 'question_id')) {
                $table->foreignId('question_id')->after('id')->constrained()->cascadeOnDelete();
            }
            if (!Schema::hasColumn('question_options', 'option_text')) {
                $table->string('option_text')->after('question_id');
            }
            if (!Schema::hasColumn('question_options', 'is_correct')) {
                $table->boolean('is_correct')->default(false)->after('option_text');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('question_options', function (Blueprint $table) {
            $table->dropForeign(['question_id']);
            $table->dropColumn(['question_id', 'option_text', 'is_correct']);
        });
    }
};
