import React, { useState } from 'react';
import { X, Package, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ScanBatchModal({ isOpen, onClose, data, onSuccess }) {
    const [type, setType] = useState('masuk');
    const [jumlah, setJumlah] = useState(1);
    const [loading, setLoading] = useState(false);
    const [catatan, setCatatan] = useState('');
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);

    if (!isOpen || !data) return null;

    const batch = data;
    const produk = batch.produk;

    const handleSubmit = async () => {
        if (jumlah < 1) {
            Swal.fire('Error', 'Jumlah minimal 1', 'error');
            return;
        }

        if (type === 'keluar' && jumlah > batch.stok_saat_ini) {
            Swal.fire('Error', `Stok tidak mencukupi! Stok saat ini: ${batch.stok_saat_ini}`, 'error');
            return;
        }

        if (!tanggal) {
            Swal.fire('Error', 'Tanggal wajib diisi', 'error');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const endpoint = type === 'masuk' ? '/api/stok/masuk' : '/api/stok/keluar';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    produk_id: produk.id,
                    batch_id: batch.id,
                    jumlah: jumlah,
                    catatan: catatan || `Scan Batch: ${batch.qr_code}`,
                    tanggal: tanggal,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    title: 'Berhasil!',
                    text: `${jumlah} ${produk.nama_produk} berhasil ${type === 'masuk' ? 'ditambahkan' : 'dikeluarkan'}`,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                });
                onSuccess();
                onClose();
            } else {
                console.error('❌ Transaction error:', {
                    status: response.status,
                    statusText: response.statusText,
                    result
                });
            
                Swal.fire({
                    title: `Error ${response.status}`,
                    text: result.message || 'Gagal memproses transaksi',
                    icon: 'error'
                });
            }
        } catch (error) {
            console.error('❌ Error processing transaction:', error);
                
            Swal.fire({
                title: 'Error',
                text: error.message || 'Gagal memproses transaksi',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const isLowStock = batch.stok_saat_ini <= (produk.stok_minimal || 3);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        Scan Batch
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                    {/* Info Produk */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Produk</span>
                            <span className="font-medium text-gray-900 dark:text-white">{produk.nama_produk}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Batch ID</span>
                            <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{batch.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Lokasi</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{batch.lokasi_rak || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Stok Saat Ini</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-lg font-bold ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                    {batch.stok_saat_ini}
                                </span>
                                {isLowStock && (
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Stok Awal</span>
                            <span className="text-gray-700 dark:text-gray-300">{batch.jumlah_awal}</span>
                        </div>
                    </div>

                    {/* Pilihan Masuk / Keluar */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setType('masuk')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                type === 'masuk'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            📥 Masuk
                        </button>
                        <button
                            onClick={() => setType('keluar')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                type === 'keluar'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            📤 Keluar
                        </button>
                    </div>

                    {/* Input Tanggal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tanggal <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={tanggal}
                                onChange={(e) => setTanggal(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Input Jumlah */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Jumlah
                        </label>
                        <input
                            type="number"
                            value={jumlah}
                            onChange={(e) => setJumlah(Math.max(1, parseInt(e.target.value) || 1))}
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        />
                        {type === 'keluar' && batch.stok_saat_ini > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Maksimal: {batch.stok_saat_ini}
                            </p>
                        )}
                    </div>

                    {/* Catatan */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Catatan (opsional)
                        </label>
                        <input
                            type="text"
                            value={catatan}
                            onChange={(e) => setCatatan(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            placeholder="Tambahkan catatan..."
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`flex-1 py-2 px-4 rounded-lg text-white font-medium transition-colors ${
                            type === 'masuk'
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-red-600 hover:bg-red-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading ? 'Memproses...' : type === 'masuk' ? 'Tambah Stok' : 'Kurangi Stok'}
                    </button>
                </div>
            </div>
        </div>
    );
}