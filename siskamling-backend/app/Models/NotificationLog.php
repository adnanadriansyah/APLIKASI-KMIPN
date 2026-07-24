<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class NotificationLog extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'notification_logs';

    protected $fillable = ['polsek_id', 'panic_button_log_id', 'laporan_kamtibmas_id', 'channel', 'target_number', 'status', 'payload'];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
        ];
    }

    public function polsek()
    {
        return $this->belongsTo(Polsek::class);
    }

    public function panicButtonLog()
    {
        return $this->belongsTo(PanicButtonLog::class);
    }

    public function laporanKamtibmas()
    {
        return $this->belongsTo(LaporanKamtibmas::class);
    }
}
