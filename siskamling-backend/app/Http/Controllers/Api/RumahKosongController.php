<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RumahKosong\StoreRumahKosongRequest;
use App\Http\Requests\RumahKosong\UpdateRumahKosongRequest;
use App\Http\Resources\RumahKosongResource;
use App\Models\LaporanRumahKosong;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RumahKosongController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $user->role->name;

        $query = LaporanRumahKosong::with('user');

        if ($role === 'warga') {
            $query->where('user_id', $user->id);
        } else {
            $dusunIds = $user->getDusunIds();
            if (empty($dusunIds)) {
                return response()->json(['data' => []]);
            }
            $query->whereHas('user', fn ($q) => $q->whereIn('dusun_id', $dusunIds));
        }

        $perPage = min((int) $request->input('per_page', 15), 50);
        $laporan = $query->latest()->paginate($perPage);

        return response()->json([
            'data' => RumahKosongResource::collection($laporan),
            'meta' => [
                'current_page' => $laporan->currentPage(),
                'last_page' => $laporan->lastPage(),
                'per_page' => $laporan->perPage(),
                'total' => $laporan->total(),
            ],
        ]);
    }

    public function store(StoreRumahKosongRequest $request): JsonResponse
    {
        $laporan = LaporanRumahKosong::create([
            'user_id' => $request->user()->id,
            'alamat' => $request->alamat,
            'tanggal_berangkat' => $request->tanggal_berangkat,
            'tanggal_pulang' => $request->tanggal_pulang,
            'kontak_darurat' => $request->kontak_darurat,
            'status' => 'aktif',
        ]);

        $laporan->load('user');

        return response()->json([
            'message' => 'Laporan rumah kosong berhasil dibuat.',
            'data' => new RumahKosongResource($laporan),
        ], 201);
    }

    public function show(Request $request, $id): JsonResponse
    {
        $laporan = LaporanRumahKosong::with('user')->findOrFail($id);

        if (! $this->canAccess($request->user(), $laporan)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json([
            'data' => new RumahKosongResource($laporan),
        ]);
    }

    public function update(UpdateRumahKosongRequest $request, $id): JsonResponse
    {
        $laporan = LaporanRumahKosong::findOrFail($id);

        if (! $this->canModify($request->user(), $laporan)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $laporan->update($request->validated());
        $laporan->load('user');

        return response()->json([
            'message' => 'Laporan rumah kosong berhasil diperbarui.',
            'data' => new RumahKosongResource($laporan),
        ]);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $laporan = LaporanRumahKosong::findOrFail($id);

        if (! $this->canModify($request->user(), $laporan)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $laporan->delete();

        return response()->json([
            'message' => 'Laporan rumah kosong berhasil dihapus.',
        ]);
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

        return $laporan->user && in_array($laporan->user->dusun_id, $dusunIds);
    }

    private function canModify($user, $laporan): bool
    {
        $role = $user->role->name;

        if ($role === 'warga') {
            return $laporan->user_id === $user->id;
        }

        $dusunIds = $user->getDusunIds();
        if (empty($dusunIds)) {
            return false;
        }

        return $laporan->user && in_array($laporan->user->dusun_id, $dusunIds);
    }
}
