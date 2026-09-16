import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import { kategoriAPI } from '../../lib/api';

export default function EditKategori() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        nama_kategori: '',
        deskripsi: '',
        slug: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchKategori();
    }, [id]);

    const fetchKategori = async () => {
        setLoading(true);
        try {
            const response = await kategoriAPI.getById(id);
            const data = response.data.data || response.data;
            setFormData({
                nama_kategori: data.nama_kategori || '',
                deskripsi: data.deskripsi || '',
                slug: data.slug || '',
            });
        } catch (error) {
            console.error('Error saat sedang memuat kategori:', error);
            Swal.fire('Error', 'Gagal memuat kategori, coba lagi!', 'error');
            navigate('/kategori');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'nama_kategori') {
            const slug = value 
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setFormData(prev => ({ ...prev, slug }));
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        try {
            await kategoriAPI.update(id, formData);
            Swal.fire({
                title: 'Berhasil!',
                text: 'Kategori berhasil kamu ubah!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            });
            navigate('/kategori');
        } catch (error) {
            console.error('Error saat hendak melakukan Update:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                Swal.fire('Error', 'Gagal melakukan pembaruan pada kategori', 'error');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat data kategori...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    to="/kategori"
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Edit Kategori
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Perbarui data kategori
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nama Kategori <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="nama_kategori"
                            value={formData.nama_kategori}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                                errors.nama_kategori ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            required
                        />
                        {errors.nama_kategori && (
                            <p className="mt-1 text-sm text-red-500">{errors.nama_kategori[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Slug
                        </label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            disabled
                        />
                        {errors.slug && (
                            <p className="mt-1 text-sm text-red-500">{errors.slug[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Deskripsi
                        </label>
                        <textarea
                            name="deskripsi"
                            value={formData.deskripsi}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                        />
                        {errors.deskripsi && (
                            <p className="mt-1 text-sm text-red-500">{errors.deskripsi[0]}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Menyimpan...' : 'Perbarui'}
                        </button>
                        <Link
                            to="/kategori"
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