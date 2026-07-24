<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $tables = [
            'users',
            'laporan_kamtibmas',
            'laporan_kamtibmas_media',
            'laporan_rumah_kosongs',
            'panic_button_logs',
            'notification_logs',
        ];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->softDeletes();
            });
        }
    }

    public function down(): void
    {
        $tables = [
            'users',
            'laporan_kamtibmas',
            'laporan_kamtibmas_media',
            'laporan_rumah_kosongs',
            'panic_button_logs',
            'notification_logs',
        ];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }
};
