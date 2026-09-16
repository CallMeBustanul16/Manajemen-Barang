import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Calendar, 
    Download, 
    RefreshCw,
    FileText,
    FileText as FileTextIcon,
    TrendingUp,
    TrendingDown,
    Package,
    ArrowUp,
    ArrowDown,
    Filter,
    X,
    RotateCcw
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function HomeLaporan() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showFilter, setShowFilter] = useState(false);

    // State Filter
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterTipe, setFilterTipe] = useState('');
    const [filterProduk, setFilterProduk] = useState('');
    const [produkList, setProdukList] = useState([]);

    // State Ringkasan
    const [summary, setSummary] = useState({
        total_masuk: 0,
        total_keluar: 0,
        total_transaksi: 0,
        selisih: 0,
    });

    useEffect(() => {
        fetchProdukList();
        // Default: 30 hari terakhir
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        setEndDate(today.toISOString().split('T')[0]);
        setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            fetchLaporan();
        }
    }, [startDate, endDate, filterTipe, filterProduk]);

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

    const fetchLaporan = async () => {
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
                const data = result.data?.data || [];
                setTransactions(data);

                // Hitung ringkasan
                const masuk = data.filter(t => t.tipe === 'masuk').reduce((sum, t) => sum + t.jumlah, 0);
                const keluar = data.filter(t => t.tipe === 'keluar').reduce((sum, t) => sum + t.jumlah, 0);

                setSummary({
                    total_masuk: masuk,
                    total_keluar: keluar,
                    total_transaksi: data.length,
                    selisih: masuk - keluar,
                });
            } else {
                Swal.fire('Error', result.message || 'Gagal memuat laporan', 'error');
            }
        } catch (error) {
            console.error('Error fetching laporan:', error);
            Swal.fire('Error', 'Gagal memuat laporan', 'error');
        } finally {
            setLoading(false);
        }
    };

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
        setShowFilter(false);
    };

    const handleExport = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                start_date: startDate,
                end_date: endDate,
                ...(filterTipe && { tipe: filterTipe }),
                ...(filterProduk && { produk_id: filterProduk }),
            });

            const response = await fetch(`/api/stok/export/excel?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                Swal.fire('Error', 'Gagal export laporan', 'error');
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `laporan-stok-${startDate}-${endDate}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            Swal.fire({
                title: 'Berhasil!',
                text: 'File Excel berhasil diunduh.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error('Export error:', error);
            Swal.fire('Error', 'Gagal export laporan', 'error');
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        try {
            return new Date(date).toLocaleString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return date;
        }
    };

    const formatDateShort = (date) => {
        if (!date) return '-';
        try {
            return new Date(date).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return date;
        }
    };

    const getTipeBadge = (tipe) => {
        if (tipe === 'masuk') {
            return {
                label: 'Masuk',
                color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                icon: ArrowUp,
            };
        }
        return {
            label: 'Keluar',
            color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            icon: ArrowDown,
        };
    };

    const handleExportPdf = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                start_date: startDate,
                end_date: endDate,
                ...(filterTipe && { tipe: filterTipe }),
                ...(filterProduk && { produk_id: filterProduk }),
            });

            const response = await fetch(`/api/stok/export/pdf?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                Swal.fire('Error', 'Gagal export PDF', 'error');
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `laporan-stok-${startDate}-${endDate}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            Swal.fire({
                title: 'Berhasil!',
                text: 'File PDF berhasil diunduh.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error('Export error:', error);
            Swal.fire('Error', 'Gagal export PDF', 'error');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Laporan Stok
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Laporan transaksi berdasarkan periode
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleExportPdf}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        <FileTextIcon className="w-4 h-4" />
                        Export PDF
                    </button>
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export Excel
                    </button>
                </div>
            </div>

            {/* Filter Periode */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-500" />
                        Filter Periode
                    </h3>
                    <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Dari Tanggal
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Sampai Tanggal
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Tipe */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tipe Transaksi
                        </label>
                        <select
                            value={filterTipe}
                            onChange={(e) => setFilterTipe(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                        >
                            <option value="">Semua Tipe</option>
                            <option value="masuk">Masuk</option>
                            <option value="keluar">Keluar</option>
                        </select>
                    </div>

                    {/* Produk */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Produk
                        </label>
                        <select
                            value={filterProduk}
                            onChange={(e) => setFilterProduk(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                        >
                            <option value="">Semua Produk</option>
                            {produkList.map((p) => (
                                <option key={p.id} value={p.id}>{p.nama_produk}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Ringkasan */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Transaksi */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                            <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Transaksi</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{summary.total_transaksi}</p>
                        </div>
                    </div>
                </div>

                {/* Total Masuk */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Masuk</p>
                            <p className="text-xl font-bold text-green-600 dark:text-green-400">+{summary.total_masuk}</p>
                        </div>
                    </div>
                </div>

                {/* Total Keluar */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Keluar</p>
                            <p className="text-xl font-bold text-red-600 dark:text-red-400">-{summary.total_keluar}</p>
                        </div>
                    </div>
                </div>

                {/* Selisih */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${summary.selisih >= 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
                            <Package className={`w-5 h-5 ${summary.selisih >= 0 ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Selisih</p>
                            <p className={`text-xl font-bold ${summary.selisih >= 0 ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                {summary.selisih >= 0 ? '+' : ''}{summary.selisih}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabel Transaksi */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Detail Transaksi
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDateShort(startDate)} - {formatDateShort(endDate)}
                    </span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Tidak ada transaksi dalam periode ini</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">#</th>
                                    <th className="px-4 py-3 font-semibold">Produk</th>
                                    <th className="px-4 py-3 font-semibold">Tipe</th>
                                    <th className="px-4 py-3 font-semibold text-center">Jumlah</th>
                                    <th className="px-4 py-3 font-semibold hidden md:table-cell">Batch</th>
                                    <th className="px-4 py-3 font-semibold hidden lg:table-cell">User</th>
                                    <th className="px-4 py-3 font-semibold">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {transactions.map((item, index) => {
                                    const badge = getTipeBadge(item.tipe);
                                    const Icon = badge.icon;
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {item.produk?.nama_produk || '-'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    SKU: {item.produk?.sku || '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                                                    <Icon className="w-3 h-3" />
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                                                {item.jumlah}
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell text-gray-600 dark:text-gray-400">
                                                {item.batch ? `Batch #${item.batch.id}` : '-'}
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell text-gray-600 dark:text-gray-400">
                                                {item.user?.name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                                                {formatDate(item.tanggal)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}