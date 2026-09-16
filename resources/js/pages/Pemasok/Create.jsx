import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Phone, Mail, MapPin, User } from 'lucide-react';
import Swal from 'sweetalert2';
import { pemasokAPI } from '../../lib/api';

export default function BuatPemasok() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nama_pemasok: '',
        alamat: '',
        telepon: '',
        email: '',
    });
    const [errors, setErrors] = useState({});

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
            await pemasokAPI.create(formData);
            Swal.fire({
                title: 'Berhasil!',
                text: 'Pemasok yang kamu minta berhasil ditambahkan!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            });
            navigate('/Pemasok');
        } catch (error) {
            console.error('Error creating pemasok:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                Swal.fire('Error', 'Gagal saat menambahkan pemasok', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    to="/Pemasok"
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Tambah Pemasok
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Isi form di bawah untuk menambahkan pemasok baru
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nama Pemasok */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nama Pemasok <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="nama_pemasok"
                                value={formData.nama_pemasok}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                                    errors.nama_pemasok ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                placeholder="Contoh: PT Sumber Makmur"
                                required
                            />
                        </div>
                        {errors.nama_pemasok && (
                            <p className="mt-1 text-sm text-red-500">{errors.nama_pemasok[0]}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                placeholder="email@pemasok.com"
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">{errors.email[0]}</p>
                        )}
                    </div>

                    {/* Telepon */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Telepon
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="telepon"
                                value={formData.telepon}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                                    errors.telepon ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                placeholder="021-1234567"
                            />
                        </div>
                        {errors.telepon && (
                            <p className="mt-1 text-sm text-red-500">{errors.telepon[0]}</p>
                        )}
                    </div>

                    {/* Alamat */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Alamat
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <textarea
                                name="alamat"
                                value={formData.alamat}
                                onChange={handleChange}
                                rows="3"
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                                    errors.alamat ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                placeholder="Jl. Raya No. 123, Jakarta"
                            />
                        </div>
                        {errors.alamat && (
                            <p className="mt-1 text-sm text-red-500">{errors.alamat[0]}</p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <Link
                            to="/Pemasok"
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