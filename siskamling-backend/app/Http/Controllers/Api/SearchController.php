<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JadwalRonda;
use App\Models\LaporanKamtibmas;
use App\Models\LaporanRumahKosong;
use App\Models\Linmas;
use App\Models\PanicButtonLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = trim((string) $request->input('q', ''));

        if (strlen($q) < 2) {
            return response()->json(['data' => []]);
        }

        $user = $request->user();
        $role = $user->role->name;
        $results = collect();

        if ($role === 'warga') {
            $results = $results->concat($this->searchWargaScope($user, $q));
        } else {
            $dusunIds = $user->getDusunIds();

            if (! empty($dusunIds)) {
                $results = $results->concat($this->searchKamtibmas($dusunIds, $q));
            }

            if ($role === 'aparatur_desa') {
                if (! empty($dusunIds)) {
                    $results = $results
                        ->concat($this->searchWargaUsers($dusunIds, $q))
                        ->concat($this->searchRumahKosong($dusunIds, $q))
                        ->concat($this->searchRonda($dusunIds, $q));
                }
            } elseif ($role === 'polsek') {
                $polsekId = $user->getPolsekId();
                if (! empty($dusunIds)) {
                    $results = $results->concat($this->searchPanic($dusunIds, $q));
                }
                if ($polsekId) {
                    $results = $results->concat($this->searchLinmas($polsekId, $q));
                }
            }
        }

        return response()->json([
            'data' => $results->take(20)->values(),
        ]);
    }

    private function searchWargaScope(User $user, string $q): array
    {
        $items = [];

        $laporan = LaporanKamtibmas::with('dusun')
            ->where('user_id', $user->id)
            ->where(function ($w) use ($q) {
                $w->where('kronologi', 'like', "%{$q}%")
                    ->orWhere('kategori', 'like', "%{$q}%")
                    ->orWhere('lokasi_text', 'like', "%{$q}%");
            })
            ->latest()
            ->limit(5)
            ->get();

        foreach ($laporan as $l) {
            $items[] = [
                'id' => $l->id,
                'type' => 'laporan',
                'title' => Str::limit($l->kronologi, 48),
                'subtitle' => ucfirst($l->kategori) . ($l->dusun ? ' · ' . $l->dusun->nama : ''),
                'target' => '/warga/kamtibmas',
            ];
        }

        $rumahKosong = LaporanRumahKosong::where('user_id', $user->id)
            ->where('alamat', 'like', "%{$q}%")
            ->latest()
            ->limit(5)
            ->get();

        foreach ($rumahKosong as $rk) {
            $items[] = [
                'id' => $rk->id,
                'type' => 'rumah_kosong',
                'title' => Str::limit($rk->alamat, 48),
                'subtitle' => 'Rumah kosong · ' . $rk->status,
                'target' => '/warga/rumah-kosong',
            ];
        }

        $panic = PanicButtonLog::with('user.dusun')
            ->where('user_id', $user->id)
            ->whereHas('user', fn ($u) => $u->where('nama', 'like', "%{$q}%"))
            ->latest()
            ->limit(5)
            ->get();

        foreach ($panic as $p) {
            $items[] = [
                'id' => $p->id,
                'type' => 'panic',
                'title' => 'Panic ' . $p->status,
                'subtitle' => $p->created_at?->format('d M Y H:i'),
                'target' => '/warga/panic',
            ];
        }

        $ronda = JadwalRonda::with('dusun')
            ->whereHas('jadwalRondaPetugas', fn ($jr) => $jr->where('user_id', $user->id))
            ->whereHas('dusun', fn ($d) => $d->where('nama', 'like', "%{$q}%"))
            ->latest('tanggal')
            ->limit(5)
            ->get();

        foreach ($ronda as $r) {
            $items[] = [
                'id' => $r->id,
                'type' => 'ronda',
                'title' => 'Ronda ' . $r->dusun?->nama,
                'subtitle' => $r->tanggal?->format('d M Y') . ' · ' . ucfirst($r->shift),
                'target' => '/warga/ronda',
            ];
        }

        return $items;
    }

    private function searchWargaUsers(array $dusunIds, string $q): array
    {
        $wargaRole = Role::where('name', 'warga')->value('id');

        $users = User::with('dusun')
            ->whereIn('dusun_id', $dusunIds)
            ->where('role_id', $wargaRole)
            ->where(function ($w) use ($q) {
                $w->where('nama', 'like', "%{$q}%")
                    ->orWhere('nik', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            })
            ->latest()
            ->limit(5)
            ->get();

        $items = [];
        foreach ($users as $u) {
            $items[] = [
                'id' => $u->id,
                'type' => 'warga',
                'title' => $u->nama,
                'subtitle' => ($u->jabatan ? $u->jabatan . ' · ' : '') . ($u->dusun?->nama ?? ''),
                'target' => '/desa/manajemen-warga',
            ];
        }

        return $items;
    }

    private function searchKamtibmas(array $dusunIds, string $q): array
    {
        $laporan = LaporanKamtibmas::with(['user', 'dusun'])
            ->whereIn('dusun_id', $dusunIds)
            ->where(function ($w) use ($q) {
                $w->where('kronologi', 'like', "%{$q}%")
                    ->orWhere('kategori', 'like', "%{$q}%")
                    ->orWhere('lokasi_text', 'like', "%{$q}%")
                    ->orWhereHas('user', fn ($u) => $u->where('nama', 'like', "%{$q}%"));
            })
            ->latest()
            ->limit(5)
            ->get();

        $items = [];
        foreach ($laporan as $l) {
            $items[] = [
                'id' => $l->id,
                'type' => 'laporan',
                'title' => Str::limit($l->kronologi, 48),
                'subtitle' => ucfirst($l->kategori) . ($l->dusun ? ' · ' . $l->dusun->nama : ''),
                'target' => '/desa/kamtibmas',
            ];
        }

        return $items;
    }

    private function searchRumahKosong(array $dusunIds, string $q): array
    {
        $laporan = LaporanRumahKosong::with('user.dusun')
            ->whereHas('user', fn ($u) => $u->whereIn('dusun_id', $dusunIds))
            ->where(function ($w) use ($q) {
                $w->where('alamat', 'like', "%{$q}%")
                    ->orWhereHas('user', fn ($u) => $u->where('nama', 'like', "%{$q}%"));
            })
            ->latest()
            ->limit(5)
            ->get();

        $items = [];
        foreach ($laporan as $rk) {
            $items[] = [
                'id' => $rk->id,
                'type' => 'rumah_kosong',
                'title' => Str::limit($rk->alamat, 48),
                'subtitle' => $rk->user?->nama . ' · ' . $rk->status,
                'target' => '/desa/rekap-rumah-kosong',
            ];
        }

        return $items;
    }

    private function searchRonda(array $dusunIds, string $q): array
    {
        $jadwal = JadwalRonda::with('dusun')
            ->whereIn('dusun_id', $dusunIds)
            ->whereHas('dusun', fn ($d) => $d->where('nama', 'like', "%{$q}%"))
            ->latest('tanggal')
            ->limit(5)
            ->get();

        $items = [];
        foreach ($jadwal as $r) {
            $items[] = [
                'id' => $r->id,
                'type' => 'ronda',
                'title' => 'Ronda ' . $r->dusun?->nama,
                'subtitle' => $r->tanggal?->format('d M Y') . ' · ' . ucfirst($r->shift),
                'target' => '/desa/penjadwalan-ronda',
            ];
        }

        return $items;
    }

    private function searchPanic(array $dusunIds, string $q): array
    {
        $panic = PanicButtonLog::with(['user.dusun'])
            ->whereHas('user', fn ($u) => $u->whereIn('dusun_id', $dusunIds))
            ->where(function ($w) use ($q) {
                $w->whereHas('user', fn ($u) => $u->where('nama', 'like', "%{$q}%"))
                    ->orWhereHas('user.dusun', fn ($d) => $d->where('nama', 'like', "%{$q}%"));
            })
            ->latest()
            ->limit(5)
            ->get();

        $items = [];
        foreach ($panic as $p) {
            $items[] = [
                'id' => $p->id,
                'type' => 'panic',
                'title' => 'Panic · ' . $p->user?->nama,
                'subtitle' => ($p->user?->dusun?->nama ?? '') . ' · ' . $p->created_at?->format('d M Y H:i'),
                'target' => '/polsek/riwayat-panic',
            ];
        }

        return $items;
    }

    private function searchLinmas(int $polsekId, string $q): array
    {
        $linmas = Linmas::where('polsek_id', $polsekId)
            ->where(function ($w) use ($q) {
                $w->where('nama', 'like', "%{$q}%")
                    ->orWhere('jabatan', 'like', "%{$q}%")
                    ->orWhere('wilayah_tugas', 'like', "%{$q}%");
            })
            ->latest()
            ->limit(5)
            ->get();

        $items = [];
        foreach ($linmas as $l) {
            $items[] = [
                'id' => $l->id,
                'type' => 'linmas',
                'title' => $l->nama,
                'subtitle' => ($l->jabatan ? $l->jabatan . ' · ' : '') . ($l->wilayah_tugas ?? ''),
                'target' => '/polsek/manajemen-linmas',
            ];
        }

        return $items;
    }
}
