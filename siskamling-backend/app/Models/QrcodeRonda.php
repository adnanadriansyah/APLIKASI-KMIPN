<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QrcodeRonda extends Model
{
    use HasFactory;

    protected $table = 'qrcode_rondas';

    protected $fillable = ['jadwal_ronda_petugas_id', 'code', 'is_used', 'expired_at', 'scanned_at', 'scanned_by'];

    protected function casts(): array
    {
        return [
            'is_used' => 'boolean',
            'expired_at' => 'datetime',
            'scanned_at' => 'datetime',
        ];
    }

    public function jadwalRondaPetugas()
    {
        return $this->belongsTo(JadwalRondaPetugas::class);
    }

    public function scannedBy()
    {
        return $this->belongsTo(User::class, 'scanned_by');
    }
}
