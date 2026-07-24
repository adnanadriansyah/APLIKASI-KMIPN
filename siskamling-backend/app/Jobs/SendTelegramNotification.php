<?php

namespace App\Jobs;

use App\Models\NotificationLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendTelegramNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $maxExceptions = 3;

    public NotificationLog $notificationLog;

    public function __construct(NotificationLog $notificationLog)
    {
        $this->notificationLog = $notificationLog;
    }

    public function handle(): void
    {
        $token = config('services.telegram.bot_token');
        if (! $token) {
            $this->fail('TELEGRAM_BOT_TOKEN tidak dikonfigurasi.');

            return;
        }

        $chatId = $this->notificationLog->target_number;
        $payload = $this->notificationLog->payload;

        $message = $this->formatMessage($payload);

        $response = Http::timeout(10)
            ->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => 'HTML',
            ]);

        if ($response->successful()) {
            $this->notificationLog->update(['status' => 'sent']);
        } else {
            $this->notificationLog->update([
                'status' => 'failed',
                'payload' => array_merge($payload, [
                    'telegram_error' => $response->body(),
                ]),
            ]);

            Log::error('Telegram notification failed', [
                'log_id' => $this->notificationLog->id,
                'response' => $response->body(),
            ]);

            $this->fail('Telegram API error: '.$response->body());
        }
    }

    private function formatMessage(array $payload): string
    {
        $nama = $payload['user_nama'] ?? 'Tidak diketahui';
        $phone = $payload['user_phone'] ?? '-';
        $lat = $payload['latitude'] ?? '-';
        $lng = $payload['longitude'] ?? '-';
        $waktu = $payload['waktu'] ?? now()->toIso8601String();

        $mapsLink = "https://www.google.com/maps?q={$lat},{$lng}";

        return "<b>🚨 PANIC BUTTON</b>\n"
            ."<b>Warga:</b> {$nama}\n"
            ."<b>Kontak:</b> {$phone}\n"
            ."<b>Lokasi:</b> <a href=\"{$mapsLink}\">{$lat}, {$lng}</a>\n"
            ."<b>Waktu:</b> {$waktu}";
    }
}
