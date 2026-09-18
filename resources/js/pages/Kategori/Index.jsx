import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import { kategoriAPI } from '../../lib/api';

export default function KategoriHome() {
    const navigate = useNavigate();
    const [kategori, setKategori] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 10;

    // Fetch API HANYA 1x saat komponen pertama kali dimuat
    useEffect(() => {
        fetchKategori();
    }, []);

    // Reset pagination ke halaman 1 setiap kali mengetik pencarian
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const fetchKategori = async () => {
        setLoading(true);
        try {
            const response = await kategoriAPI.getAll();
            const data = response.data.data || response.data;
            setKategori(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching kategori:', error);
            Swal.fire('Error', 'Gagal memuat data kategori', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id, nama) => {
        Swal.fire({
            title: 'Yakin ingin menghapus?',
            text: `Kategori "${nama}" akan dihapus secara permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await kategoriAPI.delete(id);
                    Swal.fire('Terhapus!', `Kategori "${nama}" berhasil dihapus.`, 'success');
                    fetchKategori();
                } catch (error) {
                    console.error('Error deleting kategori:', error);
                    Swal.fire('Error', 'Gagal menghapus kategori', 'error');
                }
            }
        });
    };

    // Pemanfaatan useMemo agar pencarian & pagination responsif tanpa Re-Fetch API
    const filteredData = useMemo(() => {
        return kategori.filter(item =>
            item.nama_kategori?.toLowerCase().includes(search.toLowerCase()) ||
            item.slug?.toLowerCase().includes(search.toLowerCase())
        );
    }, [kategori, search]);

    const totalPages = useMemo(() => {
        return Math.ceil(filteredData.length / perPage) || 1;
    }, [filteredData]);

    const paginatedData = useMemo(() => {
        return filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);
    }, [filteredData, currentPage]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-sm text-gray-500">
                Memuat data kategori...
            </div>
        );
    }

    return (
        <div className="space-y-4 p-2 sm:p-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Manajemen Kategori</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Kelola data kategori produk</p>
                </div>
                <Link
                    to="/Kategori/Create"
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" /> Tambah Kategori
                </Link>
            </div>

            {/* Input Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Cari kategori..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-red-500 outline-none"
                />
            </div>

            {/* Content Container */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {paginatedData.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-500">
                        {search ? 'Tidak ada kategori yang sesuai' : 'Belum ada data kategori'}
                    </div>
                ) : (
                    <>
                        {/* Tampilan Desktop (Tabel) */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3">No</th>
                                        <th className="px-4 py-3">Nama Kategori</th>
                                        <th className="px-4 py-3">Slug</th>
                                        <th className="px-4 py-3">Deskripsi</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {paginatedData.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                            <td className="px-4 py-3 text-gray-500">{(currentPage - 1) * perPage + index + 1}</td>
                                            <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{item.nama_kategori}</td>
                                            <td className="px-4 py-3 text-gray-500">
                                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[11px]">
                                                    {item.slug}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{item.deskripsi || '-'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={() => navigate(`/Kategori/Edit/${item.id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id, item.nama_kategori)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Tampilan Mobile (Card Stack) */}
                        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedData.map((item) => (
                                <div key={item.id} className="p-3 space-y-1.5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-xs text-gray-900 dark:text-white">{item.nama_kategori}</p>
                                            <p className="text-[11px] text-gray-400">/{item.slug}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => navigate(`/Kategori/Edit/${item.id}`)} className="p-1 text-blue-600">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(item.id, item.nama_kategori)} className="p-1 text-red-600">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {item.deskripsi && (
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 pt-1 border-t border-gray-100 dark:border-gray-700/50">
                                            {item.deskripsi}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-xs">
                                <span className="text-gray-500">Hal {currentPage} dari {totalPages}</span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-1.5 border rounded disabled:opacity-40"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-1.5 border rounded disabled:opacity-40"
                                    >
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