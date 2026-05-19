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
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->string('challenge_token')->nullable()->after('anonymous_name');
        });

        Schema::table('submissions', function (Blueprint $table) {
            $table->string('challenge_token')->nullable()->after('anonymous_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->dropColumn('challenge_token');
        });

        Schema::table('submissions', function (Blueprint $table) {
            $table->dropColumn('challenge_token');
        });
    }
};
