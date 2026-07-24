<?php

namespace App\Jobs;

use App\Models\AiInsight;
use App\Models\Desa;
use App\Models\Dusun;
use App\Models\LaporanKamtibmas;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GenerateAiInsight implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $maxExceptions = 2;

    public ?Desa $desa;

    public function __construct(?Desa $desa = null)
    {
        $this->desa = $desa;
    }

    public function handle(): void
    {
        $apiKey = config('services.anthropic.api_key');
        if (! $apiKey) {
            Log::warning('ANTHROPIC_API_KEY tidak dikonfigurasi.');

            return;
        }

        $endDate = now()->endOfDay();
        $startDate = now()->subDays(6)->startOfDay();

        $desas = $this->desa ? collect([$this->desa]) : Desa::all();

        foreach ($desas as $desa) {
            $dusunIds = $desa->dusuns()->pluck('id');
            $reports = LaporanKamtibmas::whereIn('dusun_id', $dusunIds)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->get();

            if ($reports->isEmpty()) {
                continue;
            }

            $grouped = $reports->groupBy('dusun_id')->map(function ($items, $dusunId) {
                $dusun = Dusun::find($dusunId);

                return [
                    'dusun' => $dusun?->nama ?? "Dusun #{$dusunId}",
                    'total' => $items->count(),
                    'kategori' => $items->groupBy('kategori')->map->count()->toArray(),
                ];
            });

            $rawData = [
                'periode' => $startDate->format('Y-m-d').' s/d '.$endDate->format('Y-m-d'),
                'total_laporan' => $reports->count(),
                'per_dusun' => $grouped->values()->toArray(),
            ];

            $prompt = $this->buildPrompt($rawData);

            $response = Http::timeout(30)
                ->withHeaders([
                    'x-api-key' => $apiKey,
                    'anthropic-version' => '2023-06-01',
                    'content-type' => 'application/json',
                ])->post('https://api.anthropic.com/v1/messages', [
                    'model' => 'claude-3-haiku-20240307',
                    'max_tokens' => 1024,
                    'system' => 'Kamu adalah asisten analis keamanan desa. '
                        .'Berdasarkan data laporan kamtibmas 7 hari terakhir, buat insight singkat dalam Bahasa Indonesia. '
                        .'Format: **Ringkasan Tren**, **Dusun Paling Rawan**, **Rekomendasi**.',
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                ]);

            if ($response->successful()) {
                $insightText = $response->json('content.0.text') ?? 'Tidak ada insight.';

                AiInsight::create([
                    'desa_id' => $desa->id,
                    'insight' => $insightText,
                    'raw_data' => $rawData,
                    'period_start' => $startDate,
                    'period_end' => $endDate,
                ]);
            } else {
                Log::error('Anthropic API error', [
                    'desa_id' => $desa->id,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        }
    }

    private function buildPrompt(array $data): string
    {
        $lines = [];
        $lines[] = "Periode: {$data['periode']}";
        $lines[] = "Total laporan: {$data['total_laporan']}";
        $lines[] = '';

        foreach ($data['per_dusun'] as $dusun) {
            $lines[] = "Dusun {$dusun['dusun']}: {$dusun['total']} laporan";
            foreach ($dusun['kategori'] as $kategori => $count) {
                $lines[] = "  - {$kategori}: {$count}";
            }
        }

        return implode("\n", $lines);
    }
}
