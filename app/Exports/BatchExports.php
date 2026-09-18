<?php

namespace App\Exports;

use App\Models\Batch;
use Illuminate\Support\Enumerable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class BatchExports implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths
{
    protected $produkId;

    public function __construct($produkId = null)
    {
        $this->produkId = $produkId;
    }

    public function collection():Enumerable
    {
        $query = Batch::with(['produk']);

        if ($this->produkId) {
            $query->where('produk_id', $this->produkId);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Produk',
            'QR Code',
            'Stok Awal',
            'Stok Saat Ini',
            'Tanggal Masuk',
            'Tanggal Kadaluarsa',
            'Lokasi Rak',
            'Dibuat Pada',
        ];
    }

    public function map($row): array
    {
        return [
            $row->id,
            $row->produk->nama_produk ?? '-',
            $row->qr_code,
            $row->jumlah_awal,
            $row->stok_saat_ini,
            $row->tanggal_masuk->format('d/m/Y'),
            $row->lokasi_rak ?? '-',
            $row->created_at->format('d/m/Y H:i'),
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 6,   // ID
            'B' => 25,  // Produk
            'C' => 30,  // QR Code
            'D' => 12,  // Stok Awal
            'E' => 15,  // Stok Saat Ini
            'F' => 15,  // Tanggal Masuk
            'G' => 18,  // Tanggal Kadaluarsa
            'H' => 18,  // Lokasi Rak
            'I' => 18,  // Dibuat Pada
        ];
    }

    // Style untuk header
    public function styles(Worksheet $sheet): array|null
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]],
            'A1:I1' => ['fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'E5E7EB']]],
        ];
    }
}