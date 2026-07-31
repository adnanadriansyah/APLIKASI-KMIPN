<?php

namespace App\Http\Requests\RumahKosong;

use Illuminate\Foundation\Http\FormRequest;

class StoreRumahKosongRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'alamat' => 'required|string|max:255',
            'nama_penghuni' => 'nullable|string|max:255',
            'tanggal_berangkat' => 'required|date|after_or_equal:today',
            'tanggal_pulang' => 'required|date|after:tanggal_berangkat',
            'kontak_darurat' => 'nullable|string|max:255',
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
            'tanggal_berangkat.after_or_equal' => 'Tanggal berangkat tidak boleh di masa lalu.',
            'tanggal_pulang.required' => 'Tanggal pulang wajib diisi.',
            'tanggal_pulang.date' => 'Tanggal pulang harus berupa tanggal yang valid.',
            'tanggal_pulang.after' => 'Tanggal pulang harus setelah tanggal berangkat.',
            'kontak_darurat.max' => 'Kontak darurat maksimal 255 karakter.',
        ];
    }
}
