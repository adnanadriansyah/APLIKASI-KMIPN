<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JadwalRonda extends Model
{
    use HasFactory;

    protected $fillable = ['dusun_id', 'tanggal', 'shift', 'status'];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
        ];
    }

    public function dusun()
    {
        return $this->belongsTo(Dusun::class);
    }

    public function jadwalRondaPetugas()
    {
        return $this->hasMany(JadwalRondaPetugas::class);
    }
}
