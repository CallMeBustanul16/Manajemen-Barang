import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
    Plus, Search, Edit, Trash2, Download, Package,
    ChevronLeft, ChevronRight, RefreshCw, History, Eye
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function BatchHome() {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [filterProduk, setFilterProduk] = useState('');
    const perPage = 10;

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

    useEffect(() => {
        fetchBatches();
    }, [fetchBatches]);

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
    const filteredData = useMemo(() => {
        return batches.filter(item => {
            const matchSearch = item.produk?.nama_produk?.toLowerCase().includes(search.toLowerCase()) ||
                item.qr_code?.toLowerCase().includes(search.toLowerCase()) ||
                item.lokasi_rak?.toLowerCase().includes(search.toLowerCase());
            const matchProduk = filterProduk ? item.produk?.id === parseInt(filterProduk) : true;
            return matchSearch && matchProduk;
        });
    }, [batches, search, filterProduk]);

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

    if (loading && currentPage === 1) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-xs text-gray-500">
                Memuat data batch...
            </div>
        );
    }

    return (
        <div className="space-y-4 p-2 sm:p-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Manajemen Batch</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Kelola batch/kardus produk dengan QR Code</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <button 
                        onClick={fetchBatches} 
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">Export Excel</span>
                        <span className="xs:hidden">Export</span>
                    </button>
                    <Link 
                        to="/batch/create" 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" /> <span>Tambah Batch</span>
                    </Link>
                </div>
            </div>

            {/* Controls Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari batch (produk, QR Code, lokasi)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-red-500 outline-none"
                    />
                </div>

                <div className="flex gap-2">
                    <select
                        value={filterProduk}
                        onChange={(e) => setFilterProduk(e.target.value)}
                        className="px-3 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-red-500 outline-none"
                    >
                        <option value="">Semua Produk</option>
                        {produkOptions.map(p => (
                            <option key={p.id} value={p.id}>{p.nama_produk}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => { setFilterProduk(''); setSearch(''); }}
                        className="px-3 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Data Output */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {filteredData.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-500">
                        <Package className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p>{search ? 'Tidak ada batch yang sesuai' : 'Belum ada data batch'}</p>
                    </div>
                ) : (
                    <>
                        {/* Tampilan Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3">No</th>
                                        <th className="px-4 py-3">Produk</th>
                                        <th className="px-4 py-3 text-center">Stok</th>
                                        <th className="px-4 py-3">Lokasi</th>
                                        <th className="px-4 py-3">QR Code</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredData.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                            <td className="px-4 py-3 text-gray-500">{(currentPage - 1) * perPage + index + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-gray-900 dark:text-white">{item.produk?.nama_produk || '-'}</div>
                                                <div className="text-[11px] text-gray-400">Masuk: {item.tanggal_masuk}</div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${item.stok_saat_ini > 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                                    {item.stok_saat_ini} / {item.jumlah_awal}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.lokasi_rak || '-'}</td>
                                            <td className="px-4 py-3 font-mono text-[11px] text-gray-400">{item.qr_code?.substring(0, 16)}...</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Link to={`/batch/detail/${item.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded" title="Detail"><Eye className="w-4 h-4" /></Link>
                                                    <Link to={`/batch/history/${item.id}`} className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded" title="Riwayat"><History className="w-4 h-4" /></Link>
                                                    <button onClick={() => handleDownloadQr(item.id)} className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded" title="Download QR"><Download className="w-4 h-4" /></button>
                                                    <Link to={`/batch/edit/${item.id}`} className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded" title="Edit"><Edit className="w-4 h-4" /></Link>
                                                    <button onClick={() => handleDelete(item.id, item.produk?.nama_produk)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Tampilan Mobile Card Stack (Kompatibel Layar HP) */}
                        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredData.map((item) => (
                                <div key={item.id} className="p-3 space-y-2 text-xs">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">{item.produk?.nama_produk || '-'}</p>
                                            <p className="text-[11px] text-gray-400">Rak: {item.lokasi_rak || '-'}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${item.stok_saat_ini > 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                            Stok: {item.stok_saat_ini}/{item.jumlah_awal}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700/50">
                                        <span className="text-[10px] text-gray-400">{item.tanggal_masuk}</span>
                                        <div className="flex items-center gap-1">
                                            <Link to={`/batch/detail/${item.id}`} className="p-1 text-blue-600"><Eye className="w-4 h-4" /></Link>
                                            <Link to={`/batch/history/${item.id}`} className="p-1 text-emerald-600"><History className="w-4 h-4" /></Link>
                                            <button onClick={() => handleDownloadQr(item.id)} className="p-1 text-amber-600"><Download className="w-4 h-4" /></button>
                                            <Link to={`/batch/edit/${item.id}`} className="p-1 text-indigo-600"><Edit className="w-4 h-4" /></Link>
                                            <button onClick={() => handleDelete(item.id, item.produk?.nama_produk)} className="p-1 text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-xs">
                                <span className="text-gray-500">Hal {currentPage} dari {totalPages} ({totalItems} total)</span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 border rounded disabled:opacity-40">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 border rounded disabled:opacity-40">
                                        <ChevronRight className="w-4 h-4" />
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