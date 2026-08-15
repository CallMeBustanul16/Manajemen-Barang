<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class MemintaPemasok extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $pemasokId = $this->route('pemasok') ? $this->route('pemasok')->id : null;
        return [
            'nama_pemasok' => 'required|string|max:255',
            'alamat' => 'nullable|string',
            'telepon' => 'nullable|string|max:20',
            'email' => 'nullable|email|unique:pemasok,email,' . ($pemasokId ? ",$pemasokId" : ''),
        ];
    }

    public function messages(): array
    {
        return [
            'nama_pemasok.required' => 'Nama pemasok wajib diisi.',
            'nama_pemasok.string' => 'Nama pemasok harus berupa teks.',
            'nama_pemasok.max' => 'Nama pemasok tidak boleh lebih dari 255 karakter.',
            'alamat.string' => 'Alamat harus berupa teks.',
            'telepon.string' => 'Telepon harus berupa teks.',
            'telepon.max' => 'Telepon tidak boleh lebih dari 20 karakter.',
            'email.email' => 'Email tidak valid.',
            'email.unique' => 'Email sudah digunakan. Silakan gunakan email lain.',
        ];
    }
}
