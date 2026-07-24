<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LinmasResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'polsek_id' => $this->polsek_id,
            'nama' => $this->nama,
            'jabatan' => $this->jabatan,
            'no_hp' => $this->no_hp,
            'wilayah_tugas' => $this->wilayah_tugas,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
