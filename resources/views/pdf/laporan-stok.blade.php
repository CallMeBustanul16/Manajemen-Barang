<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Stok</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 11px;
            color: #1f2937;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px solid #1e40af;
        }

        .header h1 {
            font-size: 22px;
            color: #1e40af;
            margin-bottom: 5px;
        }

        .header p {
            font-size: 11px;
            color: #6b7280;
        }

        .info {
            margin-bottom: 15px;
            padding: 10px;
            background: #f3f4f6;
            border-radius: 5px;
        }

        .info table {
            width: 100%;
        }

        .info td {
            padding: 3px 5px;
            font-size: 11px;
        }

        .info td:first-child {
            font-weight: bold;
            width: 120px;
            color: #374151;
        }

        .summary {
            display: table;
            width: 100%;
            margin-bottom: 15px;
            border-collapse: separate;
            border-spacing: 5px 0;
        }

        .summary-card {
            display: table-cell;
            width: 25%;
            padding: 10px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 5px;
            text-align: center;
        }

        .summary-card .label {
            font-size: 9px;
            color: #6b7280;
            text-transform: uppercase;
            margin-bottom: 3px;
        }

        .summary-card .value {
            font-size: 16px;
            font-weight: bold;
        }

        .value-green { color: #059669; }
        .value-red { color: #dc2626; }
        .value-red { color: #2563eb; }
        .value-yellow { color: #d97706; }

        table.data {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        table.data th {
            background: #1e40af;
            color: white;
            padding: 8px 5px;
            text-align: left;
            font-size: 10px;
            border: 1px solid #1e40af;
        }

        table.data td {
            padding: 6px 5px;
            border: 1px solid #e5e7eb;
            font-size: 10px;
        }

        table.data tr:nth-child(even) {
            background: #f9fafb;
        }

        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: bold;
        }

        .badge-masuk {
            background: #d1fae5;
            color: #065f46;
        }

        .badge-keluar {
            background: #fee2e2;
            color: #991b1b;
        }

        .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 9px;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1 style="text-transform: uppercase;">{{ $company['company_name'] ?? 'SISTEM MANAJEMEN INVENTARIS' }}</h1>
        <p style="font-weight: bold; color: #4b5563;">{{ $company['company_tagline'] ?? 'Divisi Pergudangan & Logistik' }} • LAPORAN MUTASI STOK</p>
        <p style="font-size: 10px; color: #6b7280; margin-top: 3px;">
            {{ $company['company_address'] ?? 'Alamat Gudang Utama' }} 
            @if(!empty($company['company_phone'])) | Telp: {{ $company['company_phone'] }} @endif
            @if(!empty($company['company_email'])) | Email: {{ $company['company_email'] }} @endif
        </p>
    </div>

    <!-- Info Periode -->
    <div class="info">
        <table>
            <tr>
                <td>Periode</td>
                <td>: {{ $startDate }} s/d {{ $endDate }}</td>
            </tr>
            @if($tipe)
            <tr>
                <td>Tipe Transaksi</td>
                <td>: {{ ucfirst($tipe) }}</td>
            </tr>
            @endif
            @if($produkNama)
            <tr>
                <td>Produk</td>
                <td>: {{ $produkNama }}</td>
            </tr>
            @endif
            <tr>
                <td>Dicetak Pada</td>
                <td>: {{ now()->format('d/m/Y H:i') }}</td>
            </tr>
        </table>
    </div>

    <!-- Ringkasan -->
    <div class="summary">
        <div class="summary-card">
            <div class="label">Total Transaksi</div>
            <div class="value value-red">{{ $totalTransaksi }}</div>
        </div>
        <div class="summary-card">
            <div class="label">Total Masuk</div>
            <div class="value value-green">+{{ $totalMasuk }}</div>
        </div>
        <div class="summary-card">
            <div class="label">Total Keluar</div>
            <div class="value value-red">-{{ $totalKeluar }}</div>
        </div>
        <div class="summary-card">
            <div class="label">Selisih</div>
            <div class="value {{ $selisih >= 0 ? 'value-green' : 'value-red' }}">
                {{ $selisih >= 0 ? '+' : '' }}{{ $selisih }}
            </div>
        </div>
    </div>

    <!-- Tabel Transaksi -->
    <table class="data">
        <thead>
            <tr>
                <th style="width: 30px;">No</th>
                <th>Produk</th>
                <th style="width: 50px;">Tipe</th>
                <th style="width: 50px; text-align: center;">Jumlah</th>
                <th style="width: 80px;">Batch</th>
                <th style="width: 80px;">User</th>
                <th style="width: 90px;">Tanggal</th>
            </tr>
        </thead>
        <tbody>
            @forelse($transactions as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>
                    <span class="badge {{ $item->tipe === 'masuk' ? 'badge-masuk' : 'badge-keluar' }}">
                        {{ $item->tipe === 'masuk' ? 'MASUK' : 'KELUAR' }}
                    </span>
                </td>
                <td style="text-align: center; font-weight: bold;">
                    {{ $item->jumlah }}
                </td>
                <td>{{ $item->batch ? 'Batch #' . $item->batch->id : '-' }}</td>
                <td>{{ $item->user->name ?? '-' }}</td>
                <td>{{ \Carbon\Carbon::parse($item->tanggal)->format('d/m/Y H:i') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px; color: #9ca3af;">
                    Tidak ada transaksi dalam periode ini
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Tanda Tangan Resmi -->
    <div style="margin-top: 30px; display: table; width: 100%;">
        <div style="display: table-cell; width: 50%; text-align: left; vertical-align: top; font-size: 10px; color: #4b5563;">
            <p style="font-weight: bold; margin-bottom: 3px;">Catatan Resmi:</p>
            <p style="font-style: italic; max-width: 280px; line-height: 1.4;">{{ $company['company_note'] ?? 'Laporan ini sah dan dihasilkan otomatis oleh sistem inventaris.' }}</p>
        </div>
        <div style="display: table-cell; width: 50%; text-align: right; vertical-align: top;">
            <div style="display: inline-block; text-align: center; min-width: 180px;">
                <p style="font-size: 10px; color: #4b5563; margin-bottom: 40px;">Disahkan Oleh,</p>
                <p style="font-size: 11px; font-weight: bold; text-decoration: underline; color: #111827;">{{ $company['company_pic'] ?? 'Admin User' }}</p>
                <p style="font-size: 9px; color: #6b7280; margin-top: 2px;">{{ $company['company_pic_role'] ?? 'Kepala Logistik & Pergudangan' }}</p>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>Dokumen ini dicetak secara resmi oleh {{ $company['company_name'] ?? 'Sistem Manajemen Inventaris' }}</p>
        <p>&copy; {{ date('Y') }} {{ $company['company_name'] ?? 'Manajemen Barang' }}. All rights reserved.</p>
    </div>
</body>
</html>