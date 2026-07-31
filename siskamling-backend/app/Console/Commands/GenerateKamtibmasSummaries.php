<?php

namespace App\Console\Commands;

use App\Jobs\GenerateKamtibmasSummary;
use App\Models\LaporanKamtibmas;
use Illuminate\Console\Command;

class GenerateKamtibmasSummaries extends Command
{
    protected $signature = 'kamtibmas:generate-summaries {--limit=50}';

    protected $description = 'Generate AI summary untuk laporan kamtibmas yang belum punya ringkasan';

    public function handle(): int
    {
        $limit = (int) $this->option('limit');

        $laporan = LaporanKamtibmas::whereNull('ai_summary')
            ->latest()
            ->limit($limit)
            ->get();

        if ($laporan->isEmpty()) {
            $this->info('Tidak ada laporan yang perlu diproses.');

            return self::SUCCESS;
        }

        $this->info("Memproses {$laporan->count()} laporan...");

        $laporan->each(function (LaporanKamtibmas $laporan): void {
            try {
                (new GenerateKamtibmasSummary($laporan))->handle();

                if ($laporan->fresh()->ai_summary) {
                    $this->info("  [OK] Laporan #{$laporan->id}");
                } else {
                    $this->error("  [GAGAL] Laporan #{$laporan->id}: ai_summary masih kosong (cek log untuk detail API error)");
                }
            } catch (\Throwable $e) {
                $this->error("  [GAGAL] Laporan #{$laporan->id}: {$e->getMessage()}");
            }
        });

        return self::SUCCESS;
    }
}
