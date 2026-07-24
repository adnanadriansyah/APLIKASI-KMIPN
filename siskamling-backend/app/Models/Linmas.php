<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Linmas extends Model
{
    use HasFactory;

    protected $fillable = ['polsek_id', 'nama', 'jabatan', 'no_hp', 'wilayah_tugas'];

    public function polsek()
    {
        return $this->belongsTo(Polsek::class);
    }
}
