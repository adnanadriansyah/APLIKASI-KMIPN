<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KamtibmasResource extends JsonResource
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
            'dusun' => [
                'id' => $this->dusun->id,
                'nama' => $this->dusun->nama,
            ],
            'kategori' => $this->kategori,
            'kategori_label' => config('siskamling.kategori_kamtibmas.'.$this->kategori, $this->kategori),
            'lokasi_text' => $this->lokasi_text,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'kronologi' => $this->kronologi,
            'ai_summary' => $this->ai_summary,
            'ai_urgency_level' => $this->ai_urgency_level,
            'status' => $this->status,
            'status_label' => config('siskamling.status_kamtibmas.'.$this->status, $this->status),
            'media' => KamtibmasMediaResource::collection($this->whenLoaded('media')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
