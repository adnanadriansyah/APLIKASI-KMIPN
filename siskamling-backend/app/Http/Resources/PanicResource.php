<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PanicResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => [
                'id' => $this->user->id,
                'nama' => $this->user->nama,
                'phone' => $this->user->phone,
            ],
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'status' => $this->status,
            'responded_by' => $this->whenLoaded('respondedBy', fn () => [
                'id' => $this->respondedBy->id,
                'nama' => $this->respondedBy->nama,
            ]),
            'responded_at' => $this->responded_at,
            'created_at' => $this->created_at,
        ];
    }
}
