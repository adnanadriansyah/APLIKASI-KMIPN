<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QrcodeRondaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'qrcode_svg' => $this->when($this->qrcode_svg !== null, $this->qrcode_svg),
            'is_used' => $this->is_used,
            'expired_at' => $this->expired_at,
            'scanned_at' => $this->scanned_at,
        ];
    }
}
