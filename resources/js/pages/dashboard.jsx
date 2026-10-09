import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Package, Layers, Tag, AlertTriangle, XCircle,
    Calendar, ArrowRight, ArrowUp, ArrowDown, CheckCircle2, RotateCw
} from 'lucide-react';
import { gunakanDarkMode } from '../context/DarkModeContext';
import { useLanguage } from '../context/LanguageContext';
import StokKategoriChart from '../components/dashboard/StokKategoriChart';
import StokMenipisTable from '../components/dashboard/StokMenipisTable';
import StokMovementChart from '../components/dashboard/StokMovementChart';
import AktivitasTerbaru from '../components/dashboard/AktivitasTerbaru';
import AksiCepat from '../components/dashboard/AksiCepat';
import FefoEarlyWarningWidget from '../components/dashboard/FefoEarlyWarningWidget';

export default function Dashboard() {
    const { darkMode } = gunakanDarkMode();
    const { t, language } = useLanguage();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [autoRefreshActive, setAutoRefreshActive] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(5);
    const [showStockCount, setShowStockCount] = useState(true);
    const [expiringBatches, setExpiringBatches] = useState([]);

    const [stats, setStats] = useState({
        total_produk: 0,
        total_stok: 0,
        total_kategori: 0,
        total_pemasok: 0,
        total_batch: 0,
        nilai_persediaan: null,
        raw_nilai_persediaan: 0,
        produk_stok_menipis: 0,
        produk_stok_habis: 0,
        trends: {
            total_produk: { val: '0%', up: true, isDanger: false },
            total_stok: { val: '0%', up: true, isDanger: false },
            total_kategori: { val: '0 Kategori', up: true, isDanger: false },
            stok_menipis: { val: 'Aman', up: false, isDanger: false },
            stok_habis: { val: 'Aman', up: false, isDanger: false },
        }
    });

    const [kategoriData, setKategoriData] = useState(null);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [movementData, setMovementData] = useState(null);
    const [activities, setActivities] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Sync app settings from localStorage and reactive events
    useEffect(() => {
        const syncSettings = (customData) => {
            let settingsObj = customData;
            if (!settingsObj) {
                try {
                    const saved = localStorage.getItem('appSettings');
                    settingsObj = saved ? JSON.parse(saved) : {};
                } catch (e) {
                    settingsObj = {};
                }
            }
            if (settingsObj) {
                if (typeof settingsObj.auto_refresh !== 'undefined') {
                    setAutoRefreshActive(Boolean(settingsObj.auto_refresh));
                }
                if (typeof settingsObj.refresh_interval !== 'undefined') {
                    setRefreshInterval(parseInt(settingsObj.refresh_interval, 10) || 5);
                }
                if (typeof settingsObj.show_stock !== 'undefined') {
                    setShowStockCount(Boolean(settingsObj.show_stock));
                }
            }
        };

        syncSettings();

        const handleSettingsEvent = (e) => syncSettings(e?.detail);
        const handleStorageEvent = (e) => {
            if (e.key === 'appSettings') syncSettings();
        };

        window.addEventListener('app-settings-changed', handleSettingsEvent);
        window.addEventListener('storage', handleStorageEvent);

        return () => {
            window.removeEventListener('app-settings-changed', handleSettingsEvent);
            window.removeEventListener('storage', handleStorageEvent);
        };
    }, []);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error(e);
            }
        }

        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const fetchAllDashboardData = useCallback(async (isSilent = false) => {
        if (!isSilent) {
            setLoading(true);
        } else {
            setIsRefreshing(true);
        }

        const token = localStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        };

        try {
            const [statsRes, chartRes, lowStockRes, movementRes, activitiesRes, expiringRes] = await Promise.allSettled([
                fetch('/api/dashboard/stats', { headers }),
                fetch('/api/dashboard/stok-chart', { headers }),
                fetch('/api/dashboard/low-stock', { headers }),
                fetch('/api/dashboard/movement-chart', { headers }),
                fetch('/api/dashboard/recent-activities', { headers }),
                fetch('/api/batch/expiring?days=30', { headers })
            ]);

            if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
                const res = await statsRes.value.json();
                if (res.data) {
                    setStats(prev => ({
                        ...prev,
                        total_produk: res.data.total_produk ?? prev.total_produk,
                        total_stok: res.data.total_stok ?? prev.total_stok,
                        total_kategori: res.data.total_kategori ?? prev.total_kategori,
                        total_pemasok: res.data.total_pemasok ?? prev.total_pemasok,
                        total_batch: res.data.total_batch ?? prev.total_batch,
                        nilai_persediaan: res.data.nilai_persediaan ?? prev.nilai_persediaan,
                        raw_nilai_persediaan: res.data.raw_nilai_persediaan ?? prev.raw_nilai_persediaan,
                        produk_stok_menipis: res.data.produk_stok_menipis ?? prev.produk_stok_menipis,
                        produk_stok_habis: res.data.produk_stok_habis ?? prev.produk_stok_habis,
                        trends: res.data.trends ?? prev.trends
                    }));
                }
            }

            if (chartRes.status === 'fulfilled' && chartRes.value.ok) {
                const res = await chartRes.value.json();
                setKategoriData(res.data || null);
            }

            if (lowStockRes.status === 'fulfilled' && lowStockRes.value.ok) {
                const res = await lowStockRes.value.json();
                setLowStockProducts(Array.isArray(res.data) ? res.data : []);
            }

            if (movementRes.status === 'fulfilled' && movementRes.value.ok) {
                const res = await movementRes.value.json();
                setMovementData(res.data || null);
            }

            if (activitiesRes.status === 'fulfilled' && activitiesRes.value.ok) {
                const res = await activitiesRes.value.json();
                setActivities(Array.isArray(res.data) ? res.data : []);
            }

            if (expiringRes.status === 'fulfilled' && expiringRes.value.ok) {
                const res = await expiringRes.value.json();
                setExpiringBatches(Array.isArray(res.data) ? res.data : []);
            }

            setLastUpdated(new Date());
        } catch (err) {
            console.error('Error fetching real dashboard data:', err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    // Initial data load
    useEffect(() => {
        fetchAllDashboardData();
    }, [fetchAllDashboardData]);

    // Auto-refresh interval (Point 1: 1m, 3m, 5m, 10m)
    useEffect(() => {
        if (!autoRefreshActive) return;

        const intervalMs = (refreshInterval || 5) * 60 * 1000;
        const interval = setInterval(() => {
            fetchAllDashboardData(true);
        }, intervalMs);

        return () => clearInterval(interval);
    }, [autoRefreshActive, refreshInterval, fetchAllDashboardData]);

    const dateFormatted = useMemo(() => {
        try {
            return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).format(currentTime);
        } catch {
            return language === 'en' ? 'Monday, 5 October 2026' : 'Senin, 5 Oktober 2026';
        }
    }, [currentTime, language]);

    const timeFormatted = useMemo(() => {
        try {
            const timePart = currentTime.toLocaleTimeString(language === 'en' ? 'en-US' : 'id-ID', {
                hour: '2-digit',
                minute: '2-digit'
            }).replace('.', ':');
            return `${timePart} ${language === 'en' ? 'UTC+7' : 'WIB'}`;
        } catch {
            return '12:30 WIB';
        }
    }, [currentTime, language]);

    const lastUpdatedFormatted = useMemo(() => {
        if (!lastUpdated) return '';
        const h = String(lastUpdated.getHours()).padStart(2, '0');
        const m = String(lastUpdated.getMinutes()).padStart(2, '0');
        const s = String(lastUpdated.getSeconds()).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }, [lastUpdated]);

    // Format number by locale
    const formatNumberBySetting = useCallback((num) => {
        if (num === null || typeof num === 'undefined') return '0';
        const locale = language === 'en' ? 'en-US' : 'id-ID';
        return Number(num).toLocaleString(locale);
    }, [language]);

    // 4 Stat Cards Utama terhubung 100% dengan database
    const statCards = [
        {
            title: t('totalProductsStat'),
            value: formatNumberBySetting(stats.total_produk || 0),
            icon: Package,
            trendVal: stats.trends?.total_produk?.val || '0%',
            trendUp: stats.trends?.total_produk?.up ?? true,
            isDanger: false,
            desc: language === 'en' ? 'registered in system' : 'terdaftar di sistem',
        },
        {
            title: t('totalStockStat'),
            value: showStockCount 
                ? formatNumberBySetting(stats.total_stok || 0)
                : '••••••',
            icon: Layers,
            trendVal: stats.trends?.total_stok?.val || '0%',
            trendUp: stats.trends?.total_stok?.up ?? true,
            isDanger: false,
            desc: language === 'en' ? 'inventory units' : 'unit persediaan',
        },
        {
            title: t('lowStockStat'),
            value: stats.produk_stok_menipis,
            icon: AlertTriangle,
            trendVal: stats.trends?.stok_menipis?.val || (stats.produk_stok_menipis > 0 ? (language === 'en' ? 'Restock Needed' : 'Perlu Restock') : (language === 'en' ? 'Healthy' : 'Aman')),
            trendUp: stats.produk_stok_menipis > 0,
            isDanger: stats.produk_stok_menipis > 0,
            desc: stats.produk_stok_menipis > 0 ? (language === 'en' ? 'below minimum' : 'di bawah minimum') : (language === 'en' ? 'normal condition' : 'kondisi normal'),
        },
        {
            title: t('outOfStockStat'),
            value: stats.produk_stok_habis,
            icon: XCircle,
            trendVal: stats.trends?.stok_habis?.val || (stats.produk_stok_habis > 0 ? (language === 'en' ? 'Empty' : 'Habis') : (language === 'en' ? 'Healthy' : 'Aman')),
            trendUp: stats.produk_stok_habis > 0,
            isDanger: stats.produk_stok_habis > 0,
            desc: stats.produk_stok_habis > 0 ? (language === 'en' ? 'order immediately' : 'segera pesan') : (language === 'en' ? 'zero items empty' : 'tidak ada yang 0'),
        },
    ];

    const hasLowOrEmptyStock = stats.produk_stok_menipis > 0 || stats.produk_stok_habis > 0;

    return (
        <div className="space-y-6 pb-8">
            {/* Top Greeting & Date Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                        {language === 'en' ? 'Welcome,' : 'Selamat datang,'}
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2 mt-0.5">
                        <span>{user?.name || 'Admin'}</span>
                        <span className="inline-block">👋</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
                        {language === 'en' 
                            ? 'Here is today’s real-time inventory summary from the database.' 
                            : 'Berikut ringkasan data inventaris barang Anda hari ini secara real-time dari database.'}
                    </p>
                </div>

                {/* Status Widgets: Auto-Refresh Indicator & Date/Time Widget */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Auto Refresh Status Pill */}
                    {autoRefreshActive ? (
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all text-xs font-semibold ${
                            darkMode 
                                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400' 
                                : 'bg-emerald-50/90 border-emerald-200 text-emerald-700 shadow-xs'
                        }`}>
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span>{t('autoRefreshActiveBadge')} ({refreshInterval}m)</span>
                            <span className="text-[11px] font-mono opacity-75 hidden sm:inline">
                                • {lastUpdatedFormatted}
                            </span>
                            <button
                                type="button"
                                onClick={() => fetchAllDashboardData(true)}
                                disabled={isRefreshing}
                                title={t('refreshNowBtn')}
                                className="p-1 hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50 rounded-lg transition ml-0.5 cursor-pointer"
                            >
                                <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    ) : (
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all text-xs font-medium ${
                            darkMode 
                                ? 'bg-gray-900/90 border-gray-800 text-gray-400' 
                                : 'bg-gray-50 border-gray-200 text-gray-500 shadow-xs'
                        }`}>
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                            <span>{t('autoRefreshOffBadge')}</span>
                            <button
                                type="button"
                                onClick={() => fetchAllDashboardData(true)}
                                disabled={isRefreshing}
                                title={t('refreshNowBtn')}
                                className="p-1 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 rounded-lg transition ml-0.5 cursor-pointer"
                            >
                                <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    )}

                    {/* Date & Time Widget */}
                    <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all ${
                        darkMode 
                            ? 'bg-gray-900/90 border-gray-800 text-gray-200' 
                            : 'bg-white border-slate-100 shadow-xs text-gray-800'
                    }`}>
                        <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                            <div className="text-xs font-bold leading-tight">
                                {dateFormatted}
                            </div>
                            <div className="text-[11px] text-gray-400 dark:text-gray-500 font-mono leading-tight mt-0.5">
                                {timeFormatted}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 1: 4 Stat Cards Utama (100% Database Values & Symmetrical) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {statCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={idx}
                            className={`p-4 rounded-2xl border transition-all duration-200 flex items-center gap-3.5 ${
                                darkMode 
                                    ? 'bg-gray-900 border-gray-800 hover:border-gray-700' 
                                    : 'bg-white border-slate-100 shadow-xs hover:shadow-md'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                card.isDanger 
                                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' 
                                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                            }`}>
                                <Icon className="w-6 h-6 stroke-[1.8]" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 truncate leading-tight">
                                    {card.title}
                                </p>
                                <p className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mt-1 truncate font-mono">
                                    {card.value}
                                </p>
                                <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-[11px] font-medium leading-tight">
                                    <span className={card.isDanger ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
                                        {card.trendVal}
                                    </span>
                                    <span className="text-gray-400 dark:text-gray-500 font-normal truncate">
                                        {card.desc}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Row 2: Middle Section (Stok per Kategori & Stok Menipis) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left: Stok per Kategori (Database) */}
                <div className="lg:col-span-7">
                    <StokKategoriChart chartData={kategoriData} darkMode={darkMode} />
                </div>

                {/* Right: Stok Menipis (Database) */}
                <div className="lg:col-span-5">
                    <StokMenipisTable products={lowStockProducts} darkMode={darkMode} showStock={showStockCount} />
                </div>
            </div>

            {/* Row 3: Mid-Bottom Section (Tren Pergerakan Stok & Peringatan Dini FEFO) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left: Tren Stok Masuk & Keluar (Database) */}
                <div className="lg:col-span-7">
                    <StokMovementChart movementData={movementData} darkMode={darkMode} />
                </div>

                {/* Right: Peringatan Dini FEFO (Database) */}
                <div className="lg:col-span-5">
                    <FefoEarlyWarningWidget batches={expiringBatches} darkMode={darkMode} />
                </div>
            </div>

            {/* Row 4: Bottom Section (Aktivitas Terbaru & Aksi Cepat Operasional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Aktivitas Terbaru (Database) */}
                <AktivitasTerbaru activities={activities} darkMode={darkMode} />

                {/* 2. Aksi Cepat Operasional Gudang */}
                <AksiCepat darkMode={darkMode} />
            </div>

            {/* Row 4: Bottom Alert Notification Strip (100% Real Database Condition) */}
            {hasLowOrEmptyStock ? (
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    darkMode 
                        ? 'bg-rose-950/20 border-rose-900/40 text-rose-200' 
                        : 'bg-[#fff4f4] border-rose-200/70 text-rose-950 shadow-xs'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-xs">
                            !
                        </div>
                        <p className="text-xs sm:text-sm font-medium leading-relaxed">
                            Terdapat <span className="font-bold text-red-600 dark:text-red-400">{stats.produk_stok_menipis} produk</span> dengan stok menipis dan <span className="font-bold text-red-600 dark:text-red-400">{stats.produk_stok_habis} produk</span> yang stoknya habis di database. Segera lakukan pengecekan untuk menghindari kekosongan inventaris.
                        </p>
                    </div>

                    <Link
                        to="/stok"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow flex-shrink-0 cursor-pointer"
                    >
                        <span>Lihat Detail</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                    darkMode 
                        ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200' 
                        : 'bg-[#f0fdf4] border-emerald-200/70 text-emerald-900 shadow-xs'
                }`}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <p className="text-xs sm:text-sm font-medium">
                        Seluruh inventaris barang berada dalam kondisi optimal. Tidak ada produk dengan stok di bawah batas minimum.
                    </p>
                </div>
            )}
        </div>
    );
}