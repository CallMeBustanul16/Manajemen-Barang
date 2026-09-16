import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Package, 
    QrCode, 
    MapPin, 
    Calendar, 
    Download, 
    Edit, 
    Trash2,
    ArrowUp,
    ArrowDown,
    User,
    RefreshCw,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function BatchDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [batch, setBatch] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            // Fetch batch detail
            const batchResponse = await fetch(`/api/batch/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            const batchResult = await batchResponse.json();

            if (!batchResponse.ok) {
                Swal.fire('Error', batchResult.message || 'Gagal memuat data batch', 'error');
                navigate('/batch');
                return;
            }

            setBatch(batchResult.data);

            // Fetch history
            const historyResponse = await fetch(`/api/batch/${id}/history`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            const historyResult = await historyResponse.json();

            if (historyResponse.ok) {
                setHistory(historyResult.data.history || []);
            }
        } catch (error) {
            console.error('Error fetching batch detail:', error);
            Swal.fire('Error', 'Gagal memuat data batch', 'error');
            navigate('/batch');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
        Swal.fire({
            title: 'Diperbarui!',
            text: 'Data batch telah diperbarui.',
            icon: 'success',
            timer: 1000,
            showConfirmButton: false,
        });
    };

    const handleDelete = () => {
        Swal.fire({
            title: 'Yakin ingin menghapus?',
            text: `Batch "${batch?.produk?.nama_produk}" akan dihapus secara permanen.`,
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
                        Swal.fire('Terhapus!', 'Batch berhasil dihapus.', 'success');
                        navigate('/batch');
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

    const handleDownloadQr = () => {
        const token = localStorage.getItem('token');
        window.open(`/api/batch/${id}/download-qr?token=${token}`, '_blank');
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

    const formatDateShort = (date) => {
        if (!date) return '-';
        try {
            const d = new Date(date);
            return d.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
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
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat data batch...</p>
                </div>
            </div>
        );
    }

    if (!batch) {
        return (
            <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Batch tidak ditemukan</p>
                <Link to="/batch" className="mt-4 inline-block text-red-600 hover:text-red-700">
                    ← Kembali ke Daftar Batch
                </Link>
            </div>
        );
    }

    const isLowStock = batch.stok_saat_ini <= (batch.produk?.stok_minimal || 5);
    const isOutOfStock = batch.stok_saat_ini <= 0;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/batch" className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Detail Batch
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            #{batch.id} • {batch.produk?.nama_produk || '-'}
                        </p>
                    </div>
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
                        onClick={handleDownloadQr}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Download QR
                    </button>
                    <Link
                        to={`/batch/edit/${batch.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Hapus
                    </button>
                </div>
            </div>

            {/* Info Batch */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Produk</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {batch.produk?.nama_produk || '-'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">SKU: {batch.produk?.sku || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">QR Code</p>
                        <p className="font-mono text-xs text-gray-600 dark:text-gray-400 break-all">{batch.qr_code}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Lokasi Rak</p>
                        <p className="text-gray-700 dark:text-gray-300">{batch.lokasi_rak || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Stok Saat Ini</p>
                        <div className="flex items-center gap-2">
                            <span className={`text-xl font-bold ${
                                isOutOfStock ? 'text-red-600 dark:text-red-400' :
                                isLowStock ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-green-600 dark:text-green-400'
                            }`}>
                                {batch.stok_saat_ini}
                            </span>
                            {isOutOfStock && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                                    Habis
                                </span>
                            )}
                            {isLowStock && !isOutOfStock && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                                    Menipis
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Stok Awal: {batch.jumlah_awal}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tanggal Masuk</p>
                        <p className="text-gray-700 dark:text-gray-300">{formatDateShort(batch.tanggal_masuk)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tanggal Kadaluarsa</p>
                        <p className="text-gray-700 dark:text-gray-300">
                            {batch.tanggal_kadaluarsa ? formatDateShort(batch.tanggal_kadaluarsa) : '-'}
                        </p>
                    </div>
                </div>
            </div>

            {/* History */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Package className="w-5 h-5 text-gray-500" />
                        Riwayat Transaksi
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Total: {history.length} transaksi
                    </span>
                </div>

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