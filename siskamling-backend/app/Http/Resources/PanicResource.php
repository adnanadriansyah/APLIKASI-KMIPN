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
                'jabatan' => $this->user->jabatan,
                'phone' => $this->user->phone,
            ],
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'status' => $this->status,
            'responded_by' => $this->whenLoaded('respondedBy', fn () => [
                'id' => $this->respondedBy->id,
                'nama' => $this->respondedBy->nama,
                'jabatan' => $this->respondedBy->jabatan,
            ]),
            'responded_at' => $this->responded_at,
            'completed_by' => $this->whenLoaded('completedBy', fn () => [
                'id' => $this->completedBy->id,
                'nama' => $this->completedBy->nama,
                'jabatan' => $this->completedBy->jabatan,
            ]),
            'completed_at' => $this->completed_at,
            'created_at' => $this->created_at,
        ];
    }
}
