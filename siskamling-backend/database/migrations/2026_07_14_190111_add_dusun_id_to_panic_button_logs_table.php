<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('panic_button_logs', function (Blueprint $table) {
            $table->foreignId('dusun_id')->nullable()->after('user_id')->constrained('dusuns')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('panic_button_logs', function (Blueprint $table) {
            $table->dropForeign(['dusun_id']);
            $table->dropColumn('dusun_id');
        });
    }
};
