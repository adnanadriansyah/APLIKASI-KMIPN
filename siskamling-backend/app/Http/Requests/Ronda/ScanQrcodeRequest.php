<?php

namespace App\Http\Requests\Ronda;

use Illuminate\Foundation\Http\FormRequest;

class ScanQrcodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => 'required|string|exists:qrcode_rondas,code',
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Kode QR wajib diisi.',
            'code.string' => 'Kode QR harus berupa string.',
            'code.exists' => 'Kode QR tidak ditemukan atau sudah tidak berlaku.',
        ];
    }
}
