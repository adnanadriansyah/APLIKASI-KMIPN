<?php

namespace App\Jobs;

use App\Models\NotificationLog;
use App\Models\PanicButtonLog;
use App\Models\Polsek;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendPanicNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public PanicButtonLog $panic;

    public Polsek $polsek;

    public function __construct(PanicButtonLog $panic, Polsek $polsek)
    {
        $this->panic = $panic;
        $this->polsek = $polsek;
    }

    public function handle(): void
    {
        $payload = [
            'panic_id' => $this->panic->id,
            'user_nama' => $this->panic->user->nama,
            'user_phone' => $this->panic->user->phone,
            'latitude' => $this->panic->latitude,
            'longitude' => $this->panic->longitude,
            'waktu' => $this->panic->created_at->toIso8601String(),
        ];

        if ($this->polsek->kontak_wa) {
            $log = NotificationLog::create([
                'polsek_id' => $this->polsek->id,
                'panic_button_log_id' => $this->panic->id,
                'channel' => 'whatsapp',
                'target_number' => $this->polsek->kontak_wa,
                'status' => 'pending',
                'payload' => $payload,
            ]);

            SendWhatsappNotification::dispatch($log);
        }

        if ($this->polsek->telegram_chat_id) {
            $log = NotificationLog::create([
                'polsek_id' => $this->polsek->id,
                'panic_button_log_id' => $this->panic->id,
                'channel' => 'telegram',
                'target_number' => $this->polsek->telegram_chat_id,
                'status' => 'pending',
                'payload' => $payload,
            ]);

            SendTelegramNotification::dispatch($log);
        }
    }
}
