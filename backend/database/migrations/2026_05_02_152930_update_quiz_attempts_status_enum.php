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
        DB::statement("ALTER TABLE quiz_attempts MODIFY COLUMN status ENUM('in_progress', 'completed', 'submitted') DEFAULT 'in_progress'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Update 'submitted' status to 'completed' before reverting the ENUM
        DB::table('quiz_attempts')->where('status', 'submitted')->update(['status' => 'completed']);

        DB::statement("ALTER TABLE quiz_attempts MODIFY COLUMN status ENUM('in_progress', 'completed') DEFAULT 'in_progress'");
    }
};
