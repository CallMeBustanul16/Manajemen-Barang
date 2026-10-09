import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeft, Save, Package, Box, Calendar, Search, 
    AlertTriangle, Scale, CheckCircle2, AlertCircle, FileText, Info
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function StokOpname() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [produkList, setProdukList] = useState([]);
    const [batchList, setBatchList] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        produk_id: '',
        batch_id: '',
        stok_fisik: '',
        alasan: 'Selisih Audit Fisik (Stock Opname)',
        catatan: '',
        tanggal: new Date().toISOString().split('T')[0],
    });

    const alasanOptions = [
        'Selisih Audit Fisik (Stock Opname)',
        'Barang Rusak / Cacat di Rak',
        'Barang Hilang / Susut',
        'Pengambilan Sampling / Uji Coba',
        'Koreksi Kesalahan Input Sebelumnya',
        'Retur / Masalah Kemasan',
        'Lainnya',
    ];

    useEffect(() => {
        fetchProduk();
    }, []);

    useEffect(() => {
        if (formData.produk_id) {
            const p = produkList.find(item => item.id === parseInt(formData.produk_id));
            setSelectedProduct(p || null);
            fetchBatchList(formData.produk_id);
        } else {
            setSelectedProduct(null);
            setBatchList([]);
            setSelectedBatch(null);
        }
    }, [formData.produk_id, produkList]);

    useEffect(() => {
        if (formData.batch_id && batchList.length > 0) {
            const b = batchList.find(item => item.id === parseInt(formData.batch_id));
            setSelectedBatch(b || null);
        } else {
            setSelectedBatch(null);
        }
    }, [formData.batch_id, batchList]);

    const fetchProduk = async () => {
        try {
            setFetching(true);
            const token = localStorage.getItem('token');
            const res = await fetch('/api/produk', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (res.ok) {
                const data = await res.json();
                setProdukList(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
            }
        } catch (e) {
            console.error(e);
            Swal.fire('Error', 'Gagal memuat data produk', 'error');
        } finally {
            setFetching(false);
        }
    };

    const fetchBatchList = async (produkId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/batch/produk/${produkId}/batches`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (res.ok) {
                const data = await res.json();
                setBatchList(data.data || []);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Hitung stok sistem
    const stokSistem = selectedBatch 
        ? Number(selectedBatch.stok_saat_ini ?? 0)
        : Number(selectedProduct?.stok ?? 0);

    const stokFisikNum = formData.stok_fisik !== '' ? Number(formData.stok_fisik) : null;
    const selisih = stokFisikNum !== null ? stokFisikNum - stokSistem : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.produk_id) {
            Swal.fire('Peringatan', 'Silakan pilih produk terlebih dahulu', 'warning');
            return;
        }

        if (formData.stok_fisik === '' || isNaN(formData.stok_fisik) || Number(formData.stok_fisik) < 0) {
            Swal.fire('Peringatan', 'Masukkan angka stok fisik yang valid (minimal 0)', 'warning');
            return;
        }

        // Cek preferensi konfirmasi pengguna
        const prefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        const confirmNeeded = prefs.confirm_transaction !== false;

        if (confirmNeeded) {
            const statusText = selisih > 0 
                ? `Stok bertambah +${selisih} unit` 
                : selisih < 0 
                ? `Stok berkurang ${selisih} unit` 
                : 'Stok tetap (sesuai)';

            const confirmResult = await Swal.fire({
                title: 'Konfirmasi Penyesuaian Stok',
                html: `
                    <div class="text-left text-xs space-y-2">
                        <p><strong>Produk:</strong> ${selectedProduct?.nama_produk}</p>
                        ${selectedBatch ? `<p><strong>Batch:</strong> #${selectedBatch.id} (${selectedBatch.stok_saat_ini} pcs)</p>` : ''}
                        <p><strong>Stok Sistem:</strong> ${stokSistem} unit</p>
                        <p><strong>Stok Fisik Baru:</strong> ${formData.stok_fisik} unit</p>
                        <p><strong>Dampak:</strong> <span class="${selisih > 0 ? 'text-emerald-600 font-bold' : selisih < 0 ? 'text-rose-600 font-bold' : 'text-gray-600'}">${statusText}</span></p>
                        <p><strong>Alasan:</strong> ${formData.alasan}</p>
                    </div>
                `,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#f59e0b',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Ya, Sesuaikan Stok',
                cancelButtonText: 'Batal',
            });

            if (!confirmResult.isConfirmed) return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/stok/opname', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    produk_id: formData.produk_id,
                    batch_id: formData.batch_id || null,
                    stok_fisik: Number(formData.stok_fisik),
                    alasan: formData.alasan,
                    catatan: formData.catatan,
                    tanggal: formData.tanggal,
                }),
            });

            const result = await res.json();
            if (res.ok && result.success) {
                Swal.fire({
                    title: 'Berhasil!',
                    text: result.message || 'Stock Opname berhasil disimpan.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
                navigate('/stok');
            } else {
                Swal.fire('Gagal', result.message || 'Gagal menyimpan penyesuaian stok', 'error');
            }
        } catch (error) {
            console.error('Error opname:', error);
            Swal.fire('Error', 'Terjadi kesalahan jaringan.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredProduk = produkList.filter(p => 
        p.nama_produk.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-2 sm:p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        to="/stok"
                        className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Scale className="w-6 h-6 text-amber-600" />
                            Stock Opname / Penyesuaian Stok
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Sinkronkan selisih antara hitungan fisik di gudang dengan catatan sistem
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 sm:p-6 space-y-6">
                    {/* Pilih Produk */}
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Pilih Produk <span className="text-red-500">*</span>
                        </label>
                        
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama atau SKU produk..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 mb-2"
                            />
                        </div>

                        <select
                            value={formData.produk_id}
                            onChange={(e) => setFormData(prev => ({ ...prev, produk_id: e.target.value, batch_id: '' }))}
                            className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            required
                        >
                            <option value="">-- Pilih Produk yang Disesuaikan --</option>
                            {filteredProduk.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.nama_produk} (SKU: {p.sku || '-'}) — Stok Sistem: {p.stok} unit
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Jika ada batch, pilih batch */}
                    {formData.produk_id && batchList.length > 0 && (
                        <div className="space-y-2 animate-in fade-in">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Pilih Batch / Kardus Terkait (Opsional)
                            </label>
                            <select
                                value={formData.batch_id}
                                onChange={(e) => setFormData(prev => ({ ...prev, batch_id: e.target.value }))}
                                className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            >
                                <option value="">Semua / Tanpa Batch Spesifik (Stok Global Produk: {selectedProduct?.stok} unit)</option>
                                {batchList.map(b => (
                                    <option key={b.id} value={b.id}>
                                        Batch #{b.id} — Isi Saat Ini: {b.stok_saat_ini}/{b.kapasitas} pcs {b.lokasi_rak ? `(Rak: ${b.lokasi_rak})` : ''} {b.tanggal_kadaluarsa ? `(Exp: ${b.tanggal_kadaluarsa})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Card Ringkasan Status Stok & Live Diff Calculator */}
                    {selectedProduct && (
                        <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-3">
                            <div className="flex items-center justify-between text-xs font-medium">
                                <span className="text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                                    <Info className="w-4 h-4" />
                                    Kalkulator Penyesuaian Stok
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                    {selectedBatch ? `Target: Batch #${selectedBatch.id}` : 'Target: Stok Utama Produk'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700 text-center">
                                    <span className="text-[11px] text-gray-500 dark:text-gray-400">Stok Sistem Saat Ini</span>
                                    <p className="text-xl font-bold font-mono text-gray-900 dark:text-white mt-0.5">
                                        {stokSistem} <span className="text-xs font-normal">unit</span>
                                    </p>
                                </div>

                                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700 text-center">
                                    <span className="text-[11px] text-gray-500 dark:text-gray-400">Stok Fisik Dihitung</span>
                                    <p className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                                        {stokFisikNum !== null ? stokFisikNum : '-'} <span className="text-xs font-normal">unit</span>
                                    </p>
                                </div>

                                <div className={`p-3 rounded-xl border text-center transition-colors ${
                                    stokFisikNum === null 
                                        ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400' 
                                        : selisih > 0 
                                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                                        : selisih < 0 
                                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                                        : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                                }`}>
                                    <span className="text-[11px]">Selisih Penyesuaian</span>
                                    <p className="text-xl font-bold font-mono mt-0.5">
                                        {stokFisikNum !== null ? (selisih > 0 ? `+${selisih}` : selisih) : '-'} <span className="text-xs font-normal">unit</span>
                                    </p>
                                    {stokFisikNum !== null && (
                                        <span className="text-[10px] block mt-0.5 font-medium">
                                            {selisih > 0 ? 'Surplus (Bertambah)' : selisih < 0 ? 'Defisit (Susut/Kurang)' : 'Cocok (Tidak Berubah)'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Input Stok Fisik & Tanggal */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Jumlah Stok Fisik Nyata <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                required
                                placeholder="Masukkan hasil hitungan fisik..."
                                value={formData.stok_fisik}
                                onChange={(e) => setFormData(prev => ({ ...prev, stok_fisik: e.target.value }))}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                            <p className="text-[11px] text-gray-400">
                                Angka ini yang akan menjadi jumlah stok sistem baru setelah disimpan.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Tanggal Pelaksanaan Opname <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.tanggal}
                                onChange={(e) => setFormData(prev => ({ ...prev, tanggal: e.target.value }))}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                        </div>
                    </div>

                    {/* Alasan Penyesuaian */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Alasan Penyesuaian <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.alasan}
                            onChange={(e) => setFormData(prev => ({ ...prev, alasan: e.target.value }))}
                            className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            required
                        >
                            {alasanOptions.map((opt, i) => (
                                <option key={i} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Catatan Tambahan */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Catatan Tambahan (Opsional)
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Contoh: Ditemukan 2 kardus rusak di rak B-04 saat audit triwulan..."
                            value={formData.catatan}
                            onChange={(e) => setFormData(prev => ({ ...prev, catatan: e.target.value }))}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        />
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex items-center justify-end gap-3">
                    <Link
                        to="/stok"
                        className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md shadow-amber-600/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        <span>{loading ? 'Menyimpan...' : 'Simpan Stock Opname'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
