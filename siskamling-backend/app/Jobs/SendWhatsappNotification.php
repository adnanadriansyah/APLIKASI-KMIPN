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

class SendWhatsappNotification implements ShouldQueue
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
        $target = $this->notificationLog->target_number;
        $payload = $this->notificationLog->payload;

        $message = $this->formatMessage($payload);

        $apiKey = config('services.fonnte.api_key');

        if (! $apiKey) {
            Log::warning('FONNTE_API_KEY tidak dikonfigurasi.', [
                'log_id' => $this->notificationLog->id,
            ]);
            $this->notificationLog->update(['status' => 'failed', 'payload' => array_merge($this->notificationLog->payload ?? [], ['error' => 'FONNTE_API_KEY tidak dikonfigurasi.'])]);
            $this->fail();

            return;
        }

        $response = Http::withHeaders([
            'Authorization' => $apiKey,
        ])->post('https://api.fonnte.com/send', [
            'target' => $target,
            'message' => $message,
        ]);

        if ($response->successful()) {
            $this->notificationLog->update(['status' => 'sent']);
        } else {
            $error = $response->body();
            Log::error('Fonnte API gagal', [
                'log_id' => $this->notificationLog->id,
                'response' => $error,
            ]);
            $this->notificationLog->update([
                'status' => 'failed',
                'payload' => array_merge($this->notificationLog->payload ?? [], ['error' => $error]),
            ]);
            $this->fail($response->toException());
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

        return "🚨 PANIC BUTTON\n"
            ."Warga: {$nama}\n"
            ."Kontak: {$phone}\n"
            ."Lokasi: {$lat}, {$lng}\n"
            ."Maps: {$mapsLink}\n"
            ."Waktu: {$waktu}";
    }
}
