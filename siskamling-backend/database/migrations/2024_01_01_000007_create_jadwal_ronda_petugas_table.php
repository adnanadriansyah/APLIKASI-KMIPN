<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jadwal_ronda_petugas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jadwal_ronda_id')->constrained('jadwal_rondas')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status_hadir')->default('dijadwalkan'); // dijadwalkan, hadir, tidak_hadir
            $table->timestamps();

            $table->unique(['jadwal_ronda_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwal_ronda_petugas');
    }
};
