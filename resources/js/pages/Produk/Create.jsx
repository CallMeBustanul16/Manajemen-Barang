import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Package, Tag, DollarSign, Box, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { produkAPI, kategoriAPI, pemasokAPI } from '../../lib/api';

export default function BuatProduk() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [kategoriList, setKategoriList] = useState([]);
    const [pemasokList, setPemasokList] = useState([]);
    const [formData, setFormData] = useState({
        nama_produk: '',
        deskripsi: '',
        sku: '',
        stok: '',
        stok_minimal: '2',
        kategori_id: '',
        pemasok_id: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchDropdownData();
    }, []);

    const fetchDropdownData = async () => {
        setLoadingData(true);
        try {
            const [kategoriRes, pemasokRes] = await Promise.all([
                kategoriAPI.getAll(),
                pemasokAPI.getAll(),
            ]);
            setKategoriList(kategoriRes.data.data || kategoriRes.data || []);
            setPemasokList(pemasokRes.data.data || pemasokRes.data || []);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            Swal.fire('Error', 'Gagal memuat data kategori & pemasok', 'error');
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            await produkAPI.create({
                ...formData,
                stok: parseInt(formData.stok),
                stok_minimal: parseInt(formData.stok_minimal),
            });
            Swal.fire({
                title: 'Berhasil!',
                text: 'Produk berhasil ditambahkan tanpa masalah!.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            });
            navigate('/Produk');
        } catch (error) {
            console.error('Error saat sedang membuat data produk:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                Swal.fire('Error', 'Gagal menambahkan produk', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    to="/Produk"
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Tambah Produk
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Isi form di bawah untuk menambahkan produk baru
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nama Produk */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nama Produk <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="nama_produk"
                                value={formData.nama_produk}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                                    errors.nama_produk ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                placeholder="Contoh: Laptop Asus ROG"
                                required
                            />
                        </div>
                        {errors.nama_produk && (
                            <p className="mt-1 text-sm text-red-500">{errors.nama_produk[0]}</p>
                        )}
                    </div>

                    {/* SKU */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            SKU <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                                    errors.sku ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                placeholder="Contoh: SKU-001"
                                required
                            />
                        </div>
                        {errors.sku && (
                            <p className="mt-1 text-sm text-red-500">{errors.sku[0]}</p>
                        )}
                    </div>

                    {/* Kategori & Pemasok (Dropdown) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Kategori <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="kategori_id"
                                value={formData.kategori_id}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                                    errors.kategori_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                required
                            >
                                <option value="">Pilih Kategori</option>
                                {kategoriList.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nama_kategori}
                                    </option>
                                ))}
                            </select>
                            {errors.kategori_id && (
                                <p className="mt-1 text-sm text-red-500">{errors.kategori_id[0]}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Pemasok <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="pemasok_id"
                                value={formData.pemasok_id}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                                    errors.pemasok_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                required
                            >
                                <option value="">Pilih Pemasok</option>
                                {pemasokList.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nama_pemasok}
                                    </option>
                                ))}
                            </select>
                            {errors.pemasok_id && (
                                <p className="mt-1 text-sm text-red-500">{errors.pemasok_id[0]}</p>
                            )}
                        </div>
                    </div>

                    {/* Stok & Stok Minimal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Stok <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    name="stok"
                                    value={formData.stok}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                                        errors.stok ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                    placeholder="0"
                                    min="0"
                                    required
                                />
                            </div>
                            {errors.stok && (
                                <p className="mt-1 text-sm text-red-500">{errors.stok[0]}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Stok Minimal <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    name="stok_minimal"
                                    value={formData.stok_minimal}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                                        errors.stok_minimal ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                    placeholder="5"
                                    min="0"
                                    required
                                />
                            </div>
                            {errors.stok_minimal && (
                                <p className="mt-1 text-sm text-red-500">{errors.stok_minimal[0]}</p>
                            )}
                        </div>
                    </div>

                    {/* Deskripsi */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Deskripsi
                        </label>
                        <textarea
                            name="deskripsi"
                            value={formData.deskripsi}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            placeholder="Deskripsi produk (opsional)"
                        />
                        {errors.deskripsi && (
                            <p className="mt-1 text-sm text-red-500">{errors.deskripsi[0]}</p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <Link
                            to="/Produk"
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