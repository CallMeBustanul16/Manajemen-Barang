import React, { useEffect, useState } from 'react';
import { Package, Tag, AlertTriangle, TrendingUp, TrendingDown, Box, Truck } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalProduk: 0,
        totalKategori: 0,
        totalPemasok: 0,
        stokMenipis: 0,
        produkMasuk: 0,
        produkKeluar: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Inisialisasi AOS
        AOS.init({
            duration: 800,
            once: true,
            easing: 'ease-out-cubic',
        });

        // Fetch data statistik (nanti akan dihubungkan dengan API)
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Karena belum ada CRUD, sementara pakai data dummy, nanti ganti dengan API
            setStats({
                totalProduk: 0,
                totalKategori: 0,
                totalPemasok: 0,
                stokMenipis: 0,
                produkMasuk: 0,
                produkKeluar: 0,
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Produk',
            value: stats.totalProduk,
            icon: Package,
            color: 'blue',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            text: 'text-blue-600 dark:text-blue-400',
            border: 'border-blue-200 dark:border-blue-800',
        },
        {
            title: 'Total Kategori',
            value: stats.totalKategori,
            icon: Tag,
            color: 'green',
            bg: 'bg-green-50 dark:bg-green-900/20',
            text: 'text-green-600 dark:text-green-400',
            border: 'border-green-200 dark:border-green-800',
        },
        {
            title: 'Total Pemasok',
            value: stats.totalPemasok,
            icon: Truck,
            color: 'purple',
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            text: 'text-purple-600 dark:text-purple-400',
            border: 'border-purple-200 dark:border-purple-800',
        },
        {
            title: 'Stok Menipis',
            value: stats.stokMenipis,
            icon: AlertTriangle,
            color: 'red',
            bg: 'bg-red-50 dark:bg-red-900/20',
            text: 'text-red-600 dark:text-red-400',
            border: 'border-red-200 dark:border-red-800',
        },
        {
            title: 'Barang Masuk (Hari Ini)',
            value: stats.produkMasuk,
            icon: TrendingUp,
            color: 'emerald',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            text: 'text-emerald-600 dark:text-emerald-400',
            border: 'border-emerald-200 dark:border-emerald-800',
        },
        {
            title: 'Barang Keluar (Hari Ini)',
            value: stats.produkKeluar,
            icon: TrendingDown,
            color: 'orange',
            bg: 'bg-orange-50 dark:bg-orange-900/20',
            text: 'text-orange-600 dark:text-orange-400',
            border: 'border-orange-200 dark:border-orange-800',
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat data dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Selamat datang di Manajemen Barang
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Sistem aktif
                    </span>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((card, index) => (
                    <div
                        key={card.title}
                        data-aos="fade-up"
                        data-aos-delay={index * 100}
                        className={`
                            bg-white dark:bg-gray-800 
                            rounded-xl shadow-sm hover:shadow-md 
                            border ${card.border}
                            p-6 transition-all duration-300 
                            hover:scale-[1.02] hover:shadow-lg
                        `}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {card.title}
                                </p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                    {card.value}
                                </p>
                            </div>
                            <div className={`
                                p-3 rounded-xl ${card.bg}
                            `}>
                                <card.icon className={`w-6 h-6 ${card.text}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Section: Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Recent Activity */}
                <div
                    data-aos="fade-up"
                    data-aos-delay="400"
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Aktivitas Terbaru
                    </h3>
                    <div className="space-y-3">
                        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                            Belum ada aktivitas hari ini
                        </p>
                        {/* Nanti diisi dengan data real dari API */}
                    </div>
                </div>

                {/* Quick Actions */}
                <div
                    data-aos="fade-up"
                    data-aos-delay="500"
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Aksi Cepat
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-blue-600 dark:text-blue-400">
                            <Package className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-sm font-medium">Tambah Produk</span>
                        </button>
                        <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-green-600 dark:text-green-400">
                            <Box className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-sm font-medium">Stok Masuk</span>
                        </button>
                        <button className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400">
                            <Box className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-sm font-medium">Stok Keluar</span>
                        </button>
                        <button className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-purple-600 dark:text-purple-400">
                            <Tag className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-sm font-medium">Kategori</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}