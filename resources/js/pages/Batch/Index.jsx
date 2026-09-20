import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
    Plus, Search, Edit, Trash2, Download, Package,
    ChevronLeft, ChevronRight, RefreshCw, History, Eye,
    Box, AlertTriangle, CheckCircle, XCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function BatchHome() {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterProduk, setFilterProduk] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const perPage = 10;

    useEffect(() => {
        fetchBatches();
    }, [currentPage]);

    const fetchBatches = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/batch?page=${currentPage}&per_page=${perPage}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            const result = await response.json();

            if (response.ok) {
                const data = result.data || result;
                const items = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
                setBatches(items);
                setTotalItems(data.total || items.length);
                setTotalPages(data.last_page || Math.ceil(items.length / perPage) || 1);
            } else {
                Swal.fire('Error', result.message || 'Gagal memuat data batch', 'error');
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
            Swal.fire('Error', 'Gagal memuat data batch', 'error');
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchBatches();
        setRefreshing(false);
        Swal.fire({
            title: 'Diperbarui!',
            text: 'Data batch telah diperbarui.',
            icon: 'success',
            timer: 1000,
            showConfirmButton: false,
        });
    };

    const handleDelete = (id, nama) => {
        Swal.fire({
            title: 'Yakin ingin menghapus?',
            html: `
                <p>Batch untuk produk <strong>"${nama}"</strong> akan dihapus.</p>
                <p>Isi batch akan <strong>dikembalikan ke stok gudang</strong>.</p>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`/api/batch/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                        },
                    });

                    const data = await response.json();

                    if (response.ok) {
                        Swal.fire({
                            title: 'Terhapus!',
                            text: data.message || 'Batch berhasil dihapus.',
                            icon: 'success',
                        });
                        fetchBatches();
                    } else {
                        Swal.fire('Error', data.message || 'Gagal menghapus batch', 'error');
                    }
                } catch (error) {
                    console.error('Error deleting batch:', error);
                    Swal.fire('Error', 'Gagal menghapus batch', 'error');
                }
            }
        });
    };

    const handleDownloadQr = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/batch/${id}/download-qr`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
        
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `batch-${id}.png`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                const data = await response.json();
                Swal.fire('Error', data.message || 'Gagal download QR', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Gagal download QR', 'error');
        }
    };

    const getBatchStatus = (batch) => {
        const persentase = batch.kapasitas > 0
            ? (batch.stok_saat_ini / batch.kapasitas) * 100
            : 0;

        if (batch.stok_saat_ini <= 0) {
            return {
                label: 'Kosong',
                icon: XCircle,
                color: 'text-red-600 dark:text-red-400',
                bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                barColor: 'bg-red-500',
                persentase: 0,
            };
        } else if (batch.stok_saat_ini >= batch.kapasitas) {
            return {
                label: 'Penuh',
                icon: CheckCircle,
                color: 'text-green-600 dark:text-green-400',
                bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                barColor: 'bg-green-500',
                persentase: 100,
            };
        } else {
            return {
                label: 'Terisi',
                icon: Box,
                color: 'text-blue-600 dark:text-blue-400',
                bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                barColor: 'bg-blue-500',
                persentase: Math.round(persentase),
            };
        }
    };

    const handleExport = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                ...(filterProduk && { produk_id: filterProduk }),
            });
        
            const response = await fetch(`/api/batch/export/excel?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
        
            if (!response.ok) {
                Swal.fire('Error', 'Gagal export data', 'error');
                return;
            }
        
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `batch-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
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
            Swal.fire('Error', 'Gagal export data', 'error');
        }
    };

    // Optimasi Filter List menggunakan useMemo
    const filteredData = batches.filter(item => {
        const matchSearch =
            item.produk?.nama_produk?.toLowerCase().includes(search.toLowerCase()) ||
            item.qr_code?.toLowerCase().includes(search.toLowerCase()) ||
            item.lokasi_rak?.toLowerCase().includes(search.toLowerCase());

        const matchProduk = !filterProduk || item.produk_id === parseInt(filterProduk);

        return matchSearch && matchProduk;
    });

    const paginatedData = filteredData.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    );

    // Cache daftar produk untuk dropdown filter agar tidak di-loop ulang setiap render
    const produkOptions = useMemo(() => {
        const uniqueProduks = [];
        const map = new Map();
        for (const item of batches) {
            if (item.produk && !map.has(item.produk.id)) {
                map.set(item.produk.id, true);
                uniqueProduks.push(item.produk);
            }
        }
        return uniqueProduks;
    }, [batches]);

    // Daftar produk unik dari batch
    const produkUnik = [...new Set(batches.map(b => b.produk?.id))]
        .map(id => batches.find(b => b.produk?.id === id)?.produk)
        .filter(Boolean);

    if (loading && currentPage === 1) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat data batch...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        Manajemen Batch
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                        Kelola batch/kardus produk dengan QR Code
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
                    <Link
                        to="/batch/create"
                        className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden xs:inline">Tambah Batch</span>
                        <span className="xs:hidden">Batch</span>
                    </Link>
                </div>
            </div>

            {/* Filter */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari batch (produk, QR Code, lokasi)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={filterProduk}
                        onChange={(e) => setFilterProduk(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                    >
                        <option value="">Semua Produk</option>
                        {produkUnik.map((produk) => (
                            <option key={produk.id} value={produk.id}>
                                {produk.nama_produk}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => {
                            setFilterProduk('');
                            setSearch('');
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {paginatedData.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                        <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                            {search || filterProduk ? 'Tidak ada batch yang sesuai' : 'Belum ada data batch'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
                            {search || filterProduk ? 'Coba ubah filter pencarian' : 'Mulai dengan menambah batch baru'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* DESKTOP TABLE */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">#</th>
                                        <th className="px-4 py-3 font-semibold">Produk</th>
                                        <th className="px-4 py-3 font-semibold text-center">Status</th>
                                        <th className="px-4 py-3 font-semibold text-center">Isi / Kapasitas</th>
                                        <th className="px-4 py-3 font-semibold hidden lg:table-cell">Lokasi</th>
                                        <th className="px-4 py-3 font-semibold hidden xl:table-cell">QR Code</th>
                                        <th className="px-4 py-3 font-semibold text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {paginatedData.map((item, index) => {
                                        const status = getBatchStatus(item);
                                        const StatusIcon = status.icon;
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                                    {(currentPage - 1) * perPage + index + 1}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {item.produk?.nama_produk || '-'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Batch #{item.id}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bg}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                                {item.stok_saat_ini}/{item.kapasitas}
                                                            </span>
                                                            <span className="text-gray-400">{status.persentase}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full transition-all ${status.barColor}`}
                                                                style={{ width: `${status.persentase}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 hidden lg:table-cell text-gray-600 dark:text-gray-400">
                                                    {item.lokasi_rak || '-'}
                                                </td>
                                                <td className="px-4 py-3 hidden xl:table-cell">
                                                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                                        {item.qr_code?.substring(0, 20)}...
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                                                        <Link
                                                            to={`/batch/detail/${item.id}`}
                                                            className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                            title="Detail"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            to={`/batch/history/${item.id}`}
                                                            className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                            title="Riwayat"
                                                        >
                                                            <History className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDownloadQr(item.id)}
                                                            className="p-1.5 sm:p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                                            title="Download QR"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                        <Link
                                                            to={`/batch/edit/${item.id}`}
                                                            className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(item.id, item.produk?.nama_produk)}
                                                            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE CARDS */}
                        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedData.map((item) => {
                                const status = getBatchStatus(item);
                                const StatusIcon = status.icon;
                                return (
                                    <div key={item.id} className="p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 dark:text-white truncate">
                                                    {item.produk?.nama_produk || '-'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Batch #{item.id} • {item.lokasi_rak || 'Tanpa lokasi'}
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} shrink-0 ml-2`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {status.label}
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500 dark:text-gray-400">Isi / Kapasitas</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {item.stok_saat_ini}/{item.kapasitas}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${status.barColor}`}
                                                    style={{ width: `${status.persentase}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Aksi */}
                                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                            <Link
                                                to={`/batch/detail/${item.id}`}
                                                className="flex-1 py-1.5 text-center text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-medium"
                                            >
                                                Detail
                                            </Link>
                                            <Link
                                                to={`/batch/history/${item.id}`}
                                                className="flex-1 py-1.5 text-center text-xs bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg font-medium"
                                            >
                                                Riwayat
                                            </Link>
                                            <button
                                                onClick={() => handleDownloadQr(item.id)}
                                                className="flex-1 py-1.5 text-center text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg font-medium"
                                            >
                                                QR
                                            </button>
                                            <Link
                                                to={`/batch/edit/${item.id}`}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(item.id, item.produk?.nama_produk)}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 gap-2 sm:gap-3">
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                                    {filteredData.length} dari {totalItems} batch
                                </p>
                                <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-1.5 sm:p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-1.5 sm:p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}