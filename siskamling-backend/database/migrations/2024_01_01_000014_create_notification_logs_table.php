<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('polsek_id')->nullable()->constrained('polseks')->nullOnDelete();
            // relasi opsional ke sumber notifikasi, untuk keperluan tracing/debug
            $table->foreignId('panic_button_log_id')->nullable()->constrained('panic_button_logs')->nullOnDelete();
            $table->foreignId('laporan_kamtibmas_id')->nullable()->constrained('laporan_kamtibmas')->nullOnDelete();
            $table->string('channel'); // whatsapp, telegram, websocket
            $table->string('target_number')->nullable();
            $table->string('status')->default('pending'); // pending, sent, failed
            $table->text('payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};
