<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('laporan_rumah_kosongs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('alamat');
            $table->date('tanggal_berangkat');
            $table->date('tanggal_pulang');
            $table->string('kontak_darurat')->nullable();
            $table->string('status')->default('aktif'); // aktif, selesai
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laporan_rumah_kosongs');
    }
};
