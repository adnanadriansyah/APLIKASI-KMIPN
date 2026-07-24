<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LaporanKamtibmasMedia extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'laporan_kamtibmas_media';

    protected $fillable = ['laporan_kamtibmas_id', 'type', 'file_path'];

    public function laporanKamtibmas()
    {
        return $this->belongsTo(LaporanKamtibmas::class);
    }
}
