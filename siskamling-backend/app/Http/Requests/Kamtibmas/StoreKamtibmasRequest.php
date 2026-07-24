<?php

namespace App\Http\Requests\Kamtibmas;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreKamtibmasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $validKategori = array_keys(config('siskamling.kategori_kamtibmas', []));

        return [
            'kategori' => ['required', 'string', Rule::in($validKategori)],
            'lokasi_text' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'kronologi' => 'required|string|min:10|max:5000',
            'foto' => 'sometimes|array|max:5',
            'foto.*' => 'file|mimes:jpg,jpeg,png|max:5120',
            'video' => 'sometimes|array|max:2',
            'video.*' => 'file|mimes:mp4,mov|max:20480',
        ];
    }

    public function messages(): array
    {
        return [
            'kategori.required' => 'Kategori laporan wajib diisi.',
            'kategori.in' => 'Kategori tidak valid. Pilih salah satu dari: pencurian, mencurigakan, vandalisme, kebakaran, keributan, atau lainnya.',
            'kronologi.required' => 'Kronologi kejadian wajib diisi.',
            'kronologi.min' => 'Kronologi kejadian minimal 10 karakter.',
            'kronologi.max' => 'Kronologi kejadian maksimal 5000 karakter.',
            'lokasi_text.max' => 'Deskripsi lokasi maksimal 255 karakter.',
            'latitude.between' => 'Latitude harus antara -90 dan 90.',
            'longitude.between' => 'Longitude harus antara -180 dan 180.',
            'foto.max' => 'Maksimal 5 foto yang dapat diunggah.',
            'foto.*.mimes' => 'Foto harus berformat JPG, JPEG, atau PNG.',
            'foto.*.max' => 'Ukuran foto maksimal 5 MB.',
            'video.max' => 'Maksimal 2 video yang dapat diunggah.',
            'video.*.mimes' => 'Video harus berformat MP4 atau MOV.',
            'video.*.max' => 'Ukuran video maksimal 20 MB.',
        ];
    }
}
