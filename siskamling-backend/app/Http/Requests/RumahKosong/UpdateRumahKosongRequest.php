<?php

namespace App\Http\Requests\RumahKosong;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRumahKosongRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'alamat' => 'sometimes|required|string|max:255',
            'nama_penghuni' => 'nullable|string|max:255',
            'tanggal_berangkat' => 'sometimes|required|date',
            'tanggal_pulang' => 'sometimes|required|date|after:tanggal_berangkat',
            'kontak_darurat' => 'nullable|string|max:255',
            'status' => 'sometimes|required|in:aktif,selesai',
        ];
    }

    public function messages(): array
    {
        return [
            'alamat.required' => 'Alamat rumah wajib diisi.',
            'alamat.max' => 'Alamat rumah maksimal 255 karakter.',
            'nama_penghuni.max' => 'Nama penghuni maksimal 255 karakter.',
            'tanggal_berangkat.required' => 'Tanggal berangkat wajib diisi.',
            'tanggal_berangkat.date' => 'Tanggal berangkat harus berupa tanggal yang valid.',
            'tanggal_pulang.required' => 'Tanggal pulang wajib diisi.',
            'tanggal_pulang.date' => 'Tanggal pulang harus berupa tanggal yang valid.',
            'tanggal_pulang.after' => 'Tanggal pulang harus setelah tanggal berangkat.',
            'kontak_darurat.max' => 'Kontak darurat maksimal 255 karakter.',
        ];
    }
}
