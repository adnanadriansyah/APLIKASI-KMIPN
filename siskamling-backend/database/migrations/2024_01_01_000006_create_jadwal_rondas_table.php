<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jadwal_rondas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dusun_id')->constrained('dusuns')->cascadeOnDelete();
            $table->date('tanggal');
            $table->string('shift'); // misal: shift_1, shift_2
            $table->string('status')->default('terjadwal'); // terjadwal, berlangsung, selesai
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwal_rondas');
    }
};
