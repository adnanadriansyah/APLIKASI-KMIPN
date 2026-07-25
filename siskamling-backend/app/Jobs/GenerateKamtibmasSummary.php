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

        $systemPrompt = <<<'PROMPT'
Kamu adalah asisten admin desa untuk sistem keamanan lingkungan (Siskamling).
Tugas kamu: analisis kronologi laporan kamtibmas dan kembalikan HASIL dalam format JSON murni (tanpa markdown fence, tanpa teks tambahan).

Struktur JSON yang diharapkan:
{"ringkasan": "<ringkasan 2-3 kalimat kronologi dalam Bahasa Indonesia yang jelas dan informatif>", "tingkat_urgensi": "<rendah|sedang|tinggi>"}

Panduan menentukan tingkat urgensi:
- "tinggi": ancaman jiwa/segera — contoh: Begal bersenjata, Pembunuhan, Tawuran dengan kekerasan fisik, KDRT dengan cedera serius, Narkoba yang melibatkan kekerasan.
- "sedang": potensi bahaya signifikan tapi belum mengancam jiwa secara langsung — contoh: Pencurian dengan penjebolan/kekerasan, KDRT tanpa cedera serius, Narkoba (peredaran/konsumsi), Tawuran tanpa senjata tajam.
- "rendah": gangguan ketertiban ringan, tidak ada kekerasan — contoh: Pencurian ringan (helm hilang, masuk tanpa paksa), aktivitas mencurigakan tanpa aksi kriminal.

Keputusan WAJIB berdasarkan isi kronologi yang sebenarnya, bukan tebak-tebakan dari kategori saja. Perhatikan detail kekerasan, senjata, dan jumlah pelaku dalam kronologi.
PROMPT;

        $response = Http::timeout(30)
            ->withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])->post('https://api.anthropic.com/v1/messages', [
                'model' => config('services.anthropic.model'),
                'max_tokens' => 512,
                'system' => $systemPrompt,
                'messages' => [
                    ['role' => 'user', 'content' => "Kategori: {$kategori}\n\nKronologi:\n{$kronologi}"],
                ],
            ]);

        if ($response->successful()) {
            $rawText = $response->json('content.0.text') ?? '';
            $cleaned = trim(preg_replace('/^```json\s*/i', '', preg_replace('/\s*```$/i', '', $rawText)));
            $decoded = json_decode($cleaned, true);

            if (is_array($decoded) && isset($decoded['ringkasan'])) {
                $validLevels = array_keys(config('siskamling.urgency_level_kamtibmas', []));
                $urgency = in_array($decoded['tingkat_urgensi'] ?? '', $validLevels)
                    ? $decoded['tingkat_urgensi']
                    : null;

                $this->laporan->update([
                    'ai_summary' => $decoded['ringkasan'],
                    'ai_urgency_level' => $urgency,
                ]);
            } else {
                Log::warning('AI response bukan JSON valid, menggunakan fallback teks mentah.', [
                    'laporan_id' => $this->laporan->id,
                    'raw_text' => $rawText,
                ]);

                $this->laporan->update(['ai_summary' => $rawText]);
            }
        } else {
            Log::error('Anthropic API error saat generate summary', [
                'laporan_id' => $this->laporan->id,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        }
    }
}
