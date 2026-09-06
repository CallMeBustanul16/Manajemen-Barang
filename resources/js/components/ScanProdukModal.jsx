import React, { useState } from 'react';
import { X, Package, AlertTriangle, CheckCircle, Calendar, Box } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ScanProdukModal({ isOpen, onClose, data, onSuccess }) {
    const [type, setType] = useState('masuk');
    const [jumlah, setJumlah] = useState(1);
    const [loading, setLoading] = useState(false);
    const [catatan, setCatatan] = useState('');
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
    const [selectedBatchId, setSelectedBatchId] = useState('');

    if (!isOpen || !data) return null;

    const { produk, batches, total_stok } = data;
    const isLowStock = total_stok <= (produk.stok_minimal || 5);

    // Filter batch yang masih punya stok
    const availableBatches = batches.filter(b => b.stok_saat_ini > 0);

    const handleSubmit = async () => {
        if (jumlah < 1) {
            Swal.fire('Error', 'Jumlah minimal 1', 'error');
            return;
        }

        if (type === 'keluar') {
            // Cek total stok cukup
            if (jumlah > total_stok) {
                Swal.fire('Error', `Stok tidak mencukupi! Total stok: ${total_stok}`, 'error');
                return;
            }

            // Jika keluar, batch wajib dipilih
            if (!selectedBatchId) {
                Swal.fire('Error', 'Silakan pilih batch tujuan', 'error');
                return;
            }

            // Cek stok batch cukup
            const selectedBatch = batches.find(b => b.id === parseInt(selectedBatchId));
            if (selectedBatch && jumlah > selectedBatch.stok_saat_ini) {
                Swal.fire('Error', `Stok batch tidak mencukupi! Stok batch: ${selectedBatch.stok_saat_ini}`, 'error');
                return;
            }
        }

        // Validasi tanggal
        if (!tanggal) {
            Swal.fire('Error', 'Tanggal wajib diisi', 'error');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const endpoint = type === 'masuk' ? '/api/stok/masuk' : '/api/stok/keluar';

            const payload = {
                produk_id: produk.id,
                jumlah: jumlah,
                catatan: catatan || `Scan Produk: ${produk.qr_code}`,
                tanggal: tanggal,
            };

            // Jika keluar dan ada batch yang dipilih, kirim batch_id
            if (type === 'keluar' && selectedBatchId) {
                payload.batch_id = parseInt(selectedBatchId);
            }

            console.log('📤 Sending payload:', payload);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
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
                Swal.fire('Error', result.message || 'Gagal memproses transaksi', 'error');
            }
        } catch (error) {
            console.error('Error processing transaction:', error);
            Swal.fire('Error', 'Gagal memproses transaksi', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handler untuk pilih batch otomatis saat keluar
    const handleTypeChange = (newType) => {
        setType(newType);
        if (newType === 'masuk') {
            setSelectedBatchId(''); // Reset pilihan batch
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Package className="w-5 h-5 text-purple-600" />
                        Scan Produk
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
                            <span className="text-sm text-gray-500 dark:text-gray-400">SKU</span>
                            <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{produk.sku}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Total Stok</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-lg font-bold ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                    {total_stok}
                                </span>
                                {isLowStock && (
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Daftar Batch (untuk keluar) */}
                    {batches.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                📦 Batch Tersedia:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {batches.map((batch) => (
                                    <span
                                        key={batch.id}
                                        className={`px-2 py-1 text-xs rounded-full ${
                                            batch.stok_saat_ini > 0
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                        }`}
                                    >
                                        Batch #{batch.id}: {batch.stok_saat_ini}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pilihan Masuk / Keluar */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleTypeChange('masuk')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                type === 'masuk'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            📥 Masuk
                        </button>
                        <button
                            onClick={() => handleTypeChange('keluar')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                type === 'keluar'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            📤 Keluar
                        </button>
                    </div>

                    {/* Pilih Batch (hanya untuk keluar) */}
                    {type === 'keluar' && batches.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Pilih Batch <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedBatchId}
                                onChange={(e) => setSelectedBatchId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            >
                                <option value="">Pilih batch...</option>
                                {availableBatches.map((batch) => (
                                    <option key={batch.id} value={batch.id}>
                                        Batch #{batch.id} - Stok: {batch.stok_saat_ini} {batch.lokasi_rak ? `(${batch.lokasi_rak})` : ''}
                                    </option>
                                ))}
                            </select>
                            {selectedBatchId && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Stok batch: {batches.find(b => b.id === parseInt(selectedBatchId))?.stok_saat_ini || 0}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Tanggal */}
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

                    {/* Jumlah */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Jumlah <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={jumlah}
                            onChange={(e) => setJumlah(Math.max(1, parseInt(e.target.value) || 1))}
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        />
                        {type === 'keluar' && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Maksimal: {total_stok}
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