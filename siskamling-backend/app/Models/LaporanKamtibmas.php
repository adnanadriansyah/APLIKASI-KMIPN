<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LaporanKamtibmas extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'laporan_kamtibmas';

    protected $fillable = ['user_id', 'dusun_id', 'kategori', 'lokasi_text', 'latitude', 'longitude', 'kronologi', 'ai_summary', 'ai_urgency_level', 'status'];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function dusun()
    {
        return $this->belongsTo(Dusun::class);
    }

    public function media()
    {
        return $this->hasMany(LaporanKamtibmasMedia::class, 'laporan_kamtibmas_id');
    }
}
