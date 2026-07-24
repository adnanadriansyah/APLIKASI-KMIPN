<?php

namespace App\Http\Requests\Panic;

use Illuminate\Foundation\Http\FormRequest;

class RespondPanicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [];
    }
}
