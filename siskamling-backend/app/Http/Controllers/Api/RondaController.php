<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ronda\GenerateQrcodeRequest;
use App\Http\Requests\Ronda\ScanQrcodeRequest;
use App\Http\Requests\Ronda\StoreJadwalRondaRequest;
use App\Http\Resources\JadwalRondaResource;
use App\Http\Resources\QrcodeRondaResource;
use App\Models\JadwalRonda;
use App\Models\JadwalRondaPetugas;
use App\Models\QrcodeRonda;
use App\Services\FirebaseService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class RondaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $user->role->name;

        $query = JadwalRonda::with(['dusun', 'jadwalRondaPetugas.user', 'jadwalRondaPetugas.qrcodeRonda']);

        if ($role === 'warga') {
            $query->whereHas('jadwalRondaPetugas', fn ($q) => $q->where('user_id', $user->id));
        } else {
            $dusunIds = $user->getDusunIds();
            if (empty($dusunIds)) {
                return response()->json(['data' => []]);
            }
            $query->whereIn('dusun_id', $dusunIds);
        }

        if ($request->filled('dusun_id')) {
            $allowedDusunIds = $user->getDusunIds();
            if (! empty($allowedDusunIds) && ! in_array($request->dusun_id, $allowedDusunIds)) {
                return response()->json(['data' => []]);
            }
            $query->where('dusun_id', $request->dusun_id);
        }

        if ($request->filled('user_id')) {
            $query->whereHas('jadwalRondaPetugas', fn ($q) => $q->where('user_id', $request->user_id));
        }

        if ($request->filled('bulan') && str_contains($request->bulan, '-')) {
            [$tahun, $bulan] = explode('-', $request->bulan, 2);
            if (is_numeric($tahun) && is_numeric($bulan)) {
                $query->whereYear('tanggal', $tahun)->whereMonth('tanggal', $bulan);
            }
        }

        $perPage = min((int) $request->input('per_page', 15), 50);
        $jadwal = $query->latest('tanggal')->paginate($perPage);

        return response()->json([
            'data' => JadwalRondaResource::collection($jadwal),
            'meta' => [
                'current_page' => $jadwal->currentPage(),
                'last_page' => $jadwal->lastPage(),
                'per_page' => $jadwal->perPage(),
                'total' => $jadwal->total(),
            ],
        ]);
    }

    public function store(StoreJadwalRondaRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();
        $role = $user->role->name;

        if ($role === 'aparatur_desa') {
            $allowedDusunIds = $user->getDusunIds();
            if (! in_array($data['dusun_id'], $allowedDusunIds)) {
                return response()->json(['message' => 'Dusun tidak berada di wilayah desa Anda.'], 403);
            }
        }

        $jadwal = DB::transaction(function () use ($data) {
            $jadwal = JadwalRonda::create([
                'dusun_id' => $data['dusun_id'],
                'tanggal' => $data['tanggal'],
                'shift' => $data['shift'],
                'status' => 'terjadwal',
            ]);

            $petugas = collect($data['petugas_ids'])->map(fn ($userId) => [
                'jadwal_ronda_id' => $jadwal->id,
                'user_id' => $userId,
                'status_hadir' => 'dijadwalkan',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            JadwalRondaPetugas::insert($petugas->toArray());

            return $jadwal;
        });

        $jadwal->load(['dusun', 'jadwalRondaPetugas.user', 'jadwalRondaPetugas.qrcodeRonda']);

        return response()->json([
            'message' => 'Jadwal ronda berhasil dibuat.',
            'data' => new JadwalRondaResource($jadwal),
        ], 201);
    }

    public function generateQr(GenerateQrcodeRequest $request): JsonResponse
    {
        $user = $request->user();
        $petugasId = $request->jadwal_ronda_petugas_id;

        $petugas = JadwalRondaPetugas::with('jadwalRonda')->findOrFail($petugasId);

        if ($petugas->user_id !== $user->id) {
            return response()->json(['message' => 'Petugas tidak sesuai.'], 403);
        }

        $existingQr = $petugas->qrcodeRonda;
        if ($existingQr) {
            if ($existingQr->is_used) {
                return response()->json([
                    'message' => 'QR code sudah digunakan.',
                    'data' => new QrcodeRondaResource($existingQr),
                ], 409);
            }
            if (! $existingQr->expired_at || Carbon::now()->lessThan($existingQr->expired_at)) {
                $existingQr->qrcode_svg = self::cleanSvg(QrCode::format('svg')->size(200)->generate($existingQr->code));

                return response()->json([
                    'message' => 'QR code masih aktif.',
                    'data' => new QrcodeRondaResource($existingQr),
                ], 409);
            }
            $existingQr->delete();
        }

        $code = Str::random(40);
        $expiredAt = Carbon::now()->addMinutes(15);

        $qrcode = DB::transaction(function () use ($petugas, $code, $expiredAt) {
            return QrcodeRonda::create([
                'jadwal_ronda_petugas_id' => $petugas->id,
                'code' => $code,
                'is_used' => false,
                'expired_at' => $expiredAt,
            ]);
        });

        $qrcodeSvg = self::cleanSvg(QrCode::format('svg')->size(200)->generate($code));

        $qrcode->qrcode_svg = $qrcodeSvg;

        return response()->json([
            'message' => 'QR code berhasil dibuat.',
            'data' => new QrcodeRondaResource($qrcode),
        ], 201);
    }

    public function scanQr(ScanQrcodeRequest $request): JsonResponse
    {
        $qrcode = QrcodeRonda::with('jadwalRondaPetugas')->where('code', $request->code)->firstOrFail();

        if ($qrcode->is_used) {
            return response()->json(['message' => 'QR code sudah digunakan.'], 409);
        }

        if ($qrcode->expired_at && Carbon::now()->greaterThan($qrcode->expired_at)) {
            return response()->json(['message' => 'QR code sudah kedaluwarsa.'], 410);
        }

        DB::transaction(function () use ($qrcode, $request) {
            $qrcode->update([
                'is_used' => true,
                'scanned_at' => Carbon::now(),
                'scanned_by' => $request->user()->id,
            ]);

            $qrcode->jadwalRondaPetugas->update([
                'status_hadir' => 'hadir',
            ]);
        });

        $qrcode->jadwalRondaPetugas->load('jadwalRonda.dusun', 'user');
        app(FirebaseService::class)->pushRondaPresensi($qrcode->jadwalRondaPetugas);

        $petugas = $qrcode->jadwalRondaPetugas;
        $jadwal = $petugas->jadwalRonda;
        $tanggal = $jadwal->tanggal instanceof \Carbon\Carbon
            ? $jadwal->tanggal->format('Y-m-d')
            : $jadwal->tanggal;

        return response()->json([
            'message' => 'Absensi berhasil. Status kehadiran diperbarui.',
            'data' => [
                'petugas' => [
                    'id' => $petugas->id,
                    'nama' => $petugas->user->nama ?? null,
                    'jabatan' => $petugas->user->jabatan ?? null,
                ],
                'status_hadir' => $petugas->status_hadir,
                'scanned_at' => $qrcode->scanned_at?->toIso8601String(),
                'dusun' => [
                    'id' => $jadwal->dusun_id,
                    'nama' => $jadwal->dusun->nama ?? null,
                ],
                'tanggal' => $tanggal,
                'shift' => $jadwal->shift,
            ],
        ]);
    }

    private static function cleanSvg(string $svg): string
    {
        $svg = (string) $svg;

        $svg = preg_replace('/<svg([^>]*?)\s+width="[^"]*"/', '<svg$1', $svg);
        $svg = preg_replace('/<svg([^>]*?)\s+height="[^"]*"/', '<svg$1', $svg);

        return $svg;
    }
}
