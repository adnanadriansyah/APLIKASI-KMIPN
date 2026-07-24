<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dusun extends Model
{
    use HasFactory;

    protected $fillable = ['desa_id', 'nama'];

    public function desa()
    {
        return $this->belongsTo(Desa::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function jadwalRondas()
    {
        return $this->hasMany(JadwalRonda::class);
    }

    public function laporanKamtibmas()
    {
        return $this->hasMany(LaporanKamtibmas::class);
    }
}
