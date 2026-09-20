import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Package, Calendar, MapPin, Box, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';

export default function BuatBatch() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [produkList, setProdukList] = useState([]);
    const [selectedProduk, setSelectedProduk] = useState(null);
    const [formData, setFormData] = useState({
        produk_id: '',
        jumlah_awal: '',
        tanggal_masuk: new Date().toISOString().split('T')[0],
        lokasi_rak: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchProduk();
    }, []);

    const fetchProduk = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/produk', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            const result = await response.json();
            if (response.ok) {
                setProdukList(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching produk:', error);
            Swal.fire('Error', 'Gagal memuat data produk', 'error');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (name === 'produk_id') {
            const produk = produkList.find(p => p.id === parseInt(value));
            setSelectedProduk(produk || null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        if (selectedProduk && parseInt(formData.jumlah_awal) > selectedProduk.stok) {
            Swal.fire({
                title: 'Stok Tidak Cukup!',
                html: `
                    <p>Stok gudang <strong>${selectedProduk.nama_produk}</strong> hanya <strong>${selectedProduk.stok}</strong>.</p>
                    <p>Anda mencoba membuat batch dengan <strong>${formData.jumlah_awal}</strong> item.</p>
                `,
                icon: 'warning',
                confirmButtonText: 'OK',
            });
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    title: 'Berhasil!',
                    html: `
                        <p>Batch berhasil dibuat.</p>
                        <p>Stok gudang berkurang <strong>${formData.jumlah_awal}</strong>.</p>
                        <p>Batch terisi <strong>${data.data.batch.stok_saat_ini}/${data.data.batch.kapasitas}</strong>.</p>
                    `,
                    icon: 'success',
                    timer: 2500,
                    showConfirmButton: false,
                });
                navigate('/batch');
            } else {
                setErrors(data.errors || { umum: [data.message || 'Gagal menambah batch'] });
                Swal.fire('Error', data.message || 'Gagal menambah batch', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'Gagal menambah batch', 'error');
        } finally {
            setLoading(false);
        }
    };

    const sisaStokGudang = selectedProduk && formData.jumlah_awal
        ? selectedProduk.stok - parseInt(formData.jumlah_awal || 0)
        : selectedProduk?.stok || 0;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/batch" className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Tambah Batch
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Buat batch baru dengan kapasitas tertentu
                    </p>
                </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    💡 <strong>Info:</strong> Membuat batch akan <strong>memindahkan stok dari gudang ke batch</strong>.
                    Total keseluruhan stok tidak berubah.
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Pilih Produk */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Produk <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                name="produk_id"
                                value={formData.produk_id}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none ${
                                    errors.produk_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                required
                            >
                                <option value="">Pilih produk...</option>
                                {produkList.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.nama_produk} — Stok Gudang: {p.stok}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.produk_id && <p className="mt-1 text-sm text-red-500">{errors.produk_id[0]}</p>}
                    </div>

                    {/* Info Stok Gudang */}
                    {selectedProduk && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Stok Gudang Saat Ini</span>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    {selectedProduk.stok}
                                </span>
                            </div>
                            {selectedProduk.stok === 0 && (
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>Stok gudang kosong! Tidak bisa membuat batch.</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Jumlah Awal (Kapasitas) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Isi Batch / Kapasitas <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="number"
                                name="jumlah_awal"
                                value={formData.jumlah_awal}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none ${
                                    errors.jumlah_awal ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                placeholder="Contoh: 10"
                                min="1"
                                max={selectedProduk?.stok || undefined}
                                required
                            />
                        </div>
                        {errors.jumlah_awal && <p className="mt-1 text-sm text-red-500">{errors.jumlah_awal[0]}</p>}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Jumlah ini akan menjadi <strong>kapasitas maksimal</strong> batch.
                        </p>
                    </div>

                    {/* Preview Stok */}
                    {selectedProduk && formData.jumlah_awal && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                                📊 Preview Perubahan:
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Stok gudang:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">
                                        {selectedProduk.stok} → <strong>{sisaStokGudang}</strong>
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Batch baru:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">
                                        0 → <strong>{formData.jumlah_awal}/{formData.jumlah_awal}</strong>
                                    </span>
                                </div>
                            </div>
                            {sisaStokGudang < 0 && (
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mt-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>Stok gudang tidak mencukupi!</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tanggal Masuk */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tanggal Masuk <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="date"
                                name="tanggal_masuk"
                                value={formData.tanggal_masuk}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        {errors.tanggal_masuk && <p className="mt-1 text-sm text-red-500">{errors.tanggal_masuk[0]}</p>}
                    </div>

                    {/* Lokasi Rak */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Lokasi Rak (opsional)
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="lokasi_rak"
                                value={formData.lokasi_rak}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Contoh: Rak A1"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={loading || !selectedProduk || selectedProduk.stok === 0}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Menyimpan...' : 'Simpan Batch'}
                        </button>
                        <Link
                            to="/batch"
                            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}