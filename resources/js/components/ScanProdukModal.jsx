import React, { useState } from 'react';
import { X, Package, AlertTriangle, Calendar, Box, Info, CheckCircle } from 'lucide-react';
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

    // Semua batch
    const allBatches = batches || [];

    // Batch dengan stok (untuk keluar)
    const availableBatches = allBatches.filter(b => b.stok_saat_ini > 0);

    // Batch dengan sisa kapasitas (untuk masuk)
    const fillableBatches = allBatches.filter(b => b.stok_saat_ini < b.kapasitas);

    // Batch terpilih
    const selectedBatch = allBatches.find(b => b.id === parseInt(selectedBatchId));

    // Sisa kapasitas batch terpilih
    const sisaKapasitas = selectedBatch
        ? selectedBatch.kapasitas - selectedBatch.stok_saat_ini
        : 0;

    const handleSubmit = async () => {
        // Validasi jumlah
        if (jumlah < 1) {
            Swal.fire('Error', 'Jumlah minimal 1', 'error');
            return;
        }

        if (!selectedBatchId) {
            Swal.fire('Error', 'Silakan pilih batch terlebih dahulu', 'error');
            return;
        }

        if (!selectedBatch) {
            Swal.fire('Error', 'Batch tidak ditemukan', 'error');
            return;
        }

        const selectedBatch = allBatches.find(b => b.id === parseInt(selectedBatchId));

        // Validasi stok untuk keluar
        if (type === 'keluar') {
            if (selectedBatch.stok_saat_ini <= 0) {
                Swal.fire('Error', 'Batch kosong! Tidak bisa dikeluarkan.', 'error');
                return;
            }
            if (jumlah > selectedBatch.stok_saat_ini) {
                Swal.fire('Error', `Stok batch tidak mencukupi! Stok batch: ${selectedBatch.stok_saat_ini}`, 'error');
                return;
            }
        }

        // Validasi untuk MASUK
        if (type === 'masuk') {
            if (sisaKapasitas <= 0) {
                Swal.fire('Error', 'Batch penuh! Tidak bisa diisi lagi.', 'error');
                return;
            }
            if (jumlah > sisaKapasitas) {
                Swal.fire('Error', `Melebihi kapasitas! Sisa kapasitas: ${sisaKapasitas}`, 'error');
                return;
            }
            if (jumlah > produk.stok) {
                Swal.fire('Error', `Stok gudang tidak mencukupi! Stok: ${produk.stok}`, 'error');
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
                batch_id: parseInt(selectedBatchId),
                jumlah: parseInt(jumlah),
                catatan: catatan || `Scan Produk: ${produk.qr_code || produk.sku}`,
                tanggal: tanggal,
            };

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
                    html: `
                        <p>${jumlah} ${produk.nama_produk} berhasil ${type === 'masuk' ? 'ditambahkan ke' : 'dikeluarkan dari'} batch.</p>
                        <p>Batch #${selectedBatch.id}: <strong>${result.data.stok_batch_baru}/${selectedBatch.kapasitas}</strong></p>
                    `,
                    icon: 'success',
                    timer: 2500,
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

    // Reset batch saat ganti tipe
    const handleTypeChange = (newType) => {
        setType(newType);
        setSelectedBatchId('');
        setJumlah(1);
    };

    // Daftar batch yang ditampilkan (tergantung tipe)
    const displayBatches = type === 'keluar' ? availableBatches : allBatches;

    // Max jumlah
    const maxJumlah = type === 'masuk'
        ? Math.min(sisaKapasitas, produk.stok)
        : selectedBatch?.stok_saat_ini || 0;


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
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Stok Gudang</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {produk.stok}
                            </span>
                        </div>
                    </div>

                    {/* Daftar Batch */}
                    {allBatches.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                📦 Batch Tersedia:
                            </p>
                            <div className="space-y-1">
                                {allBatches.map((batch) => {
                                    const batchPenuh = batch.stok_saat_ini >= batch.kapasitas;
                                    const batchKosong = batch.stok_saat_ini <= 0;
                                    return (
                                        <div
                                            key={batch.id}
                                            className="flex items-center justify-between text-xs"
                                        >
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Batch #{batch.id} {batch.lokasi_rak ? `(${batch.lokasi_rak})` : ''}
                                            </span>
                                            <span className={`font-semibold ${
                                                batchPenuh ? 'text-green-600 dark:text-green-400' :
                                                batchKosong ? 'text-red-600 dark:text-red-400' :
                                                'text-blue-600 dark:text-blue-400'
                                            }`}>
                                                {batch.stok_saat_ini}/{batch.kapasitas}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Pilihan Masuk / Keluar */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleTypeChange('masuk')}
                            disabled={fillableBatches.length === 0}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                type === 'masuk'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            📥 Masuk
                        </button>
                        <button
                            onClick={() => handleTypeChange('keluar')}
                            disabled={availableBatches.length === 0}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                type === 'keluar'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            📤 Keluar
                        </button>
                    </div>

                    {/* Pilih Batch */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Pilih Batch <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={selectedBatchId}
                                onChange={(e) => setSelectedBatchId(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                            >
                                <option value="">Pilih batch...</option>
                                {displayBatches.map((batch) => {
                                    const sisa = batch.kapasitas - batch.stok_saat_ini;
                                    return (
                                        <option key={batch.id} value={batch.id}>
                                            Batch #{batch.id} — {batch.stok_saat_ini}/{batch.kapasitas}
                                            {type === 'masuk' ? ` (sisa: ${sisa})` : ''}
                                            {batch.lokasi_rak ? ` • ${batch.lokasi_rak}` : ''}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        {displayBatches.length === 0 && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {type === 'masuk'
                                    ? 'Semua batch penuh! Tidak bisa diisi.'
                                    : 'Tidak ada batch dengan stok tersedia.'}
                            </p>
                        )}
                    </div>

                    {/* Info Batch Terpilih */}
                    {selectedBatch && (
                        <div className={`border rounded-lg p-3 space-y-2 ${
                            type === 'masuk'
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        }`}>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Batch #{selectedBatch.id}</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {selectedBatch.stok_saat_ini}/{selectedBatch.kapasitas}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                    {type === 'masuk' ? 'Sisa Kapasitas' : 'Stok Tersedia'}
                                </span>
                                <span className={`font-bold ${
                                    type === 'masuk'
                                        ? sisaKapasitas > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                        : selectedBatch.stok_saat_ini > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600'
                                }`}>
                                    {type === 'masuk' ? sisaKapasitas : selectedBatch.stok_saat_ini}
                                </span>
                            </div>
                        </div>
                    )}

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
                            max={maxJumlah}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                        />
                        {selectedBatch && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Maksimal: <strong>{maxJumlah}</strong>
                                {type === 'masuk' ? ' (sisa kapasitas / stok gudang)' : ' (stok batch)'}
                            </p>
                        )}
                    </div>

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
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                            />
                        </div>
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
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
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
                        disabled={loading || !selectedBatchId}
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