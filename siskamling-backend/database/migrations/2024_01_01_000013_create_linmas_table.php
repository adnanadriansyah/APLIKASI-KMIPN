<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('linmas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('polsek_id')->constrained('polseks')->cascadeOnDelete();
            $table->string('nama');
            $table->string('jabatan')->nullable();
            $table->string('no_hp')->nullable();
            $table->string('wilayah_tugas')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('linmas');
    }
};
