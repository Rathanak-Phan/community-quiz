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
        Schema::table('favorites', function (Blueprint $table) {
            if (Schema::hasColumn('favorites', 'quiz_id')) {
                $table->dropForeign(['quiz_id']);
                $table->dropColumn('quiz_id');
            }
            if (Schema::hasColumn('favorites', 'category_id')) {
                $table->dropForeign(['category_id']);
                $table->dropColumn('category_id');
            }
            if (!Schema::hasColumn('favorites', 'favoritable_id')) {
                $table->unsignedBigInteger('favoritable_id')->after('user_id');
            }
            if (!Schema::hasColumn('favorites', 'favoritable_type')) {
                $table->string('favoritable_type')->after('favoritable_id');
            }
        });

        Schema::table('favorites', function (Blueprint $table) {
            $table->unique(['user_id', 'favoritable_id', 'favoritable_type'], 'user_favorite_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('favorites', function (Blueprint $table) {
            $table->dropUnique('user_favorite_unique');
            $table->dropColumn(['favoritable_id', 'favoritable_type']);
            $table->unsignedBigInteger('quiz_id')->nullable()->after('user_id');
            $table->unsignedBigInteger('category_id')->nullable()->after('quiz_id');
        });
    }
};
