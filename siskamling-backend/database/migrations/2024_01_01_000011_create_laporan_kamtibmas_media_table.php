<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('laporan_kamtibmas_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laporan_kamtibmas_id')->constrained('laporan_kamtibmas')->cascadeOnDelete();
            $table->string('type'); // foto, video
            $table->string('file_path');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laporan_kamtibmas_media');
    }
};
