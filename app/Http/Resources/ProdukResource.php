<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProdukResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama_produk' => $this->nama_produk,
            'deskripsi' => $this->deskripsi,
            'harga' => $this->harga,
            'harga_formatted' => 'Rp ' . number_format($this->harga, 0, ',', '.'),
            'sku' => $this->sku,
            'stok' => $this->stok,
            'stok_minimal' => $this->stok_minimal,
            'qr_code' => $this->qr_code,
            'status_stok' => $this->stok > 0 ? 'Tersedia' : 'Habis',
            'kategori' => new KategoriResource($this->whenLoaded('kategori')),
            'pemasok' => new PemasokResource($this->whenLoaded('pemasok')),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
