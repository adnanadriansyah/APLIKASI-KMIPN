<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Polsek extends Model
{
    use HasFactory;

    protected $fillable = ['nama', 'alamat', 'kontak_wa', 'telegram_chat_id'];

    public function desas()
    {
        return $this->hasMany(Desa::class);
    }

    public function linmas()
    {
        return $this->hasMany(Linmas::class);
    }
}
