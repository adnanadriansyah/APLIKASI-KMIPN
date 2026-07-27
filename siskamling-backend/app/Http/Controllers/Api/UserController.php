<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dusun;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $dusunIds = $user->getDusunIds();

        $query = User::with('dusun')
            ->whereIn('dusun_id', $dusunIds)
            ->where('role_id', Role::where('name', 'warga')->value('id'));

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('nik', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('dusun_id')) {
            $query->where('dusun_id', $request->dusun_id);
        }

        $perPage = min((int) $request->input('per_page', 15), 50);
        $users = $query->latest()->paginate($perPage);

        return response()->json([
            'data' => $users->map(fn ($u) => [
                'id' => $u->id,
                'nama' => $u->nama,
                'jabatan' => $u->jabatan,
                'email' => $u->email,
                'phone' => $u->phone,
                'nik' => $u->nik,
                'alamat' => $u->alamat,
                'dusun' => $u->dusun ? ['id' => $u->dusun->id, 'nama' => $u->dusun->nama] : null,
                'created_at' => $u->created_at,
            ]),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'nik' => 'nullable|string|max:20',
            'alamat' => 'nullable|string|max:255',
            'dusun_id' => 'required|exists:dusuns,id',
            'password' => ['required', 'string', Password::min(6)],
        ]);

        $user = $request->user();
        $allowedDusunIds = $user->getDusunIds();
        if (! in_array($validated['dusun_id'], $allowedDusunIds)) {
            return response()->json(['message' => 'Dusun tidak berada di wilayah desa Anda.'], 403);
        }

        $wargaRole = Role::where('name', 'warga')->value('id');

        $newUser = User::create([
            'nama' => $validated['nama'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'nik' => $validated['nik'] ?? null,
            'alamat' => $validated['alamat'] ?? null,
            'dusun_id' => $validated['dusun_id'],
            'role_id' => $wargaRole,
            'password' => Hash::make($validated['password']),
        ]);

        $newUser->load('dusun');

        return response()->json([
            'message' => 'Warga berhasil ditambahkan.',
            'data' => [
                'id' => $newUser->id,
                'nama' => $newUser->nama,
                'jabatan' => $newUser->jabatan,
                'email' => $newUser->email,
                'phone' => $newUser->phone,
                'nik' => $newUser->nik,
                'alamat' => $newUser->alamat,
                'dusun' => $newUser->dusun ? ['id' => $newUser->dusun->id, 'nama' => $newUser->dusun->nama] : null,
            ],
        ], 201);
    }

    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $dusunIds = $user->getDusunIds();

        $warga = User::with('dusun')
            ->where('id', $id)
            ->whereIn('dusun_id', $dusunIds)
            ->first();

        if (! $warga) {
            return response()->json(['message' => 'Warga tidak ditemukan.'], 404);
        }

        return response()->json([
            'data' => [
                'id' => $warga->id,
                'nama' => $warga->nama,
                'jabatan' => $warga->jabatan,
                'email' => $warga->email,
                'phone' => $warga->phone,
                'nik' => $warga->nik,
                'alamat' => $warga->alamat,
                'dusun' => $warga->dusun ? ['id' => $warga->dusun->id, 'nama' => $warga->dusun->nama] : null,
            ],
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $dusunIds = $user->getDusunIds();

        $warga = User::where('id', $id)
            ->whereIn('dusun_id', $dusunIds)
            ->first();

        if (! $warga) {
            return response()->json(['message' => 'Warga tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'nama' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $warga->id,
            'phone' => 'nullable|string|max:20',
            'nik' => 'nullable|string|max:20',
            'alamat' => 'nullable|string|max:255',
            'dusun_id' => 'sometimes|exists:dusuns,id',
            'jabatan' => 'nullable|string|max:255',
        ]);

        if (isset($validated['dusun_id']) && ! in_array($validated['dusun_id'], $dusunIds)) {
            return response()->json(['message' => 'Dusun tidak berada di wilayah desa Anda.'], 403);
        }

        $warga->update($validated);

        return response()->json([
            'message' => 'Data warga berhasil diperbarui.',
            'data' => [
                'id' => $warga->id,
                'nama' => $warga->nama,
                'jabatan' => $warga->jabatan,
                'email' => $warga->email,
                'phone' => $warga->phone,
                'nik' => $warga->nik,
                'alamat' => $warga->alamat,
                'dusun' => $warga->dusun ? ['id' => $warga->dusun->id, 'nama' => $warga->dusun->nama] : null,
            ],
        ]);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $dusunIds = $user->getDusunIds();

        $warga = User::where('id', $id)
            ->whereIn('dusun_id', $dusunIds)
            ->first();

        if (! $warga) {
            return response()->json(['message' => 'Warga tidak ditemukan.'], 404);
        }

        $warga->delete();

        return response()->json([
            'message' => 'Warga berhasil dihapus.',
        ]);
    }

    public function dusuns(Request $request): JsonResponse
    {
        $user = $request->user();
        $dusunIds = $user->getDusunIds();

        $dusuns = Dusun::whereIn('id', $dusunIds)->get(['id', 'nama']);

        return response()->json([
            'data' => $dusuns,
        ]);
    }
}
