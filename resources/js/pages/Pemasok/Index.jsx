import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, Phone, Mail, MapPin } from 'lucide-react';
import Swal from 'sweetalert2';
import { pemasokAPI } from '../../lib/api';

export default function PemasokHome() {
    const navigate = useNavigate();
    const [pemasok, setPemasok] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 10;

    // Fetch API HANYA 1x saat komponen pertama kali dimuat
    useEffect(() => {
        fetchPemasok();
    }, []);

    // Reset halaman ke 1 setiap kali mengetik pencarian
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const fetchPemasok = async () => {
        setLoading(true);
        try {
            const response = await pemasokAPI.getAll();
            const data = response.data.data || response.data;
            setPemasok(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error saat menangkap pemasok:', error);
            Swal.fire('Error', 'Gagal memuat data pemasok', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id, nama) => {
        Swal.fire({
            title: 'Kamu yakin ingin menghapus?',
            text: `Pemasok "${nama}" akan dihapus secara permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await pemasokAPI.delete(id);
                    Swal.fire('Terhapus!', `Pemasok "${nama}" berhasil dihapus.`, 'success');
                    fetchPemasok();
                } catch (error) {
                    console.error('Error deleting pemasok:', error);
                    Swal.fire('Error', 'Gagal menghapus pemasok', 'error');
                }
            }
        });
    };

    // Filter dinamis tanpa membuat ulang array setiap render
    const filteredData = useMemo(() => {
        return pemasok.filter(item =>
            item.nama_pemasok?.toLowerCase().includes(search.toLowerCase()) ||
            item.email?.toLowerCase().includes(search.toLowerCase()) ||
            item.telepon?.toLowerCase().includes(search.toLowerCase())
        );
    }, [pemasok, search]);

    // Kalkulasi total halaman otomatis menyesuaikan hasil filter
    const totalPages = useMemo(() => {
        return Math.ceil(filteredData.length / perPage) || 1;
    }, [filteredData]);

    const paginatedData = useMemo(() => {
        return filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);
    }, [filteredData, currentPage]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-sm text-gray-500">
                Memuat data pemasok...
            </div>
        );
    }

    return (
        <div className="space-y-4 p-2 sm:p-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Manajemen Pemasok</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Kelola data pemasok produk</p>
                </div>
                <Link
                    to="/Pemasok/Create"
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" /> Tambah Pemasok
                </Link>
            </div>

            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Cari pemasok (nama, email, telepon)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-red-500 outline-none"
                />
            </div>

            {/* Container List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {paginatedData.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-500">
                        {search ? 'Tidak ada pemasok yang sesuai' : 'Belum ada data pemasok'}
                    </div>
                ) : (
                    <>
                        {/* Tampilan Desktop (Tabel Standar) */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3">No</th>
                                        <th className="px-4 py-3">Nama Pemasok</th>
                                        <th className="px-4 py-3">Kontak</th>
                                        <th className="px-4 py-3">Alamat</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {paginatedData.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                            <td className="px-4 py-3 text-gray-500">{(currentPage - 1) * perPage + index + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-gray-900 dark:text-white">{item.nama_pemasok}</div>
                                                {item.email && (
                                                    <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                                                        <Mail className="w-3 h-3" /> {item.email}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item.telepon ? (
                                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                                                        <Phone className="w-3.5 h-3.5" /> {item.telepon}
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                                                {item.alamat ? (
                                                    <div className="flex items-center gap-1 truncate">
                                                        <MapPin className="w-3.5 h-3.5 shrink-0" /> {item.alamat}
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={() => navigate(`/Pemasok/Edit/${item.id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id, item.nama_pemasok)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Tampilan Mobile (Card Stack - Nyaman di Layar HP) */}
                        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedData.map((item) => (
                                <div key={item.id} className="p-3 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-xs text-gray-900 dark:text-white">{item.nama_pemasok}</p>
                                            {item.email && (
                                                <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                    <Mail className="w-3 h-3" /> {item.email}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => navigate(`/Pemasok/Edit/${item.id}`)} className="p-1 text-blue-600">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(item.id, item.nama_pemasok)} className="p-1 text-red-600">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {(item.telepon || item.alamat) && (
                                        <div className="pt-1 border-t border-gray-100 dark:border-gray-700/50 space-y-1 text-[11px] text-gray-500">
                                            {item.telepon && (
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="w-3 h-3 text-gray-400" /> {item.telepon}
                                                </div>
                                            )}
                                            {item.alamat && (
                                                <div className="flex items-start gap-1.5">
                                                    <MapPin className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" /> {item.alamat}
                                                </div>
                                            )}
                                        </div>
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