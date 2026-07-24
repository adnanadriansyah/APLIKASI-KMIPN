<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qrcode_rondas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jadwal_ronda_petugas_id')
                ->unique() // relasi one-to-one sesuai ERD
                ->constrained('jadwal_ronda_petugas')
                ->cascadeOnDelete();
            $table->string('code')->unique();
            $table->boolean('is_used')->default(false);
            $table->timestamp('expired_at')->nullable();
            $table->timestamp('scanned_at')->nullable();
            $table->foreignId('scanned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qrcode_rondas');
    }
};
