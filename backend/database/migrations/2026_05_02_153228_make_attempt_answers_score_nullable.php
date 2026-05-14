<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('attempt_answers', function (Blueprint $table) {
            $table->integer('score')->nullable()->change();
            $table->boolean('is_correct')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Fix for MySQL: update NULL values before making columns NOT NULL
        DB::table('attempt_answers')->whereNull('score')->update(['score' => 0]);
        DB::table('attempt_answers')->whereNull('is_correct')->update(['is_correct' => 0]);

        Schema::table('attempt_answers', function (Blueprint $table) {
            $table->integer('score')->default(0)->nullable(false)->change();
            $table->boolean('is_correct')->nullable(false)->change();
        });
    }
};
