<?php

namespace App\Exports;

use App\Models\StokTransaksi;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class StokExport implements FromCollection, WithHeadings, WithMapping
{
    protected $startDate;
    protected $endDate;

    public function __construct($startDate = null, $endDate = null)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

        public function collection(): Collection
    {
        $query = StokTransaksi::with(['produk', 'user']);

        if ($this->startDate) {
            $query->whereDate('tanggal', '>=', $this->startDate);
        }
        if ($this->endDate) {
            $query->whereDate('tanggal', '<=', $this->endDate);
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
            $row->tipe == 'masuk' ? 'Masuk' : 'Keluar',
            $row->jumlah,
            $row->stok_sebelum,
            $row->stok_sesudah,
            $row->user->name ?? '-',
            $row->tanggal->format('d/m/Y H:i'),
            $row->catatan ?? '-',
        ];
    }
}
