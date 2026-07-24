<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiInsight extends Model
{
    use HasFactory;

    protected $table = 'ai_insights';

    protected $fillable = ['desa_id', 'insight', 'raw_data', 'period_start', 'period_end'];

    protected function casts(): array
    {
        return [
            'raw_data' => 'array',
            'period_start' => 'date',
            'period_end' => 'date',
        ];
    }

    public function desa()
    {
        return $this->belongsTo(Desa::class);
    }
}
