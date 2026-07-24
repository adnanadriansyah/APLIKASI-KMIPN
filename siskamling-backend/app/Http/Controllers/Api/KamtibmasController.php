<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kamtibmas\StoreKamtibmasRequest;
use App\Http\Requests\Kamtibmas\UpdateStatusKamtibmasRequest;
use App\Http\Resources\KamtibmasResource;
use App\Jobs\GenerateKamtibmasSummary;
use App\Models\LaporanKamtibmas;
use App\Models\LaporanKamtibmasMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KamtibmasController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $user->role->name;

        $query = LaporanKamtibmas::with(['user', 'dusun', 'media']);

        if ($role === 'warga') {
            $query->where('user_id', $user->id);
        } else {
            $dusunIds = $user->getDusunIds();
            if (empty($dusunIds)) {
                return response()->json(['data' => []]);
            }
            $query->whereIn('dusun_id', $dusunIds);
        }

        if ($request->filled('kategori')) {
            $query->where('kategori', $request->kategori);
        }

        if ($request->filled('dusun_id')) {
            $query->where('dusun_id', $request->dusun_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = min((int) $request->input('per_page', 15), 50);
        $laporan = $query->latest()->paginate($perPage);

        return response()->json([
            'data' => KamtibmasResource::collection($laporan),
            'meta' => [
                'current_page' => $laporan->currentPage(),
                'last_page' => $laporan->lastPage(),
                'per_page' => $laporan->perPage(),
                'total' => $laporan->total(),
            ],
        ]);
    }

    public function store(StoreKamtibmasRequest $request): JsonResponse
    {
        $user = $request->user();

        $laporan = DB::transaction(function () use ($request, $user) {
            $laporan = LaporanKamtibmas::create([
                'user_id' => $user->id,
                'dusun_id' => $user->dusun_id,
                'kategori' => $request->kategori,
                'lokasi_text' => $request->lokasi_text,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'kronologi' => $request->kronologi,
                'status' => 'baru',
            ]);

            $this->uploadMedia($request, 'foto', 'foto', $laporan->id);
            $this->uploadMedia($request, 'video', 'video', $laporan->id);

            return $laporan;
        });

        $laporan->load(['user', 'dusun', 'media']);

        GenerateKamtibmasSummary::dispatch($laporan);

        return response()->json([
            'message' => 'Laporan kamtibmas berhasil dikirim.',
            'data' => new KamtibmasResource($laporan),
        ], 201);
    }

    public function show(Request $request, $id): JsonResponse
    {
        $laporan = LaporanKamtibmas::with(['user', 'dusun', 'media'])->findOrFail($id);

        if (! $this->canAccess($request->user(), $laporan)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json([
            'data' => new KamtibmasResource($laporan),
        ]);
    }

    public function updateStatus(UpdateStatusKamtibmasRequest $request, $id): JsonResponse
    {
        $user = $request->user();
        $laporan = LaporanKamtibmas::findOrFail($id);

        $dusunIds = $user->getDusunIds();
        if (! empty($dusunIds) && ! in_array($laporan->dusun_id, $dusunIds)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $laporan->update(['status' => $request->status]);
        $laporan->load(['user', 'dusun', 'media']);

        return response()->json([
            'message' => 'Status laporan kamtibmas berhasil diperbarui.',
            'data' => new KamtibmasResource($laporan),
        ]);
    }

    private function uploadMedia(Request $request, string $inputName, string $type, int $laporanId): void
    {
        if (! $request->hasFile($inputName)) {
            return;
        }

        foreach ($request->file($inputName) as $file) {
            $path = $file->store('laporan', 'public');

            LaporanKamtibmasMedia::create([
                'laporan_kamtibmas_id' => $laporanId,
                'type' => $type,
                'file_path' => $path,
            ]);
        }
    }

    private function canAccess($user, $laporan): bool
    {
        $role = $user->role->name;

        if ($role === 'warga') {
            return $laporan->user_id === $user->id;
        }

        $dusunIds = $user->getDusunIds();
        if (empty($dusunIds)) {
            return false;
        }

        return in_array($laporan->dusun_id, $dusunIds);
    }
}
