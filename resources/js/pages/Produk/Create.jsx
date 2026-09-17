import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Package, Tag, Box, AlertCircle } from 'lucide-react';
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
        stok: '0',
        stok_minimal: '2',
        kategori_id: '',
        pemasok_id: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        let isMounted = true;
        
        const fetchDropdownData = async () => {
            setLoadingData(true);
            try {
                const [kategoriRes, pemasokRes] = await Promise.all([
                    kategoriAPI.getAll(),
                    pemasokAPI.getAll(),
                ]);
                
                if (isMounted) {
                    setKategoriList(kategoriRes.data?.data || kategoriRes.data || []);
                    setPemasokList(pemasokRes.data?.data || pemasokRes.data || []);
                }
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
                Swal.fire('Error', 'Gagal memuat data kategori & pemasok', 'error');
            } finally {
                if (isMounted) setLoadingData(false);
            }
        };

        fetchDropdownData();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        // Payload Parsing Guard (Mencegah NaN)
        const payload = {
            ...formData,
            stok: formData.stok !== '' ? Number(formData.stok) : 0,
            stok_minimal: formData.stok_minimal !== '' ? Number(formData.stok_minimal) : 0,
        };

        try {
            await produkAPI.create(payload);
            
            Swal.fire({
                title: 'Berhasil!',
                text: 'Produk berhasil ditambahkan.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            });
            
            navigate('/produk');
        } catch (error) {
            console.error('Error membuat produk:', error);
            
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                Swal.fire('Error', error.response?.data?.message || 'Gagal menambahkan produk', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    // Helper render error validasi dinamis (Array / String)
    const renderError = (field) => {
        if (!errors[field]) return null;
        const message = Array.isArray(errors[field]) ? errors[field][0] : errors[field];
        return <p className="mt-1 text-xs text-rose-500 font-medium">{message}</p>;
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-xs text-gray-500">
                Memuat data referensi...
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-4 p-2 sm:p-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link
                    to="/produk"
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        Tambah Produk Baru
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Lengkapi informasi detail produk dan persediaan di bawah ini
                    </p>
                </div>
            </div>

            {/* Form Box */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nama Produk */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Nama Produk <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                name="nama_produk"
                                value={formData.nama_produk}
                                onChange={handleChange}
                                className={`w-full pl-9 pr-3 py-2 text-xs border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors ${
                                    errors.nama_produk ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
                                }`}
                                placeholder="Contoh: Laptop Asus ROG"
                                required
                            />
                        </div>
                        {renderError('nama_produk')}
                    </div>

                    {/* SKU */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            SKU / Kode Barang <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                className={`w-full pl-9 pr-3 py-2 text-xs border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors ${
                                    errors.sku ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
                                }`}
                                placeholder="Contoh: LAP-ASUS-001"
                                required
                            />
                        </div>
                        {renderError('sku')}
                    </div>

                    {/* Dropdowns Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Kategori <span className="text-rose-500">*</span>
                            </label>
                            <select
                                name="kategori_id"
                                value={formData.kategori_id}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 text-xs border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors ${
                                    errors.kategori_id ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
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
                            {renderError('kategori_id')}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Pemasok <span className="text-rose-500">*</span>
                            </label>
                            <select
                                name="pemasok_id"
                                value={formData.pemasok_id}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 text-xs border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors ${
                                    errors.pemasok_id ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
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
                            {renderError('pemasok_id')}
                        </div>
                    </div>

                    {/* Stock Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Stok Awal <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    name="stok"
                                    value={formData.stok}
                                    onChange={handleChange}
                                    className={`w-full pl-9 pr-3 py-2 text-xs border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors ${
                                        errors.stok ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
                                    }`}
                                    min="0"
                                    required
                                />
                            </div>
                            {renderError('stok')}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Stok Minimal (Batas Peringatan) <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    name="stok_minimal"
                                    value={formData.stok_minimal}
                                    onChange={handleChange}
                                    className={`w-full pl-9 pr-3 py-2 text-xs border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors ${
                                        errors.stok_minimal ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
                                    }`}
                                    min="0"
                                    required
                                />
                            </div>
                            {renderError('stok_minimal')}
                        </div>
                    </div>

                    {/* Deskripsi */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Deskripsi Tambahan
                        </label>
                        <textarea
                            name="deskripsi"
                            value={formData.deskripsi}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                            placeholder="Keterangan opsional produk..."
                        />
                        {renderError('deskripsi')}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Menyimpan...' : 'Simpan Produk'}
                        </button>
                        <Link
                            to="/produk"
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}