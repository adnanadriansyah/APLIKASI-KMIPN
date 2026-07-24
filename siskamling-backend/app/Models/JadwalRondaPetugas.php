<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JadwalRondaPetugas extends Model
{
    use HasFactory;

    protected $table = 'jadwal_ronda_petugas';

    protected $fillable = ['jadwal_ronda_id', 'user_id', 'status_hadir'];

    public function jadwalRonda()
    {
        return $this->belongsTo(JadwalRonda::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function qrcodeRonda()
    {
        return $this->hasOne(QrcodeRonda::class);
    }
}
