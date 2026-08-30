import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    ChevronLeft,
    ChevronRight,
    Package,
    ArrowUp,
    ArrowDown,
    RefreshCw,
    Filter,
    X,
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function StokIndex() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterTipe, setFilterTipe] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const perPage = 10;

    useEffect(() => {
        fetchTransactions();
    }, [currentPage, filterTipe]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: currentPage,
                per_page: perPage,
                ...(filterTipe && { tipe: filterTipe }),
            });

            const response = await fetch(`/api/stok/history?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            const result = await response.json();

            if (response.ok) {
                const data = result.data || result;
                setTransactions(data.data || []);
                setTotalPages(data.last_page || 1);
                setTotalItems(data.total || 0);
                setLastUpdated(new Date());
            } else {
                Swal.fire('Error', result.message || 'Gagal memuat data', 'error');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            Swal.fire('Error', 'Gagal memuat riwayat stok', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchTransactions();
        Swal.fire({
            title: 'Diperbarui!',
            text: 'Data riwayat stok telah diperbarui.',
            icon: 'success',
            timer: 1000,
            showConfirmButton: false,
        });
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

    const formatDate = (date) => {
        if (!date) return '-';
        try {
            const d = new Date(date);
            return d.toLocaleString('id-ID', {
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

    const formatTimeShort = (date) => {
        if (!date) return '-';
        try {
            const d = new Date(date);
            return d.toLocaleString('id-ID', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return date;
        }
    };

    const filteredData = transactions.filter(item =>
        item.produk?.nama_produk?.toLowerCase().includes(search.toLowerCase()) ||
        item.produk?.sku?.toLowerCase().includes(search.toLowerCase()) ||
        item.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.catatan?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading && currentPage === 1) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat riwayat stok...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
            {/* === HEADER === */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        Manajemen Stok
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                        Riwayat transaksi stok masuk dan keluar
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <Link
                        to="/stok/masuk"
                        className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden xs:inline">Stok Masuk</span>
                        <span className="xs:hidden">Masuk</span>
                    </Link>
                    <Link
                        to="/stok/keluar"
                        className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden xs:inline">Stok Keluar</span>
                        <span className="xs:hidden">Keluar</span>
                    </Link>
                </div>
            </div>

            {/* === FILTERS === */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari produk, SKU, user..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                </div>

                <div className="hidden sm:flex gap-2">
                    <select
                        value={filterTipe}
                        onChange={(e) => setFilterTipe(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    >
                        <option value="">Semua Tipe</option>
                        <option value="masuk">Masuk</option>
                        <option value="keluar">Keluar</option>
                    </select>
                    <button
                        onClick={() => {
                            setFilterTipe('');
                            setSearch('');
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Reset
                    </button>
                </div>

                <button
                    onClick={() => setShowMobileFilter(!showMobileFilter)}
                    className="sm:hidden flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                    <Filter className="w-4 h-4" />
                    Filter
                    {filterTipe && (
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                </button>
            </div>

            {/* Mobile Filter Panel */}
            {showMobileFilter && (
                <div className="sm:hidden bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Filter</span>
                        <button
                            onClick={() => setShowMobileFilter(false)}
                            className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <select
                        value={filterTipe}
                        onChange={(e) => setFilterTipe(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    >
                        <option value="">Semua Tipe</option>
                        <option value="masuk">Masuk</option>
                        <option value="keluar">Keluar</option>
                    </select>
                    <button
                        onClick={() => {
                            setFilterTipe('');
                            setSearch('');
                            setShowMobileFilter(false);
                        }}
                        className="w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Reset Filter
                    </button>
                </div>
            )}

            {/* === TABLE / MOBILE CARDS === */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {filteredData.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                        <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                            {search || filterTipe ? 'Tidak ada transaksi yang sesuai' : 'Belum ada transaksi stok'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
                            {search || filterTipe ? 'Coba ubah filter pencarian' : 'Mulai dengan menambah stok produk'}
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
                                        <th className="px-4 py-3 font-semibold">Tipe</th>
                                        <th className="px-4 py-3 font-semibold text-center">Jumlah</th>
                                        <th className="px-4 py-3 font-semibold">Stok</th>
                                        <th className="px-4 py-3 font-semibold">User</th>
                                        <th className="px-4 py-3 font-semibold">Tanggal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredData.map((item, index) => {
                                        const badge = getTipeBadge(item.tipe);
                                        const Icon = badge.icon;
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
                                                <td className="px-4 py-3">
                                                    <div className="text-sm">
                                                        <span className="text-gray-500 dark:text-gray-400">{item.stok_sebelum}</span>
                                                        <span className="mx-1 text-gray-400">→</span>
                                                        <span className="font-medium text-gray-900 dark:text-white">{item.stok_sesudah}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
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

                        {/* MOBILE CARDS */}
                        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredData.map((item, index) => {
                                const badge = getTipeBadge(item.tipe);
                                const Icon = badge.icon;
                                return (
                                    <div key={item.id} className="p-4 space-y-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 dark:text-white truncate">
                                                    {item.produk?.nama_produk || '-'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    SKU: {item.produk?.sku || '-'}
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.color} flex-shrink-0 ml-2`}>
                                                <Icon className="w-3 h-3" />
                                                {badge.label}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Jumlah</span>
                                                <p className="font-semibold text-gray-900 dark:text-white">{item.jumlah}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Stok</span>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {item.stok_sebelum} → {item.stok_sesudah}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">User</span>
                                                <p className="text-gray-700 dark:text-gray-300 truncate">{item.user?.name || '-'}</p>
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-400 dark:text-gray-500">
                                            {formatTimeShort(item.tanggal)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 gap-2 sm:gap-3">
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                                    {filteredData.length} dari {totalItems} transaksi
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
                                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Info Footer */}
            <div className="text-center text-xs text-gray-400 dark:text-gray-500">
                <p>Total: {totalItems} transaksi • Update: {lastUpdated ? formatDate(lastUpdated) : '-'}</p>
            </div>
        </div>
    );
}