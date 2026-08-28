import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { produkAPI } from '../../lib/api';

export default function ProdukHome() {
    const navigate = useNavigate();
    const [produk, setProduk] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const perPage = 10;

    useEffect(() => {
        fetchProduk();
    }, [currentPage, search]);

    const fetchProduk = async () => {
        setLoading(true);
        try {
            const response = await produkAPI.getAll();
            const data = response.data.data || response.data;
            setProduk(Array.isArray(data) ? data : []);
            setTotalPages(Math.ceil((Array.isArray(data) ? data.length : 0) / perPage));
        } catch (error) {
            console.error('Error mengumpulkan data produk:', error);
            Swal.fire('Error', 'Gagal memuat data produk', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id, nama) => {
        Swal.fire({
            title: 'Kamu yakin ingin menghapusnya?',
            text: `Produk "${nama}" akan dihapus secara permanen loh.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await produkAPI.delete(id);
                    Swal.fire('Terhapus!', `Produk "${nama}" berhasil dihapus.`, 'success');
                    fetchProduk();
                } catch (error) {
                    console.error('Error deleting produk:', error);
                    Swal.fire('Error', 'Gagal menghapus produk', 'error');
                }
            }
        });
    };

    const getStatusStok = (stok, stokMinimal) => {
        if (stok <= 0) {
            return { label: 'Habis', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
        } else if (stok <= stokMinimal) {
            return { label: 'Menipis', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
        }
        return { label: 'Aman', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
    };

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(angka);
    };

    const filteredData = produk.filter(item =>
        item.nama_produk?.toLowerCase().includes(search.toLowerCase()) ||
        item.sku?.toLowerCase().includes(search.toLowerCase())
    );

    const paginatedData = filteredData.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat data produk...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Manajemen Produk
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Kelola data produk inventory
                    </p>
                </div>
                <Link
                    to="/Produk/Create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Tambah Produk
                </Link>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Cari produk (nama atau SKU)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {paginatedData.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">
                            {search ? 'Tidak ada produk yang sesuai dengan pencarian' : 'Belum ada data produk'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold">#</th>
                                        <th className="px-6 py-3 font-semibold">Produk</th>
                                        <th className="px-6 py-3 font-semibold hidden md:table-cell">Kategori</th>
                                        <th className="px-6 py-3 font-semibold hidden lg:table-cell">Harga</th>
                                        <th className="px-6 py-3 font-semibold text-center">Stok</th>
                                        <th className="px-6 py-3 font-semibold text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {paginatedData.map((item, index) => {
                                        const status = getStatusStok(item.stok, item.stok_minimal || 5);
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                    {(currentPage - 1) * perPage + index + 1}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {item.nama_produk}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        SKU: {item.sku}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 hidden md:table-cell">
                                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                                        {item.kategori?.nama_kategori || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 hidden lg:table-cell font-medium text-gray-900 dark:text-white">
                                                    {formatRupiah(item.harga)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                            {status.label}
                                                        </span>
                                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                            {item.stok}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => navigate(`/Produk/edit/${item.id}`)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id, item.nama_produk)}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Menampilkan {paginatedData.length} dari {filteredData.length} data
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
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