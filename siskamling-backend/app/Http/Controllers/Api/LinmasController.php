<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Linmas\StoreLinmasRequest;
use App\Http\Requests\Linmas\UpdateLinmasRequest;
use App\Http\Resources\LinmasResource;
use App\Models\Linmas;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LinmasController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role->name === 'polsek') {
            $perPage = min((int) $request->input('per_page', 15), 50);
            $anggota = Linmas::latest()->paginate($perPage);

            return response()->json([
                'data' => LinmasResource::collection($anggota),
                'meta' => [
                    'current_page' => $anggota->currentPage(),
                    'last_page' => $anggota->lastPage(),
                    'per_page' => $anggota->perPage(),
                    'total' => $anggota->total(),
                ],
            ]);
        }

        $polsekId = $user->getPolsekId();
        if (! $polsekId) {
            return response()->json(['data' => []]);
        }

        $perPage = min((int) $request->input('per_page', 15), 50);
        $anggota = Linmas::where('polsek_id', $polsekId)
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'data' => LinmasResource::collection($anggota),
            'meta' => [
                'current_page' => $anggota->currentPage(),
                'last_page' => $anggota->lastPage(),
                'per_page' => $anggota->perPage(),
                'total' => $anggota->total(),
            ],
        ]);
    }

    public function store(StoreLinmasRequest $request): JsonResponse
    {
        $user = $request->user();

        $polsekId = $user->polsek_id;
        if (! $polsekId) {
            return response()->json(['message' => 'Polsek tidak ditemukan.'], 404);
        }

        $anggota = Linmas::create([
            'polsek_id' => $polsekId,
            'nama' => $request->nama,
            'jabatan' => $request->jabatan,
            'no_hp' => $request->no_hp,
            'wilayah_tugas' => $request->wilayah_tugas,
        ]);

        return response()->json([
            'message' => 'Anggota Linmas berhasil ditambahkan.',
            'data' => new LinmasResource($anggota),
        ], 201);
    }

    public function show(Request $request, $id): JsonResponse
    {
        $anggota = Linmas::findOrFail($id);

        $polsekId = $request->user()->getPolsekId();
        if ($polsekId && $anggota->polsek_id !== $polsekId) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json([
            'data' => new LinmasResource($anggota),
        ]);
    }

    public function update(UpdateLinmasRequest $request, $id): JsonResponse
    {
        $anggota = Linmas::findOrFail($id);

        $polsekId = $request->user()->getPolsekId();
        if ($polsekId && $anggota->polsek_id !== $polsekId) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $anggota->update($request->validated());

        return response()->json([
            'message' => 'Anggota Linmas berhasil diperbarui.',
            'data' => new LinmasResource($anggota),
        ]);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $anggota = Linmas::findOrFail($id);

        $polsekId = $request->user()->getPolsekId();
        if ($polsekId && $anggota->polsek_id !== $polsekId) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $anggota->delete();

        return response()->json([
            'message' => 'Anggota Linmas berhasil dihapus.',
        ]);
    }
}
