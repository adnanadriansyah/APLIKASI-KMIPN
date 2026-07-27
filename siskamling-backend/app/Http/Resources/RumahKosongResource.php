<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RumahKosongResource extends JsonResource
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
            'alamat' => $this->alamat,
            'tanggal_berangkat' => $this->tanggal_berangkat->format('Y-m-d'),
            'tanggal_pulang' => $this->tanggal_pulang->format('Y-m-d'),
            'kontak_darurat' => $this->kontak_darurat,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
