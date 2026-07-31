<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JadwalRondaPetugasResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => [
                'id' => $this->user->id,
                'nama' => $this->user->nama,
                'jabatan' => $this->user->jabatan,
            ],
            'status_hadir' => $this->status_hadir,
            'qr_generated' => $this->qrcodeRonda !== null,
            'scanned_at' => $this->qrcodeRonda?->scanned_at?->toIso8601String(),
        ];
    }
}
