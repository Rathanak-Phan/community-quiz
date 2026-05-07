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
        if (Schema::hasTable('favorites')) {
            Schema::table('favorites', function (Blueprint $table) {
                // Drop foreign key on user_id first as it depends on the unique index
                try {
                    $table->dropForeign(['user_id']);
                } catch (\Exception $e) {
                    // Ignore if it doesn't exist
                }
                
                try {
                    $table->dropUnique('user_favorite_unique');
                } catch (\Exception $e) {
                    // Ignore if it doesn't exist
                }

                if (Schema::hasColumn('favorites', 'favoritable_id')) {
                    $table->dropColumn('favoritable_id');
                }
                if (Schema::hasColumn('favorites', 'favoritable_type')) {
                    $table->dropColumn('favoritable_type');
                }
                
                if (!Schema::hasColumn('favorites', 'quiz_id')) {
                    $table->unsignedBigInteger('quiz_id')->nullable()->after('user_id');
                }
                if (!Schema::hasColumn('favorites', 'category_id')) {
                    $table->unsignedBigInteger('category_id')->nullable()->after('quiz_id');
                }
            });

            // Re-add foreign keys in a separate block
            Schema::table('favorites', function (Blueprint $table) {
                try {
                    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                } catch (\Exception $e) {}
                
                try {
                    $table->foreign('quiz_id')->references('id')->on('quizzes')->onDelete('cascade');
                } catch (\Exception $e) {}
                
                try {
                    $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
                } catch (\Exception $e) {}
            });
        }
    }
};
