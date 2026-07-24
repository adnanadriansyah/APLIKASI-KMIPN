<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Desa extends Model
{
    use HasFactory;

    protected $fillable = ['polsek_id', 'nama'];

    public function polsek()
    {
        return $this->belongsTo(Polsek::class);
    }

    public function dusuns()
    {
        return $this->hasMany(Dusun::class);
    }
}
