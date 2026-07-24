<?php

namespace App\Http\Requests\Ronda;

use Illuminate\Foundation\Http\FormRequest;

class GenerateQrcodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'jadwal_ronda_petugas_id' => 'required|exists:jadwal_ronda_petugas,id',
        ];
    }

    public function messages(): array
    {
        return [
            'jadwal_ronda_petugas_id.required' => 'Jadwal ronda petugas wajib dipilih.',
            'jadwal_ronda_petugas_id.exists' => 'Jadwal ronda petugas yang dipilih tidak ditemukan.',
        ];
    }
}
