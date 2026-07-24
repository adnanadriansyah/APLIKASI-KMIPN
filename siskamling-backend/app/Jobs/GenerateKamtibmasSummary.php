<?php

namespace App\Jobs;

use App\Models\LaporanKamtibmas;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GenerateKamtibmasSummary implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $maxExceptions = 2;

    public LaporanKamtibmas $laporan;

    public function __construct(LaporanKamtibmas $laporan)
    {
        $this->laporan = $laporan;
    }

    public function handle(): void
    {
        $apiKey = config('services.anthropic.api_key');

        if (! $apiKey) {
            Log::warning('ANTHROPIC_API_KEY tidak dikonfigurasi.', [
                'laporan_id' => $this->laporan->id,
            ]);

            return;
        }

        $kronologi = $this->laporan->kronologi;
        $kategori = $this->laporan->kategori;

        $response = Http::timeout(30)
            ->withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])->post('https://api.anthropic.com/v1/messages', [
                'model' => 'claude-3-haiku-20240307',
                'max_tokens' => 512,
                'system' => 'Kamu adalah asisten admin desa. Ringkas kronologi laporan kamtibmas '
                    .'dalam 2-3 kalimat Bahasa Indonesia yang jelas dan informatif.',
                'messages' => [
                    ['role' => 'user', 'content' => "Kategori: {$kategori}\n\nKronologi:\n{$kronologi}"],
                ],
            ]);

        if ($response->successful()) {
            $summary = $response->json('content.0.text') ?? '';

            $this->laporan->update(['ai_summary' => $summary]);
        } else {
            Log::error('Anthropic API error saat generate summary', [
                'laporan_id' => $this->laporan->id,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        }
    }
}
