<?php

namespace App\Services;

use App\Models\JadwalRondaPetugas;
use App\Models\PanicButtonLog;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Database;
use Illuminate\Support\Facades\Log;

class FirebaseService
{
    private ?Database $database = null;

    private function getDatabase(): Database
    {
        if ($this->database === null) {
            $factory = (new Factory)->withServiceAccount(config('firebase.credentials'))
                ->withDatabaseUri(config('firebase.database_url'));

            $this->database = $factory->getDatabase();
        }

        return $this->database;
    }

    public function pushPanicStatus(PanicButtonLog $panic): void
    {
        try {
            $polsekId = $this->resolvePolsekId($panic);

            if (! $polsekId) {
                return;
            }

            $path = "panic_alerts/{$polsekId}/{$panic->id}";

            $data = [
                'id' => $panic->id,
                'user' => [
                    'nama' => $panic->user->nama ?? null,
                    'phone' => $panic->user->phone ?? null,
                ],
                'latitude' => (float) $panic->latitude,
                'longitude' => (float) $panic->longitude,
                'status' => $panic->status,
                'created_at' => $panic->created_at?->toIso8601String(),
                'responded_at' => $panic->responded_at?->toIso8601String(),
            ];

            $this->getDatabase()->getReference($path)->set($data);
        } catch (\Throwable $e) {
            Log::error('Firebase: gagal push panic status', [
                'panic_id' => $panic->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function pushRondaPresensi(JadwalRondaPetugas $petugas): void
    {
        try {
            $jadwal = $petugas->jadwalRonda;

            if (! $jadwal) {
                return;
            }

            $tanggal = $jadwal->tanggal instanceof \Carbon\Carbon
                ? $jadwal->tanggal->format('Y-m-d')
                : $jadwal->tanggal;

            $path = "ronda_presensi/{$jadwal->dusun_id}/{$tanggal}/{$petugas->id}";

            $data = [
                'user_id' => $petugas->user_id,
                'nama' => $petugas->user->nama ?? null,
                'status_hadir' => $petugas->status_hadir,
                'scanned_at' => $petugas->updated_at?->toIso8601String(),
            ];

            $this->getDatabase()->getReference($path)->set($data);
        } catch (\Throwable $e) {
            Log::error('Firebase: gagal push ronda presensi', [
                'petugas_id' => $petugas->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function resolvePolsekId(PanicButtonLog $panic): ?int
    {
        $user = $panic->user;

        if ($user->polsek_id) {
            return $user->polsek_id;
        }

        if ($user->desa && $user->desa->polsek_id) {
            return $user->desa->polsek_id;
        }

        return $user->dusun?->desa?->polsek_id;
    }
}
