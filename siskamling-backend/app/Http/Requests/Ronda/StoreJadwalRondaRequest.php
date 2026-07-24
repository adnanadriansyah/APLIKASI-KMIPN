<?php

namespace App\Http\Requests\Ronda;

use Illuminate\Foundation\Http\FormRequest;

class StoreJadwalRondaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dusun_id' => 'required|exists:dusuns,id',
            'tanggal' => 'required|date|after_or_equal:today',
            'shift' => 'required|string|in:shift_1,shift_2',
            'petugas_ids' => 'required|array|min:1',
            'petugas_ids.*' => 'required|exists:users,id',
        ];
    }

    public function messages(): array
    {
        return [
            'dusun_id.required' => 'Dusun wajib dipilih.',
            'dusun_id.exists' => 'Dusun yang dipilih tidak valid.',
            'tanggal.required' => 'Tanggal jadwal wajib diisi.',
            'tanggal.date' => 'Tanggal harus berupa tanggal yang valid.',
            'tanggal.after_or_equal' => 'Tanggal jadwal tidak boleh di masa lalu.',
            'shift.required' => 'Shift wajib dipilih.',
            'shift.in' => 'Shift tidak valid. Pilih shift_1 atau shift_2.',
            'petugas_ids.required' => 'Daftar petugas wajib diisi.',
            'petugas_ids.array' => 'Daftar petugas harus berupa array.',
            'petugas_ids.min' => 'Minimal 1 petugas harus ditentukan.',
            'petugas_ids.*.exists' => 'Petugas dengan ID tersebut tidak ditemukan.',
        ];
    }
}
