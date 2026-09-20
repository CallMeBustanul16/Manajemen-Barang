import React, { useState } from 'react';
import { X, Package, AlertTriangle, CheckCircle, Calendar, Box, Info } from 'lucide-react';
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

    const sisaKapasitas = batch.kapasitas - batch.stok_saat_ini;
    const penuh = sisaKapasitas <= 0;
    const kosong = batch.stok_saat_ini <= 0;

    const handleSubmit = async () => {
        if (jumlah < 1) {
            Swal.fire('Error', 'Jumlah minimal 1', 'error');
            return;
        }

        if (type === 'keluar') {
            if (kosong) {
                Swal.fire('Error', 'Batch kosong! Tidak bisa dikeluarkan.', 'error');
                return;
            }
            if (jumlah > batch.stok_saat_ini) {
                Swal.fire('Error', `Stok batch tidak mencukupi! Stok batch: ${batch.stok_saat_ini}`, 'error');
                return;
            }
        }

        if (type === 'masuk') {
            if (penuh) {
                Swal.fire('Error', 'Batch penuh! Tidak bisa diisi lagi.', 'error');
                return;
            }
            if (jumlah > sisaKapasitas) {
                Swal.fire('Error', `Melebihi kapasitas! Sisa kapasitas: ${sisaKapasitas}`, 'error');
                return;
            }
            if (produk.stok !== undefined && jumlah > produk.stok) {
                Swal.fire('Error', `Stok gudang tidak mencukupi! Stok: ${produk.stok}`, 'error');
                return;
            }
        }

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
                batch_id: batch.id,
                jumlah: jumlah,
                catatan: catatan || `Scan Batch: ${batch.qr_code}`,
                tanggal: tanggal,
            };

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
                        <p>Batch #${batch.id}: <strong>${result.data.stok_batch_baru}/${batch.kapasitas}</strong></p>
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

    const handleTypeChange = (newType) => {
        setType(newType);
        setJumlah(1);
    };

    const maxJumlah = type === 'masuk' ? sisaKapasitas : batch.stok_saat_ini;

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
                    {/* Info Batch */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Produk</span>
                            <span className="font-medium text-gray-900 dark:text-white">{produk.nama_produk}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Batch ID</span>
                            <span className="font-mono text-xs text-gray-600 dark:text-gray-400">#{batch.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Lokasi</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{batch.lokasi_rak || '-'}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-500 dark:text-gray-400">Isi / Kapasitas</span>
                                <span className={`font-bold ${
                                    penuh ? 'text-green-600 dark:text-green-400' :
                                    kosong ? 'text-red-600 dark:text-red-400' :
                                    'text-blue-600 dark:text-blue-400'
                                }`}>
                                    {batch.stok_saat_ini}/{batch.kapasitas}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all ${
                                        penuh ? 'bg-green-500' :
                                        kosong ? 'bg-red-500' :
                                        'bg-blue-500'
                                    }`}
                                    style={{ width: `${batch.kapasitas > 0 ? (batch.stok_saat_ini / batch.kapasitas) * 100 : 0}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>Sisa kapasitas: <strong>{sisaKapasitas}</strong></span>
                                <span>{batch.kapasitas > 0 ? Math.round((batch.stok_saat_ini / batch.kapasitas) * 100) : 0}%</span>
                            </div>
                        </div>

                        {/* Status Warning */}
                        {penuh && (
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded">
                                <Info className="w-3 h-3" />
                                <span>Batch penuh — tidak bisa diisi lagi</span>
                            </div>
                        )}
                        {kosong && (
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Batch kosong — tidak bisa dikeluarkan</span>
                            </div>
                        )}
                    </div>

                    {/* Pilihan Masuk / Keluar */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleTypeChange('masuk')}
                            disabled={penuh}
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
                            disabled={kosong}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                type === 'keluar'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            📤 Keluar
                        </button>
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
                            max={maxJumlah}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Maksimal: <strong>{maxJumlah}</strong>
                            {type === 'masuk' ? ' (sisa kapasitas)' : ' (stok batch)'}
                        </p>
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
                        disabled={loading || (type === 'masuk' && penuh) || (type === 'keluar' && kosong)}
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