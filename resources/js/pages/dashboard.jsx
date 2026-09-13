import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Package,
    Tag,
    Truck,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Box,
    ShoppingCart,
    Clock,
    ArrowRight,
    ArrowDown,
    ArrowUp,
    RefreshCw,
} from 'lucide-react';
import Swal from 'sweetalert2';
import AOS from 'aos';
import 'aos/dist/aos.css';
import StokChart from '../components/StokChart';
import StokAlert from '../components/StokAlert';

export default function Dashboard() {
    const [stats, setStats] = useState({
        total_produk: 0,
        total_kategori: 0,
        total_pemasok: 0,
        produk_stok_menipis: 0,
        produk_stok_habis: 0,
    });
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingActivities, setLoadingActivities] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
            easing: 'ease-out-cubic',
        });
        fetchStats();
        fetchActivities();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/dashboard/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Gagal mengambil data statistik');
            }

            const result = await response.json();
            const data = result.data || result;
            setStats({
                total_produk: data.total_produk || 0,
                total_kategori: data.total_kategori || 0,
                total_pemasok: data.total_pemasok || 0,
                produk_stok_menipis: data.produk_stok_menipis || 0,
                produk_stok_habis: data.produk_stok_habis || 0,
            });
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching stats:', error);
            Swal.fire('Error', 'Gagal memuat data dashboard', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchActivities = async () => {
        setLoadingActivities(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/dashboard/recent-activities', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            const result = await response.json();
            if (response.ok) {
                setActivities(result.data || []);
            } else {
                console.error('API Error:', result.message);
                setActivities([]);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            setActivities([]);
        } finally {
            setLoadingActivities(false);
        }
    };

    const formatTime = (date) => {
        if (!date) return '-';
        try {
            return new Date(date).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        } catch {
            return '-';
        }
    };

    const formatTimeShort = (date) => {
        if (!date) return '-';
        try {
            const d = new Date(date);
            return d.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return date;
        }
    };

    // Stat Cards Data
    const statCards = [
        {
            key: 'total_produk',
            title: 'Total Produk',
            value: stats.total_produk,
            icon: Package,
            color: 'blue',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            text: 'text-blue-600 dark:text-blue-400',
            border: 'border-blue-200 dark:border-blue-800',
        },
        {
            key: 'total_kategori',
            title: 'Total Kategori',
            value: stats.total_kategori,
            icon: Tag,
            color: 'green',
            bg: 'bg-green-50 dark:bg-green-900/20',
            text: 'text-green-600 dark:text-green-400',
            border: 'border-green-200 dark:border-green-800',
        },
        {
            key: 'total_pemasok',
            title: 'Total Pemasok',
            value: stats.total_pemasok,
            icon: Truck,
            color: 'purple',
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            text: 'text-purple-600 dark:text-purple-400',
            border: 'border-purple-200 dark:border-purple-800',
        },
        {
            key: 'produk_stok_menipis',
            title: 'Stok Menipis',
            value: stats.produk_stok_menipis,
            icon: AlertTriangle,
            color: 'yellow',
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            text: 'text-yellow-600 dark:text-yellow-400',
            border: 'border-yellow-200 dark:border-yellow-800',
        },
        {
            key: 'produk_stok_habis',
            title: 'Stok Habis',
            value: stats.produk_stok_habis,
            icon: Box,
            color: 'red',
            bg: 'bg-red-50 dark:bg-red-900/20',
            text: 'text-red-600 dark:text-red-400',
            border: 'border-red-200 dark:border-red-800',
        },
    ];

    // Quick Actions
    const quickActions = [
        { 
            to: '/produk/create', 
            icon: Package, 
            label: 'Tambah Produk', 
            color: 'blue',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            text: 'text-blue-600 dark:text-blue-400',
            hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
        },
        { 
            to: '/stok/masuk', 
            icon: TrendingUp, 
            label: 'Stok Masuk', 
            color: 'green',
            bg: 'bg-green-50 dark:bg-green-900/20',
            text: 'text-green-600 dark:text-green-400',
            hover: 'hover:bg-green-100 dark:hover:bg-green-900/30',
        },
        { 
            to: '/stok/keluar', 
            icon: TrendingDown, 
            label: 'Stok Keluar', 
            color: 'red',
            bg: 'bg-red-50 dark:bg-red-900/20',
            text: 'text-red-600 dark:text-red-400',
            hover: 'hover:bg-red-100 dark:hover:bg-red-900/30',
        },
        { 
            to: '/kategori', 
            icon: Tag, 
            label: 'Kategori', 
            color: 'purple',
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            text: 'text-purple-600 dark:text-purple-400',
            hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30',
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
            {/*  HEADER  */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Selamat datang di Manajemen Barang
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Update: {formatTime(lastUpdated)}
                    </span>
                    <button
                        onClick={fetchStats}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <StokAlert />
            </div>
            
            {/*  STAT CARDS  */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {statCards.map((card, index) => (
                    <div
                        key={card.key}
                        data-aos="fade-up"
                        data-aos-delay={index * 50}
                        className={`
                            bg-white dark:bg-gray-800 
                            rounded-xl shadow-sm hover:shadow-md 
                            border ${card.border}
                            p-4 transition-all duration-300 
                            hover:scale-[1.02] hover:shadow-lg
                        `}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {card.title}
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {card.value}
                                </p>
                            </div>
                            <div className={`
                                p-2 rounded-xl ${card.bg}
                            `}>
                                <card.icon className={`w-5 h-5 ${card.text}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <StokChart />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Quick Actions - MOBILE VS DESKTOP */}
                <div
                    data-aos="fade-up"
                    data-aos-delay="400"
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Box className="w-5 h-5 text-gray-500" />
                        Aksi Cepat
                    </h3>

                    {/* Mobile: 2 kolom */}
                    <div className="grid grid-cols-2 gap-2 sm:hidden">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.to}
                                className={`
                                    p-4 rounded-xl ${action.bg} ${action.hover} 
                                    transition-colors text-center
                                    ${action.text}
                                `}
                            >
                                <action.icon className="w-6 h-6 mx-auto mb-1" />
                                <span className="text-xs font-medium block leading-tight">
                                    {action.label}
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* Desktop: 4 kolom */}
                    <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.to}
                                className={`
                                    p-4 rounded-xl ${action.bg} ${action.hover} 
                                    transition-colors text-center
                                    ${action.text}
                                `}
                            >
                                <action.icon className="w-7 h-7 mx-auto mb-2" />
                                <span className="text-sm font-medium block">
                                    {action.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Aktivitas Terbaru */}
                <div
                    data-aos="fade-up"
                    data-aos-delay="400"
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-500" />
                            Aktivitas Terbaru
                        </h3>
                        <Link
                            to="/stok"
                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                        >
                            Lihat Semua
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                                    
                    {loadingActivities ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="text-center py-8">
                            <ShoppingCart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Belum ada aktivitas stok
                            </p>
                        </div>
                    ) : (
                        
                        //  UNTUK MOBILE
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {activities.map((item, index) => (
                                <div
                                    key={item.id}
                                    data-aos="fade-up"
                                    data-aos-delay={index * 50}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border border-gray-100 dark:border-gray-700"
                                >
                                    {/* Icon */}
                                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                                        item.tipe === 'masuk'
                                            ? 'bg-green-100 dark:bg-green-900/30'
                                            : 'bg-red-100 dark:bg-red-900/30'
                                    }`}>
                                        {item.tipe === 'masuk' ? (
                                            <ArrowUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <ArrowDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        )}
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                            {item.produk?.nama_produk || '-'}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                                            <span className={`font-semibold ${item.tipe === 'masuk' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {item.tipe === 'masuk' ? '+' : '-'}{item.jumlah}
                                            </span>
                                            <span>pcs</span>
                                            {item.batch && (
                                                <>
                                                    <span>•</span>
                                                    <span>Batch #{item.batch.id}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                        
                                    {/* Waktu & User */}
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatTimeShort(item.tanggal)}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[60px]">
                                            {item.user?.name || '-'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/*  FOOTER DASHBOARD  */}
            <div className="text-center text-xs text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p>© {new Date().getFullYear()} Manajemen Barang — Semua data real-time dari database</p>
            </div>
        </div>
    );
}