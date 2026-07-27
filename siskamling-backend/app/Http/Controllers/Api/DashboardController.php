<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\GenerateAiInsight;
use App\Models\AiInsight;
use App\Models\Dusun;
use App\Models\JadwalRonda;
use App\Models\JadwalRondaPetugas;
use App\Models\LaporanKamtibmas;
use App\Models\LaporanRumahKosong;
use App\Models\Linmas;
use App\Models\PanicButtonLog;
use App\Models\Polsek;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function polsekSummary(Request $request): JsonResponse
    {
        $user = $request->user();
        $polsekId = $user->getPolsekId();

        if ($user->role->name === 'polsek' && ! $polsekId) {
            $allDusunIds = Dusun::pluck('id');
            $kamtibmasAll = LaporanKamtibmas::whereIn('dusun_id', $allDusunIds)->whereYear('created_at', now()->year);

            $polseks = Polsek::with('desas')->get();

            $kamtibmasPerPolsek = $polseks->map(function ($p) {
                $dusunIds = $p->desas->flatMap->dusuns->pluck('id');
                $count = LaporanKamtibmas::whereIn('dusun_id', $dusunIds)
                    ->whereYear('created_at', now()->year)
                    ->count();

                return ['id' => $p->id, 'nama' => $p->nama, 'total' => $count];
            });

            $trend12Bulan = $this->getTrend12Bulan($allDusunIds);
            $kategoriBreakdown = $this->getKategoriBreakdown($allDusunIds);
            $statusBreakdown = $this->getStatusBreakdown($allDusunIds);
            $panicStats = $this->getPanicStats($allDusunIds);

            return response()->json([
                'data' => [
                    'stats' => [
                        'total_polsek' => $polseks->count(),
                        'total_desa' => $polseks->sum(fn ($p) => $p->desas->count()),
                        'total_dusun' => $allDusunIds->count(),
                        'total_warga' => User::where('role_id', Role::where('name', 'warga')->value('id'))->count(),
                        'total_linmas' => Linmas::count(),
                    ],
                    'kamtibmas_per_polsek' => $kamtibmasPerPolsek,
                    'kamtibmas_trend_12_bulan' => $trend12Bulan,
                    'kamtibmas_kategori' => $kategoriBreakdown,
                    'kamtibmas_status' => $statusBreakdown,
                    'panic_stats' => $panicStats,
                ],
            ]);
        }

        $polsek = Polsek::findOrFail($polsekId);

        $dusunIds = Dusun::whereHas('desa', fn ($q) => $q->where('polsek_id', $polsek->id))
            ->pluck('id');

        $heatmap = Dusun::whereIn('id', $dusunIds)
            ->withCount('laporanKamtibmas')
            ->get(['id', 'nama', 'laporan_kamtibmas_count']);

        $rondaPerDusun = Dusun::whereIn('id', $dusunIds)
            ->withCount(['jadwalRondas' => fn ($q) => $q->whereYear('tanggal', now()->year)->whereMonth('tanggal', now()->month)])
            ->get(['id', 'nama', 'jadwal_rondas_count']);

        $linmas = Linmas::where('polsek_id', $polsek->id)
            ->get(['id', 'nama', 'jabatan', 'no_hp', 'wilayah_tugas']);

        $trend12Bulan = $this->getTrend12Bulan($dusunIds);
        $kategoriBreakdown = $this->getKategoriBreakdown($dusunIds);
        $statusBreakdown = $this->getStatusBreakdown($dusunIds);

        return response()->json([
            'data' => [
                'polsek' => ['id' => $polsek->id, 'nama' => $polsek->nama],
                'stats' => [
                    'total_laporan_kamtibmas' => LaporanKamtibmas::whereIn('dusun_id', $dusunIds)->count(),
                    'laporan_bulan_ini' => LaporanKamtibmas::whereIn('dusun_id', $dusunIds)
                        ->whereYear('created_at', now()->year)
                        ->whereMonth('created_at', now()->month)
                        ->count(),
                    'panic_aktif' => PanicButtonLog::whereIn('dusun_id', $dusunIds)
                        ->where('status', 'terkirim')
                        ->count(),
                    'total_linmas' => $linmas->count(),
                ],
                'heatmap_kamtibmas' => $heatmap,
                'ronda_bulan_ini' => $rondaPerDusun,
                'anggota_linmas' => $linmas,
                'kamtibmas_trend_12_bulan' => $trend12Bulan,
                'kamtibmas_kategori' => $kategoriBreakdown,
                'kamtibmas_status' => $statusBreakdown,
            ],
        ]);
    }

    public function desaSummary(Request $request): JsonResponse
    {
        $user = $request->user();
        $desa = $user->getDesa();

        if (! $desa) {
            return response()->json(['message' => 'Desa tidak ditemukan untuk user ini.'], 404);
        }

        $dusunIds = $desa->dusuns()->pluck('id');
        $wargaRoleId = Role::where('name', 'warga')->value('id');

        $totalWarga = User::where('role_id', $wargaRoleId)
            ->whereIn('dusun_id', $dusunIds)
            ->count();

        $rumahKosongAktif = LaporanRumahKosong::where('status', 'aktif')
            ->whereHas('user', fn ($q) => $q->whereIn('dusun_id', $dusunIds))
            ->count();

        $rondaBulanIni = JadwalRonda::whereIn('dusun_id', $dusunIds)
            ->whereYear('tanggal', now()->year)
            ->whereMonth('tanggal', now()->month)
            ->count();

        $kamtibmasPerDusun = LaporanKamtibmas::whereIn('dusun_id', $dusunIds)
            ->whereYear('created_at', now()->year)
            ->selectRaw('dusun_id, count(*) as total')
            ->groupBy('dusun_id')
            ->pluck('total', 'dusun_id')
            ->toArray();

        $dusunNames = Dusun::whereIn('id', $dusunIds)->pluck('nama', 'id');
        $kamtibmasPerDusunChart = collect($dusunIds)->map(fn ($id) => [
            'dusun' => $dusunNames[$id] ?? 'Unknown',
            'total' => $kamtibmasPerDusun[$id] ?? 0,
        ])->toArray();

        $trend12Bulan = $this->getTrend12Bulan($dusunIds);
        $kategoriBreakdown = $this->getKategoriBreakdown($dusunIds);
        $statusBreakdown = $this->getStatusBreakdown($dusunIds);

        $rondaPerDusun = Dusun::whereIn('id', $dusunIds)
            ->withCount(['jadwalRondas' => fn ($q) => $q->whereYear('tanggal', now()->year)->whereMonth('tanggal', now()->month)])
            ->get(['id', 'nama', 'jadwal_rondas_count'])
            ->map(fn ($d) => ['dusun' => $d->nama, 'total' => $d->jadwal_rondas_count]);

        $panicStats = $this->getPanicStats($dusunIds);

        return response()->json([
            'data' => [
                'desa' => ['id' => $desa->id, 'nama' => $desa->nama],
                'stats' => [
                    'total_warga' => $totalWarga,
                    'rumah_kosong_aktif' => $rumahKosongAktif,
                    'anggota_linmas' => Linmas::where('polsek_id', $desa->polsek_id)->count(),
                    'ronda_bulan_ini' => $rondaBulanIni,
                    'panic_aktif' => PanicButtonLog::whereIn('dusun_id', $dusunIds)
                        ->where('status', 'terkirim')
                        ->count(),
                ],
                'kamtibmas_per_dusun' => $kamtibmasPerDusunChart,
                'kamtibmas_trend_12_bulan' => $trend12Bulan,
                'kamtibmas_kategori' => $kategoriBreakdown,
                'kamtibmas_status' => $statusBreakdown,
                'ronda_per_dusun' => $rondaPerDusun,
                'panic_stats' => $panicStats,
            ],
        ]);
    }

    public function wargaSummary(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $totalKamtibmas = LaporanKamtibmas::where('user_id', $userId)->count();
        $totalRumahKosong = LaporanRumahKosong::where('user_id', $userId)->count();
        $totalPanic = PanicButtonLog::where('user_id', $userId)->count();

        $jadwalQuery = JadwalRondaPetugas::where('user_id', $userId);
        $totalJadwalRonda = (clone $jadwalQuery)->count();
        $totalHadir = (clone $jadwalQuery)->where('status_hadir', 'hadir')->count();
        $persentaseKehadiran = $totalJadwalRonda > 0
            ? round($totalHadir / $totalJadwalRonda * 100, 1)
            : 0.0;

        $trend12Bulan = $this->getTrend12BulanByUser($userId);
        $kategoriBreakdown = $this->getKategoriBreakdownByUser($userId);

        $riwayatKehadiran = $this->getRiwayatKehadiranByUser($userId);

        return response()->json([
            'data' => [
                'stats' => [
                    'total_laporan_kamtibmas' => $totalKamtibmas,
                    'total_laporan_rumah_kosong' => $totalRumahKosong,
                    'total_panic_button' => $totalPanic,
                    'total_jadwal_ronda' => $totalJadwalRonda,
                    'persentase_kehadiran_ronda' => $persentaseKehadiran,
                ],
                'kamtibmas_trend_12_bulan' => $trend12Bulan,
                'kamtibmas_kategori' => $kategoriBreakdown,
                'riwayat_kehadiran_ronda' => $riwayatKehadiran,
            ],
        ]);
    }

    public function generateAiInsight(Request $request): JsonResponse
    {
        $user = $request->user();
        $desa = $user->getDesa();

        if (! $desa) {
            return response()->json(['message' => 'Desa tidak ditemukan untuk user ini.'], 404);
        }

        GenerateAiInsight::dispatch($desa);

        return response()->json([
            'message' => 'Generate insight sedang diproses. Coba beberapa saat lagi.',
            'data' => [
                'desa' => ['id' => $desa->id, 'nama' => $desa->nama],
            ],
        ]);
    }

    public function aiInsight(Request $request): JsonResponse
    {
        $user = $request->user();
        $desa = $user->getDesa();

        if (! $desa) {
            return response()->json(['message' => 'Desa tidak ditemukan untuk user ini.'], 404);
        }

        $insight = AiInsight::where('desa_id', $desa->id)
            ->latest()
            ->first();

        if (! $insight) {
            return response()->json([
                'data' => null,
                'message' => 'Belum ada insight. Insight dibuat setiap minggu oleh scheduler.',
            ]);
        }

        return response()->json([
            'data' => [
                'desa' => ['id' => $desa->id, 'nama' => $desa->nama],
                'insight' => $insight->insight,
                'periode' => [
                    'start' => $insight->period_start->format('Y-m-d'),
                    'end' => $insight->period_end->format('Y-m-d'),
                ],
                'dibuat_pada' => $insight->created_at,
            ],
        ]);
    }

    private function getTrend12Bulan($dusunIds): array
    {
        $months = collect();
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $months->push([
                'bulan' => $date->format('Y-m'),
                'label' => $date->translatedFormat('M Y'),
                'total' => 0,
            ]);
        }

        $records = LaporanKamtibmas::whereIn('dusun_id', $dusunIds)
            ->where('created_at', '>=', Carbon::now()->subMonths(11)->startOfMonth())
            ->select('created_at')
            ->get()
            ->groupBy(fn ($r) => $r->created_at->format('Y-m'));

        return $months->map(function ($m) use ($records) {
            $group = $records->get($m['bulan']);
            $m['total'] = $group ? $group->count() : 0;

            return $m;
        })->toArray();
    }

    private function getKategoriBreakdown($dusunIds): array
    {
        return LaporanKamtibmas::whereIn('dusun_id', $dusunIds)
            ->whereYear('created_at', now()->year)
            ->selectRaw('kategori, count(*) as total')
            ->groupBy('kategori')
            ->get()
            ->pluck('total', 'kategori')
            ->toArray();
    }

    private function getStatusBreakdown($dusunIds): array
    {
        return LaporanKamtibmas::whereIn('dusun_id', $dusunIds)
            ->whereYear('created_at', now()->year)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->get()
            ->pluck('total', 'status')
            ->toArray();
    }

    private function getPanicStats($dusunIds): array
    {
        $total = PanicButtonLog::whereIn('dusun_id', $dusunIds)->count();
        $terkirim = PanicButtonLog::whereIn('dusun_id', $dusunIds)->where('status', 'terkirim')->count();
        $direspon = PanicButtonLog::whereIn('dusun_id', $dusunIds)->where('status', 'direspon')->count();

        $responded = PanicButtonLog::whereIn('dusun_id', $dusunIds)
            ->whereNotNull('responded_at')
            ->get(['created_at', 'responded_at']);

        $avgMinutes = null;
        if ($responded->isNotEmpty()) {
            $totalSeconds = $responded->sum(fn ($p) => $p->created_at->diffInSeconds($p->responded_at));
            $avgMinutes = round($totalSeconds / $responded->count() / 60, 1);
        }

        return [
            'total' => $total,
            'terkirim' => $terkirim,
            'direspon' => $direspon,
            'rata_rata_response_menit' => $avgMinutes,
        ];
    }

    private function getTrend12BulanByUser(int $userId): array
    {
        $months = collect();
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $months->push([
                'bulan' => $date->format('Y-m'),
                'label' => $date->translatedFormat('M Y'),
                'total' => 0,
            ]);
        }

        $records = LaporanKamtibmas::where('user_id', $userId)
            ->where('created_at', '>=', Carbon::now()->subMonths(11)->startOfMonth())
            ->select('created_at')
            ->get()
            ->groupBy(fn ($r) => $r->created_at->format('Y-m'));

        return $months->map(function ($m) use ($records) {
            $group = $records->get($m['bulan']);
            $m['total'] = $group ? $group->count() : 0;

            return $m;
        })->toArray();
    }

    private function getKategoriBreakdownByUser(int $userId): array
    {
        return LaporanKamtibmas::where('user_id', $userId)
            ->whereYear('created_at', now()->year)
            ->selectRaw('kategori, count(*) as total')
            ->groupBy('kategori')
            ->get()
            ->pluck('total', 'kategori')
            ->toArray();
    }

    private function getRiwayatKehadiranByUser(int $userId): array
    {
        $months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $months->push([
                'bulan' => $date->format('Y-m'),
                'label' => $date->translatedFormat('M Y'),
                'dijadwalkan' => 0,
                'hadir' => 0,
            ]);
        }

        $records = JadwalRondaPetugas::where('user_id', $userId)
            ->whereHas('jadwalRonda', fn ($q) => $q->where('tanggal', '>=', Carbon::now()->subMonths(5)->startOfMonth()))
            ->with('jadwalRonda')
            ->get();

        $grouped = $records->groupBy(fn ($r) => $r->jadwalRonda
            ? $r->jadwalRonda->tanggal->format('Y-m')
            : now()->format('Y-m'));

        return $months->map(function ($m) use ($grouped) {
            $group = $grouped->get($m['bulan'], collect());
            $m['dijadwalkan'] = $group->count();
            $m['hadir'] = $group->where('status_hadir', 'hadir')->count();

            return $m;
        })->toArray();
    }
}
