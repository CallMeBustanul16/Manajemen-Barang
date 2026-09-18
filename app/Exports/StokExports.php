<?php

namespace App\Exports;

use App\Models\StokTransaksi;
use Illuminate\Support\Enumerable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StokExports implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths
{
    protected $startDate;
    protected $endDate;
    protected $tipe;
    protected $produkId;

    public function __construct($startDate = null, $endDate = null, $tipe = null, $produkId = null)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->tipe = $tipe;
        $this->produkId = $produkId;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection(): Enumerable
    {
        $query = StokTransaksi::with(['produk', 'user', 'batch']);

        // Filter tanggal
        if ($this->startDate) {
            $query->whereDate('tanggal', '>=', $this->startDate);
        }
        if ($this->endDate) {
            $query->whereDate('tanggal', '<=', $this->endDate);
        }

        // Filter tipe
        if ($this->tipe) {
            $query->where('tipe', $this->tipe);
        }

        // Filter produk
        if ($this->produkId) {
            $query->where('produk_id', $this->produkId);
        }

        return $query->orderBy('tanggal', 'desc')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Produk',
            'SKU',
            'Tipe',
            'Jumlah',
            'Stok Sebelum',
            'Stok Sesudah',
            'Batch',
            'User',
            'Tanggal',
            'Catatan',
        ];
    }

    public function map($row): array
    {
        return [
            $row->id,
            $row->produk->nama_produk ?? '-',
            $row->produk->sku ?? '-',
            $row->tipe === 'masuk' ? 'Masuk' : 'Keluar',
            $row->jumlah,
            $row->stok_sebelum,
            $row->stok_sesudah,
            $row->batch ? 'Batch #' . $row->batch->id : '-',
            $row->user->name ?? '-',
            $row->tanggal->format('d/m/Y H:i'),
            $row->catatan ?? '-',
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 6,   // ID
            'B' => 25,  // Produk
            'C' => 15,  // SKU
            'D' => 10,  // Tipe
            'E' => 10,  // Jumlah
            'F' => 13,  // Stok Sebelum
            'G' => 13,  // Stok Sesudah
            'H' => 12,  // Batch
            'I' => 15,  // User
            'J' => 18,  // Tanggal
            'K' => 25,  // Catatan
        ];
    }

    // Style untuk header
    public function styles(Worksheet $sheet): array|null
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]],
            'A1:K1' => ['fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'E5E7EB']]],
        ];
    }
}