<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class MemintaKategori extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; //ubah ke false jika menggunakan auth
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $kategoriId = $this->route('kategori') ? $this->route('kategori')->id : null;

        return [
            'nama_kategori' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'slug' => 'required|string|unique:kategori,slug,' . ($kategoriId ? ",$kategoriId" : ''),
        ];
    }

    public function messages(): array
    {
        return [
            'nama_kategori.required' => 'Nama kategori wajib diisi.',
            'nama_kategori.string' => 'Nama kategori harus berupa teks.',
            'nama_kategori.max' => 'Nama kategori tidak boleh lebih dari 255 karakter.',
            'deskripsi.string' => 'Deskripsi harus berupa teks.',
            'slug.required' => 'Slug wajib diisi.',
            'slug.string' => 'Slug harus berupa teks.',
            'slug.unique' => 'Slug sudah digunakan. Silakan gunakan slug lain.',
        ];
    }
}
