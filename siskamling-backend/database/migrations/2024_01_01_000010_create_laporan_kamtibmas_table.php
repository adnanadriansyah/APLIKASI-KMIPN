<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('laporan_kamtibmas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('dusun_id')->constrained('dusuns')->cascadeOnDelete();
            $table->string('kategori'); // config('siskamling.kategori_kamtibmas')
            $table->string('lokasi_text')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->text('kronologi');
            $table->text('ai_summary')->nullable();
            $table->string('status')->default('baru'); // baru, diproses, selesai
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laporan_kamtibmas');
    }
};
