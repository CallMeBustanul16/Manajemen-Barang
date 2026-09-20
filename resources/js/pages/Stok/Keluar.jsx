import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Package, User, Box, Calendar, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import Swal from 'sweetalert2';
import { produkAPI } from '../../lib/api';

export default function StokBarangKeluar() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [produkList, setProdukList] = useState([]);
    const [formData, setFormData] = useState({
        produk_id: '',
        batch_id: '',
        jumlah: '',
        catatan: '',
        tanggal: new Date().toISOString().split('T')[0],
    });
    const [errors, setErrors] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [batchList, setBatchList] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);

    useEffect(() => {
        fetchProduk();
    }, []);

    useEffect(() => {
        if (formData.produk_id) {
            fetchBatchList(formData.produk_id);
        } else {
            setBatchList([]);
            setSelectedBatch(null);
        }
    }, [formData.produk_id]);

    useEffect(() => {
        if (formData.batch_id && batchList.length > 0) {
            const batch = batchList.find(b => b.id === parseInt(formData.batch_id));
            setSelectedBatch(batch || null);
        } else {
            setSelectedBatch(null);
        }
    }, [formData.batch_id, batchList]);

    const fetchProduk = async () => {
        try {
            const response = await produkAPI.getAll();
            const data = response.data.data || response.data;
            setProdukList(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching produk:', error);
            Swal.fire('Error', 'Gagal memuat data produk', 'error');
        }
    };

    const fetchBatchList = async (produkId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/batch/produk/${produkId}/batches`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });
            const result = await response.json();

            if (response.ok) {
                setBatchList(result.data.batches || []);
            } else {
                setBatchList([]);
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
            setBatchList([]);
        }
    };

    const payload = {
        produk_id: parseInt(formData.produk_id),
        batch_id: parseInt(formData.batch_id),
        jumlah: parseInt(formData.jumlah),
        catatan: formData.catatan,
        tanggal: formData.tanggal,
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (name === 'produk_id') {
            const product = produkList.find(p => p.id === parseInt(value));
            setSelectedProduct(product || null);
            setFormData(prev => ({ ...prev, batch_id: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        if (!selectedBatch) {
            Swal.fire('Error', 'Silakan pilih batch terlebih dahulu', 'error');
            setLoading(false);
            return;
        }

        if (selectedBatch && parseInt(formData.jumlah) > selectedBatch.stok_saat_ini) {
            Swal.fire('Error', `Stok batch tidak mencukupi! Stok batch: ${selectedBatch.stok_saat_ini}`, 'error');
            setLoading(false);
            return;
        }

        try {
            // Validasi stok cukup
            if (selectedProduct && parseInt(formData.jumlah) > selectedProduct.stok) {
                setErrors({ jumlah: ['Stok tidak mencukupi! Stok saat ini: ' + selectedProduct.stok] });
                setLoading(false);
                return;
            }

            const token = localStorage.getItem('token');
            const response = await fetch('/api/stok/keluar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            const stokBaru = data.data?.stok_baru || 'tidak diketahui';

            if (response.ok) {
                Swal.fire({
                    title: 'Berhasil!',
                    html: `
                        <p>Stok berhasil keluar dari batch.</p>
                        <p>Batch: <strong>${data.data.stok_batch_baru}/${selectedBatch.kapasitas}</strong></p>
                        <p>Stok gudang tetap: <strong>${data.data.stok_produk_tetap}</strong></p>
                    `,
                    icon: 'success',
                    timer: 2500,
                    showConfirmButton: false,
                });
                navigate('/stok');
            } else {
                setErrors(data.errors || { umum: [data.message || 'Gagal mengurangi stok'] });
                Swal.fire('Error', data.message || 'Gagal mengurangi stok', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'Gagal mengurangi stok', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/stok" className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stok Keluar</h1>
                    <p className="text-gray-600 dark:text-gray-400">Keluarkan stok dari batch</p>
                </div>
            </div>

            {/* Info */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                        Stok keluar akan <strong>mengurangi isi batch</strong>.
                        Stok gudang tetap, total keseluruhan berkurang (barang keluar dari sistem).
                    </span>
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
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
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
                    </div>

                    {/* Info Batch Terpilih */}
                    {formData.produk_id && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Pilih Batch <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    name="batch_id"
                                    value={formData.batch_id}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                    required
                                >
                                    <option value="">Pilih batch...</option>
                                    {batchList.filter(b => b.stok_saat_ini > 0).map((batch) => (
                                        <option key={batch.id} value={batch.id}>
                                            Batch #{batch.id} — {batch.stok_saat_ini}/{batch.kapasitas}
                                            {batch.lokasi_rak ? ` • ${batch.lokasi_rak}` : ''}
                                        </option>
                                    ))}
                                </select>
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
                            name="jumlah"
                            value={formData.jumlah}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Masukkan jumlah"
                            min="1"
                            max={selectedBatch?.stok_saat_ini || undefined}
                            required
                        />
                        {selectedBatch && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Maksimal: <strong>{selectedBatch.stok_saat_ini}</strong>
                            </p>
                        )}
                    </div>

                    {/* Tanggal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tanggal <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="date"
                                name="tanggal"
                                value={formData.tanggal}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Catatan */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Catatan (opsional)
                        </label>
                        <textarea
                            name="catatan"
                            value={formData.catatan}
                            onChange={handleChange}
                            rows="2"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Catatan tambahan..."
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={loading || !selectedBatch || selectedBatch.stok_saat_ini <= 0}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Memproses...' : 'Kurangi Stok'}
                        </button>
                        <Link to="/stok" className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}