<?php

namespace App\Http\Requests\Kamtibmas;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStatusKamtibmasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $validStatus = array_keys(config('siskamling.status_kamtibmas', []));

        return [
            'status' => ['required', 'string', Rule::in($validStatus)],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status wajib diisi.',
            'status.in' => 'Status tidak valid. Pilih salah satu dari: baru, diproses, atau selesai.',
        ];
    }
}
