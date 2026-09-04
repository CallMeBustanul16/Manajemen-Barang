import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Download, 
    Package,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    QrCode
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function BatchHome() {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const perPage = 10;

    useEffect(() => {
        fetchBatches();
    }, [currentPage]);

    const fetchBatches = async () => {
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
                setBatches(Array.isArray(data) ? data : []);
                setTotalItems(data.length || 0);
                setTotalPages(Math.ceil((data.length || 0) / perPage));
            } else {
                Swal.fire('Error', result.message || 'Gagal memuat data batch', 'error');
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
            Swal.fire('Error', 'Gagal memuat data batch', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id, nama) => {
        Swal.fire({
            title: 'Yakin ingin menghapus?',
            text: `Batch produk "${nama}" akan dihapus secara permanen.`,
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

                    if (response.ok) {
                        Swal.fire('Terhapus!', `Batch berhasil dihapus.`, 'success');
                        fetchBatches();
                    } else {
                        const data = await response.json();
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
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
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
            console.error('Error downloading QR:', error);
            Swal.fire('Error', 'Gagal download QR', 'error');
        }
    };

    const filteredData = batches.filter(item =>
        item.produk?.nama_produk?.toLowerCase().includes(search.toLowerCase()) ||
        item.qr_code?.toLowerCase().includes(search.toLowerCase()) ||
        item.lokasi_rak?.toLowerCase().includes(search.toLowerCase())
    );

    const paginatedData = filteredData.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    );

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
                        onClick={fetchBatches}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
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

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Cari batch (produk, QR Code, lokasi)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {paginatedData.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                        <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                            {search ? 'Tidak ada batch yang sesuai' : 'Belum ada data batch'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
                            {search ? 'Coba ubah filter pencarian' : 'Mulai dengan menambah batch baru'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">#</th>
                                        <th className="px-4 py-3 font-semibold">Produk</th>
                                        <th className="px-4 py-3 font-semibold text-center">Stok</th>
                                        <th className="px-4 py-3 font-semibold hidden md:table-cell">Lokasi</th>
                                        <th className="px-4 py-3 font-semibold hidden lg:table-cell">QR Code</th>
                                        <th className="px-4 py-3 font-semibold text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {paginatedData.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                                {(currentPage - 1) * perPage + index + 1}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {item.produk?.nama_produk || '-'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Masuk: {item.tanggal_masuk}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        item.stok_saat_ini > 0 
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                        {item.stok_saat_ini}
                                                    </span>
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                                        / {item.jumlah_awal}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell text-gray-600 dark:text-gray-400">
                                                {item.lokasi_rak || '-'}
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell">
                                                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                                    {item.qr_code?.substring(0, 20)}...
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1 sm:gap-2">
                                                    <button
                                                        onClick={() => handleDownloadQr(item.id)}
                                                        className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
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
                                    ))}
                                </tbody>
                            </table>
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
                                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
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