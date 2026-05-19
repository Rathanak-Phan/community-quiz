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
        // 1. Modify quiz_attempts table
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('anonymous_name')->nullable()->after('is_anonymous');
        });

        // 2. Modify submissions table
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
        Schema::table('submissions', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('anonymous_name')->nullable()->after('is_anonymous');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Clean up records with null user_id to avoid constraint violations
        \Illuminate\Support\Facades\DB::table('quiz_attempts')->whereNull('user_id')->delete();
        \Illuminate\Support\Facades\DB::table('submissions')->whereNull('user_id')->delete();

        // 1. Revert quiz_attempts table
        try {
            Schema::table('quiz_attempts', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });
        } catch (\Exception $e) {}

        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            try { $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete(); } catch (\Exception $e) {}
            $table->dropColumn('anonymous_name');
        });

        // 2. Revert submissions table
        try {
            Schema::table('submissions', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });
        } catch (\Exception $e) {}

        Schema::table('submissions', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            try { $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete(); } catch (\Exception $e) {}
            $table->dropColumn('anonymous_name');
        });
    }
};
