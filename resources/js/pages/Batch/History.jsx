import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, User, Calendar, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';

export default function BatchRiwayat() {
    const { id } = useParams();
    const [batch, setBatch] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, [id]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/batch/${id}/history`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            const result = await response.json();

            if (response.ok) {
                setBatch(result.data.batch);
                setHistory(result.data.history);
            } else {
                Swal.fire('Error', result.message || 'Gagal memuat data', 'error');
            }
        } catch (error) {
            console.error('Error fetching history:', error);
            Swal.fire('Error', 'Gagal memuat riwayat', 'error');
        } finally {
            setLoading(false);
        }
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat riwayat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/batch" className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Riwayat Batch
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Detail transaksi untuk batch ini
                    </p>
                </div>
                <button
                    onClick={fetchHistory}
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ml-auto"
                    title="Refresh"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Info Batch */}
            {batch && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Produk</p>
                            <p className="font-medium text-gray-900 dark:text-white">{batch.produk?.nama_produk}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">QR Code</p>
                            <p className="font-mono text-xs text-gray-600 dark:text-gray-400 truncate">{batch.qr_code}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Stok Saat Ini</p>
                            <p className="font-bold text-gray-900 dark:text-white">{batch.stok_saat_ini}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Lokasi</p>
                            <p className="text-gray-700 dark:text-gray-300">{batch.lokasi_rak || '-'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* History Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {history.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Belum ada transaksi untuk batch ini</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">#</th>
                                    <th className="px-6 py-3 font-semibold">Tipe</th>
                                    <th className="px-6 py-3 font-semibold text-center">Jumlah</th>
                                    <th className="px-6 py-3 font-semibold">User</th>
                                    <th className="px-6 py-3 font-semibold">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {history.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                                item.tipe === 'masuk'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                                {item.tipe === 'masuk' ? (
                                                    <ArrowUp className="w-3 h-3" />
                                                ) : (
                                                    <ArrowDown className="w-3 h-3" />
                                                )}
                                                {item.tipe === 'masuk' ? 'Masuk' : 'Keluar'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-semibold text-gray-900 dark:text-white">
                                            {item.jumlah}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            {item.user?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                                            {formatDate(item.tanggal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}