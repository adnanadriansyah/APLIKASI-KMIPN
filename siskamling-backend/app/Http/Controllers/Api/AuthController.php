<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        if (! Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Email atau password salah.',
            ], 401);
        }

        $user = Auth::user()->load('role');

        return response()->json([
            'message' => 'Login berhasil.',
            'user' => [
                'id' => $user->id,
                'nama' => $user->nama,
                'jabatan' => $user->jabatan,
                'email' => $user->email,
                'role' => $user->role?->name,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('role');

        return response()->json([
            'id' => $user->id,
            'nama' => $user->nama,
            'email' => $user->email,
            'jabatan' => $user->jabatan,
            'phone' => $user->phone,
            'dusun_id' => $user->dusun_id,
            'desa_id' => $user->desa_id,
            'polsek_id' => $user->polsek_id,
            'role' => $user->role?->name,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logout berhasil.',
        ]);
    }
}
