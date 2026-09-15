import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Package, Tag, Truck, AlertTriangle, TrendingUp, TrendingDown,
    Box, ShoppingCart, Clock, ArrowRight, ArrowDown, ArrowUp, RefreshCw
} from 'lucide-react';
import Swal from 'sweetalert2';
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

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/dashboard/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });
            if (!response.ok) throw new Error('Gagal mengambil data statistik');
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
    }, []);

    const fetchActivities = useCallback(async () => {
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
            setActivities(response.ok ? (result.data || []) : []);
        } catch (error) {
            console.error('Error fetching activities:', error);
            setActivities([]);
        } finally {
            setLoadingActivities(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        fetchActivities();
    }, [fetchStats, fetchActivities]);

    const formatTime = (date) => date ? new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-';
    const formatDateTime = (dateString) => dateString ? new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';

    const statCards = [
        { title: 'Total Produk', value: stats.total_produk, icon: Package, border: 'border-l-4 border-l-blue-600' },
        { title: 'Total Kategori', value: stats.total_kategori, icon: Tag, border: 'border-l-4 border-l-emerald-600' },
        { title: 'Total Pemasok', value: stats.total_pemasok, icon: Truck, border: 'border-l-4 border-l-purple-600' },
        { title: 'Stok Menipis', value: stats.produk_stok_menipis, icon: AlertTriangle, border: 'border-l-4 border-l-amber-500', isWarning: stats.produk_stok_menipis > 0 },
        { title: 'Stok Habis', value: stats.produk_stok_habis, icon: Box, border: 'border-l-4 border-l-rose-600', isDanger: stats.produk_stok_habis > 0 },
    ];

    const quickActions = [
        { to: '/produk/create', icon: Package, label: 'Tambah Produk' },
        { to: '/stok/masuk', icon: TrendingUp, label: 'Stok Masuk' },
        { to: '/stok/keluar', icon: TrendingDown, label: 'Stok Keluar' },
        { to: '/kategori', icon: Tag, label: 'Kategori' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-sm text-gray-500">
                Memuat data gudang...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header Ringkas */}
            <div className="flex justify-between items-center border-b pb-3 border-gray-200 dark:border-gray-800">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Manajemen Barang</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ringkasan inventaris real-time</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {formatTime(lastUpdated)}
                    </span>
                    <button 
                        onClick={() => { fetchStats(); fetchActivities(); }} 
                        className="p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <StokAlert />

            {/* Stat Cards - Flat & Industrial */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {statCards.map((card, idx) => (
                    <div 
                        key={idx} 
                        className={`bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 ${card.border}`}
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{card.title}</span>
                            <card.icon className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className={`text-2xl font-bold font-mono ${card.isDanger ? 'text-rose-600' : card.isWarning ? 'text-amber-600' : ''}`}>
                                {card.value}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-4">
                <StokChart />
            </div>

            {/* Quick Actions & Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Actions (Compact Column) */}
                <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Box className="w-4 h-4 text-blue-600" /> Aksi Cepat
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                        {quickActions.map((action, idx) => (
                            <Link
                                key={idx}
                                to={action.to}
                                className="flex flex-col items-center justify-center p-3 rounded border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-gray-700 transition-colors text-center"
                            >
                                <action.icon className="w-5 h-5 text-gray-700 dark:text-gray-300 mb-1" />
                                <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{action.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Activity Table (High Density) */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-4 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-600" /> Log Aktivitas Terakhir
                            </h3>
                            <Link to="/stok" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                Lihat Semua <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>

                        {loadingActivities ? (
                            <div className="text-center py-6 text-xs text-gray-400">Memuat log...</div>
                        ) : activities.length === 0 ? (
                            <div className="text-center py-6 text-xs text-gray-400">Belum ada aktivitas persediaan.</div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[260px] overflow-y-auto">
                                {activities.map((item) => (
                                    <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className={`p-1 rounded ${item.tipe === 'masuk' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'}`}>
                                                {item.tipe === 'masuk' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                            </span>
                                            <div className="truncate">
                                                <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{item.produk?.nama_produk || '-'}</p>
                                                <p className="text-[11px] text-gray-400">
                                                    {item.batch ? `Batch #${item.batch.id}` : 'Reguler'} • oleh <span className="text-gray-600 dark:text-gray-300">{item.user?.name || 'Sistem'}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 pl-2">
                                            <span className={`font-mono font-bold ${item.tipe === 'masuk' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                {item.tipe === 'masuk' ? '+' : '-'}{item.jumlah} pcs
                                            </span>
                                            <p className="text-[10px] text-gray-400">{formatDateTime(item.tanggal)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}