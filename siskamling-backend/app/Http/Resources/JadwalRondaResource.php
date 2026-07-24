<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JadwalRondaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'dusun' => [
                'id' => $this->dusun->id,
                'nama' => $this->dusun->nama,
            ],
            'tanggal' => $this->tanggal->format('Y-m-d'),
            'shift' => $this->shift,
            'status' => $this->status,
            'petugas' => JadwalRondaPetugasResource::collection($this->whenLoaded('jadwalRondaPetugas')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
