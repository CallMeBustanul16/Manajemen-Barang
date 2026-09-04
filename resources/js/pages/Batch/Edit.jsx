import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, MapPin } from 'lucide-react';
import Swal from 'sweetalert2';

export default function EditBatch() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        lokasi_rak: '',
        tanggal_kadaluarsa: '',
    });
    const [errors, setErrors] = useState({});
    const [batch, setBatch] = useState(null);

    useEffect(() => {
        fetchBatch();
    }, [id]);

    const fetchBatch = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/batch/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            const result = await response.json();

            if (response.ok) {
                const data = result.data || result;
                setBatch(data);
                setFormData({
                    lokasi_rak: data.lokasi_rak || '',
                    tanggal_kadaluarsa: data.tanggal_kadaluarsa || '',
                });
            } else {
                Swal.fire('Error', result.message || 'Gagal memuat data batch', 'error');
                navigate('/batch');
            }
        } catch (error) {
            console.error('Error fetching batch:', error);
            Swal.fire('Error', 'Gagal memuat data batch', 'error');
            navigate('/batch');
        } finally {
            setLoading(false);
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
        setSaving(true);
        setErrors({});

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/batch/${id}`, {
                method: 'PUT',
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
                    text: 'Batch berhasil diperbarui.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                });
                navigate('/batch');
            } else {
                setErrors(data.errors || { umum: [data.message || 'Gagal memperbarui batch'] });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'Gagal memperbarui batch', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat data batch...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/batch" className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Edit Batch
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Perbarui data batch
                    </p>
                </div>
            </div>

            {/* Info Batch */}
            {batch && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Produk:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {batch.produk?.nama_produk || '-'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Stok Saat Ini:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {batch.stok_saat_ini} / {batch.jumlah_awal}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Tanggal Masuk:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {batch.tanggal_masuk}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">QR Code:</span>
                            <span className="ml-2 font-mono text-xs text-gray-600 dark:text-gray-400">
                                {batch.qr_code?.substring(0, 20)}...
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
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
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                                    errors.lokasi_rak ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                placeholder="Contoh: Rak A1"
                            />
                        </div>
                        {errors.lokasi_rak && (
                            <p className="mt-1 text-sm text-red-500">{errors.lokasi_rak[0]}</p>
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
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                                    errors.tanggal_kadaluarsa ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                            />
                        </div>
                        {errors.tanggal_kadaluarsa && (
                            <p className="mt-1 text-sm text-red-500">{errors.tanggal_kadaluarsa[0]}</p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Menyimpan...' : 'Perbarui Batch'}
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