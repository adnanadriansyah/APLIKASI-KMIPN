<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LaporanRumahKosong extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'laporan_rumah_kosongs';

    protected $fillable = ['user_id', 'alamat', 'tanggal_berangkat', 'tanggal_pulang', 'kontak_darurat', 'status'];

    protected function casts(): array
    {
        return [
            'tanggal_berangkat' => 'date',
            'tanggal_pulang' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
