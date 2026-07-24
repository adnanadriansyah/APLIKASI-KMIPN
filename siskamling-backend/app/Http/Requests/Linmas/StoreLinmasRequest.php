<?php

namespace App\Http\Requests\Linmas;

use Illuminate\Foundation\Http\FormRequest;

class StoreLinmasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama' => 'required|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'no_hp' => 'nullable|string|max:20',
            'wilayah_tugas' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'nama.required' => 'Nama anggota linmas wajib diisi.',
            'nama.max' => 'Nama anggota linmas maksimal 255 karakter.',
            'jabatan.max' => 'Jabatan maksimal 255 karakter.',
            'no_hp.max' => 'Nomor HP maksimal 20 karakter.',
            'wilayah_tugas.max' => 'Wilayah tugas maksimal 255 karakter.',
        ];
    }
}
