import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Package, Calendar, MapPin, Box } from 'lucide-react';
import Swal from 'sweetalert2';

export default function BuatBatch() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [produkList, setProdukList] = useState([]);
    const [formData, setFormData] = useState({
        produk_id: '',
        jumlah_awal: '',
        tanggal_masuk: new Date().toISOString().split('T')[0],
        tanggal_kadaluarsa: '',
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

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
                    text: 'Batch berhasil ditambahkan dengan QR Code.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                });
                navigate('/batch');
            } else {
                setErrors(data.errors || { umum: [data.message || 'Gagal menambah batch'] });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'Gagal menambah batch', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/batch" className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Tambah Batch
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Tambah batch/kardus baru dengan QR Code
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Produk */}
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
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors appearance-none ${
                                    errors.produk_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                required
                            >
                                <option value="">Pilih produk...</option>
                                {produkList.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.nama_produk} (Stok: {p.stok})
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.produk_id && (
                            <p className="mt-1 text-sm text-red-500">{errors.produk_id[0]}</p>
                        )}
                    </div>

                    {/* Jumlah Awal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Jumlah Awal <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="number"
                                name="jumlah_awal"
                                value={formData.jumlah_awal}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                                    errors.jumlah_awal ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                placeholder="Contoh: 50"
                                min="1"
                                required
                            />
                        </div>
                        {errors.jumlah_awal && (
                            <p className="mt-1 text-sm text-red-500">{errors.jumlah_awal[0]}</p>
                        )}
                    </div>

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
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                                    errors.tanggal_masuk ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                required
                            />
                        </div>
                        {errors.tanggal_masuk && (
                            <p className="mt-1 text-sm text-red-500">{errors.tanggal_masuk[0]}</p>
                        )}
                    </div>

                    {/* Tanggal Kadaluarsa */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tanggal Kadaluarsa (opsional)
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="date"
                                name="tanggal_kadaluarsa"
                                value={formData.tanggal_kadaluarsa}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>
                        {errors.tanggal_kadaluarsa && (
                            <p className="mt-1 text-sm text-red-500">{errors.tanggal_kadaluarsa[0]}</p>
                        )}
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
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                placeholder="Contoh: Rak A1"
                            />
                        </div>
                        {errors.lokasi_rak && (
                            <p className="mt-1 text-sm text-red-500">{errors.lokasi_rak[0]}</p>
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
                            {loading ? 'Menyimpan...' : 'Simpan Batch'}
                        </button>
                        <Link to="/batch" className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}