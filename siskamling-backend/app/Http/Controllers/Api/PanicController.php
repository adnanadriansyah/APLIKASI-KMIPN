<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Panic\RespondPanicRequest;
use App\Http\Requests\Panic\StorePanicRequest;
use App\Http\Resources\PanicResource;
use App\Jobs\SendPanicNotification;
use App\Models\PanicButtonLog;
use App\Models\Polsek;
use App\Services\FirebaseService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PanicController extends Controller
{
    public function store(StorePanicRequest $request): JsonResponse
    {
        $user = $request->user();

        $panic = PanicButtonLog::create([
            'user_id' => $user->id,
            'dusun_id' => $user->dusun_id,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'status' => 'terkirim',
        ]);

        $panic->load('user.dusun.desa');

        app(FirebaseService::class)->pushPanicStatus($panic);

        $polsekId = $user->getPolsekId();
        if ($polsekId) {
            $polsek = Polsek::find($polsekId);
            if ($polsek) {
                SendPanicNotification::dispatch($panic, $polsek);
            }
        }

        return response()->json([
            'message' => 'Panic button ditekan. Bantuan akan segera datang.',
            'data' => new PanicResource($panic),
        ], 201);
    }

    public function respond(RespondPanicRequest $request, $id): JsonResponse
    {
        $user = $request->user();
        $panic = PanicButtonLog::with('respondedBy')->findOrFail($id);

        $dusunIds = $user->getDusunIds();
        if (! empty($dusunIds)) {
            $panicUser = $panic->user;
            if (! $panicUser || ! in_array($panicUser->dusun_id, $dusunIds)) {
                return response()->json(['message' => 'Panic ini di luar wilayah Anda.'], 403);
            }
        }

        if ($panic->status !== 'terkirim') {
            return response()->json(['message' => 'Panic ini sudah direspons.'], 409);
        }

        $panic->update([
            'status' => 'direspon',
            'responded_by' => $user->id,
            'responded_at' => Carbon::now(),
        ]);

        $panic->load('respondedBy');
        $panic->load('user.dusun.desa');

        app(FirebaseService::class)->pushPanicStatus($panic);

        return response()->json([
            'message' => 'Panic berhasil direspons.',
            'data' => new PanicResource($panic),
        ]);
    }

    public function active(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $user->role->name;

        $query = PanicButtonLog::with('user')->where('status', 'terkirim');

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
        $panic = $query->latest()->paginate($perPage);

        return response()->json([
            'data' => PanicResource::collection($panic),
            'meta' => [
                'current_page' => $panic->currentPage(),
                'last_page' => $panic->lastPage(),
                'per_page' => $panic->perPage(),
                'total' => $panic->total(),
            ],
        ]);
    }
}
