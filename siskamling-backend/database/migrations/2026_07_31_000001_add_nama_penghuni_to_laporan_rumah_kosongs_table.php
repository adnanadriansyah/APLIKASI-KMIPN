<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('laporan_rumah_kosongs', function (Blueprint $table) {
            $table->string('nama_penghuni')->nullable()->after('alamat');
        });
    }

    public function down(): void
    {
        Schema::table('laporan_rumah_kosongs', function (Blueprint $table) {
            $table->dropColumn('nama_penghuni');
        });
    }
};
