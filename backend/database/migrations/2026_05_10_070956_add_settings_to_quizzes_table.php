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
        Schema::table('quizzes', function (Blueprint $table) {
            $table->boolean('has_timer')->default(false)->after('description');
            $table->integer('default_time_limit')->default(30)->after('has_timer');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            if (Schema::hasColumn('quizzes', 'has_timer')) {
                $table->dropColumn('has_timer');
            }
            if (Schema::hasColumn('quizzes', 'default_time_limit')) {
                $table->dropColumn('default_time_limit');
            }
        });
    }
};
