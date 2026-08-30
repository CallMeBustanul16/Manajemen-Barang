import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Package, User, Calendar, Plus, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import { produkAPI } from '../../lib/api';

export default function StokBarangMasuk() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [produkList, setProdukList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        produk_id: '',
        jumlah: '',
        catatan: '',
        tanggal: new Date().toISOString().split('T')[0],
    });
    const [errors, setErrors] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        fetchProduk();
    }, []);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        // Jika pilih produk, tampilkan detail
        if (name === 'produk_id') {
            const product = produkList.find(p => p.id === parseInt(value));
            setSelectedProduct(product || null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            // Kirim request ke API stok masuk
            const token = localStorage.getItem('token');
            const response = await fetch('/api/stok/masuk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    produk_id: parseInt(formData.produk_id),
                    jumlah: parseInt(formData.jumlah),
                    catatan: formData.catatan,
                    tanggal: formData.tanggal,
                }),
            });

            const data = await response.json();

            const stokBaru = data.data?.stok_baru || 'tidak diketahui';

            if (response.ok) {
                Swal.fire({
                    title: 'Berhasil!',
                    text: `Stok berhasil ditambahkan. Stok sekarang: ${stokBaru}`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
                navigate('/stok');
            } else {
                setErrors(data.errors || { umum: [data.message || 'Gagal menambah stok'] });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'Gagal menambah stok', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Filter produk berdasarkan search
    const filteredProduk = produkList.filter(p =>
        p.nama_produk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    to="/stok"
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Stok Masuk
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Tambah stok produk ke gudang
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Pilih Produk */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Pilih Produk <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                name="produk_id"
                                value={formData.produk_id}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors appearance-none ${
                                    errors.produk_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                required
                            >
                                <option value="">Cari atau pilih produk...</option>
                                {filteredProduk.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.nama_produk} - Stok: {p.stok} | SKU: {p.sku}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.produk_id && (
                            <p className="mt-1 text-sm text-red-500">{errors.produk_id[0]}</p>
                        )}
                    </div>

                    {/* Detail Produk (jika dipilih) */}
                    {selectedProduct && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">SKU:</span>
                                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{selectedProduct.sku}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Stok Saat Ini:</span>
                                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{selectedProduct.stok}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-500 dark:text-gray-400">Kategori:</span>
                                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                        {selectedProduct.kategori?.nama_kategori || '-'}
                                    </span>
                                </div>
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
                            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                                errors.jumlah ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="Masukkan jumlah"
                            min="1"
                            required
                        />
                        {errors.jumlah && (
                            <p className="mt-1 text-sm text-red-500">{errors.jumlah[0]}</p>
                        )}
                    </div>

                    {/* Tanggal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tanggal
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="date"
                                name="tanggal"
                                value={formData.tanggal}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>
                        {errors.tanggal && (
                            <p className="mt-1 text-sm text-red-500">{errors.tanggal[0]}</p>
                        )}
                    </div>

                    {/* Catatan */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Catatan
                        </label>
                        <textarea
                            name="catatan"
                            value={formData.catatan}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            placeholder="Catatan tambahan (opsional)"
                        />
                        {errors.catatan && (
                            <p className="mt-1 text-sm text-red-500">{errors.catatan[0]}</p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Memproses...' : 'Tambah Stok'}
                        </button>
                        <Link
                            to="/stok"
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