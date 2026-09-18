import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Calendar, Download, RefreshCw, FileText, 
    TrendingUp, TrendingDown, Package, ArrowUp, ArrowDown, Filter, RotateCcw
} from 'lucide-react';
import Swal from 'sweetalert2';

// Standardized Date Formatter di luar render loop (Hemat CPU/Memori)
const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
});
const shortDateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
});

export default function HomeLaporan() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // State Filter
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterTipe, setFilterTipe] = useState('');
    const [filterProduk, setFilterProduk] = useState('');
    const [produkList, setProdukList] = useState([]);

    useEffect(() => {
        fetchProdukList();
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        setEndDate(today.toISOString().split('T')[0]);
        setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    }, []);

    const fetchProdukList = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/produk', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const result = await response.json();
            if (response.ok) setProdukList(result.data || []);
        } catch (error) {
            console.error('Error fetching produk:', error);
        }
    };

    const fetchLaporan = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                start_date: startDate,
                end_date: endDate,
                ...(filterTipe && { tipe: filterTipe }),
                ...(filterProduk && { produk_id: filterProduk }),
            });

            const response = await fetch(`/api/stok/history?${params}&per_page=100`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            const result = await response.json();

            if (response.ok) {
                setTransactions(result.data?.data || []);
            } else {
                Swal.fire('Error', result.message || 'Gagal memuat laporan', 'error');
            }
        } catch (error) {
            console.error('Error fetching laporan:', error);
            Swal.fire('Error', 'Gagal memuat laporan', 'error');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, filterTipe, filterProduk]);

    useEffect(() => {
        if (startDate && endDate) {
            fetchLaporan();
        }
    }, [fetchLaporan, startDate, endDate]);

    // Menggunakan useMemo agar perhitungan ringkasan tidak memicu re-render berlebihan
    const summary = useMemo(() => {
        let masuk = 0;
        let keluar = 0;

        for (const t of transactions) {
            if (t.tipe === 'masuk') masuk += t.jumlah;
            else if (t.tipe === 'keluar') keluar += t.jumlah;
        }

        return {
            total_masuk: masuk,
            total_keluar: keluar,
            total_transaksi: transactions.length,
            selisih: masuk - keluar,
        };
    }, [transactions]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchLaporan();
        setRefreshing(false);
        Swal.fire({
            title: 'Diperbarui!',
            text: 'Laporan telah diperbarui.',
            icon: 'success',
            timer: 1000,
            showConfirmButton: false,
        });
    };

    const handleReset = () => {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        setFilterTipe('');
        setFilterProduk('');
    };

    const downloadFile = async (url, filename) => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                start_date: startDate,
                end_date: endDate,
                ...(filterTipe && { tipe: filterTipe }),
                ...(filterProduk && { produk_id: filterProduk }),
            });

            const response = await fetch(`${url}?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                Swal.fire('Error', 'Gagal mengunduh berkas laporan', 'error');
                return;
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);

            Swal.fire({ title: 'Berhasil!', text: 'File berhasil diunduh.', icon: 'success', timer: 1500, showConfirmButton: false });
        } catch (error) {
            Swal.fire('Error', 'Gagal mengunduh berkas laporan', 'error');
        }
    };

    return (
        <div className="space-y-4 p-2 sm:p-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Laporan Stok</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Laporan transaksi berdasarkan periode</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => downloadFile('/api/stok/export/pdf', `laporan-stok-${startDate}-${endDate}.pdf`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                        <FileText className="w-3.5 h-3.5" /> PDF
                    </button>
                    <button
                        onClick={() => downloadFile('/api/stok/export/excel', `laporan-stok-${startDate}-${endDate}.xlsx`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" /> Excel
                    </button>
                </div>
            </div>

            {/* Filter Container */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <Filter className="w-4 h-4 text-gray-400" /> Filter Periode
                    </h3>
                    <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 transition-colors"
                    >
                        <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    <div>
                        <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">Dari Tanggal</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">Sampai Tanggal</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">Tipe Transaksi</label>
                        <select
                            value={filterTipe}
                            onChange={(e) => setFilterTipe(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none"
                        >
                            <option value="">Semua Tipe</option>
                            <option value="masuk">Masuk</option>
                            <option value="keluar">Keluar</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">Produk</label>
                        <select
                            value={filterProduk}
                            onChange={(e) => setFilterProduk(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none"
                        >
                            <option value="">Semua Produk</option>
                            {produkList.map((p) => (
                                <option key={p.id} value={p.id}>{p.nama_produk}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Ringkasan Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                    <p className="text-[11px] text-gray-500 uppercase">Total Transaksi</p>
                    <p className="text-lg font-bold font-mono text-gray-900 dark:text-white mt-0.5">{summary.total_transaksi}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                    <p className="text-[11px] text-gray-500 uppercase">Total Masuk</p>
                    <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">+{summary.total_masuk}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                    <p className="text-[11px] text-gray-500 uppercase">Total Keluar</p>
                    <p className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">-{summary.total_keluar}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                    <p className="text-[11px] text-gray-500 uppercase">Selisih Netto</p>
                    <p className={`text-lg font-bold font-mono mt-0.5 ${summary.selisih >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {summary.selisih >= 0 ? '+' : ''}{summary.selisih}
                    </p>
                </div>
            </div>

            {/* Content Table & Mobile Cards */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs">
                    <span className="font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">Detail Laporan</span>
                    <span className="text-gray-400 font-mono">
                        {startDate ? shortDateFormatter.format(new Date(startDate)) : '-'} — {endDate ? shortDateFormatter.format(new Date(endDate)) : '-'}
                    </span>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-xs text-gray-500">Memuat laporan...</div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-500">Tidak ada transaksi dalam periode ini.</div>
                ) : (
                    <>
                        {/* Desktop View (Tabel) */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3">No</th>
                                        <th className="px-4 py-3">Produk</th>
                                        <th className="px-4 py-3">Tipe</th>
                                        <th className="px-4 py-3 text-center">Jumlah</th>
                                        <th className="px-4 py-3">Batch</th>
                                        <th className="px-4 py-3">User</th>
                                        <th className="px-4 py-3">Tanggal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {transactions.map((item, index) => {
                                        const isMasuk = item.tipe === 'masuk';
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold text-gray-900 dark:text-white">{item.produk?.nama_produk || '-'}</div>
                                                    <div className="text-[11px] text-gray-400">SKU: {item.produk?.sku || '-'}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${isMasuk ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                                        {isMasuk ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                                        {isMasuk ? 'Masuk' : 'Keluar'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center font-bold font-mono">{item.jumlah}</td>
                                                <td className="px-4 py-3 text-gray-500">{item.batch ? `Batch #${item.batch.id}` : '-'}</td>
                                                <td className="px-4 py-3 text-gray-500">{item.user?.name || '-'}</td>
                                                <td className="px-4 py-3 text-gray-400">
                                                    {item.tanggal ? dateTimeFormatter.format(new Date(item.tanggal)) : '-'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View (Card Stack) */}
                        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                            {transactions.map((item) => {
                                const isMasuk = item.tipe === 'masuk';
                                return (
                                    <div key={item.id} className="p-3 space-y-1.5 text-xs">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{item.produk?.nama_produk || '-'}</p>
                                                <p className="text-[11px] text-gray-400">SKU: {item.produk?.sku || '-'}</p>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${isMasuk ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                                {isMasuk ? '+' : '-'}{item.jumlah} pcs
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-700/50">
                                            <span>{item.user?.name || 'Sistem'} • {item.batch ? `Batch #${item.batch.id}` : 'Reguler'}</span>
                                            <span>{item.tanggal ? dateTimeFormatter.format(new Date(item.tanggal)) : '-'}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}