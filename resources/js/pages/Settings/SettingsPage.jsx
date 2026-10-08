import React, { useState, useEffect, useRef } from 'react';
import { 
    Sliders, Bell, Shield, Info, Monitor, Sun, Moon, Globe, 
    RotateCw, Eye, Check, Clock, Laptop, ShieldCheck, AlertTriangle,
    Camera, Volume2, Boxes, Coins, CalendarClock, Hash
} from 'lucide-react';
import { gunakanDarkMode } from '../../context/DarkModeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function SettingsPage() {
    const { darkMode, themeMode, setThemeMode } = gunakanDarkMode();
    const { language, setLanguage, t } = useLanguage();
    const [activeTab, setActiveTab] = useState('tampilan'); // 'tampilan' | 'gudang' | 'notifikasi' | 'keamanan' | 'tentang'
    const [currentTime, setCurrentTime] = useState('');

    // Settings state
    const [settings, setSettings] = useState({
        theme: themeMode || 'dark',
        language: language || 'id',
        auto_refresh: false,
        refresh_interval: '5', // Point 1: 1, 3, 5, 10 minutes
        show_stock: true,
        // Format & Display (Point 5 & 6)
        pagination_limit: '10', // Point 5: 10, 25, 50, 100 rows
        currency_format: 'IDR', // Point 6: IDR, USD
        number_format: 'id', // Point 6: id, en
        // Scanner & Kamera (Point 2)
        scanner_sound: true,
        scanner_camera: 'environment', // 'environment' | 'user'
        scanner_auto_submit: true,
        // Batch & Kadaluarsa (Point 3)
        batch_expiry_warning_days: '30', // 7, 14, 30, 60 days
        // Prefix Kode Gudang (Point 4)
        sku_prefix: 'PRD-',
        batch_prefix: 'LOT-',
        // Notifikasi
        notif_low_stock: true,
        notif_transactions: true,
        notif_sound: true,
        // Keamanan
        session_timeout: '120',
        two_factor: false,
    });

    const [savedNotice, setSavedNotice] = useState(false);
    const saveNoticeTimeoutRef = useRef(null);

    const triggerAutoSaveFeedback = () => {
        setSavedNotice(true);
        if (saveNoticeTimeoutRef.current) clearTimeout(saveNoticeTimeoutRef.current);
        saveNoticeTimeoutRef.current = setTimeout(() => {
            setSavedNotice(false);
        }, 2200);
    };

    useEffect(() => {
        // Sync setting with current active language
        setSettings(prev => ({ ...prev, language }));
    }, [language]);

    useEffect(() => {
        // Set formatted current time based on active language
        const updateTime = () => {
            const now = new Date();
            const daysId = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const monthsId = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            
            const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            const days = language === 'en' ? daysEn : daysId;
            const months = language === 'en' ? monthsEn : monthsId;

            const dayName = days[now.getDay()];
            const date = now.getDate();
            const monthName = months[now.getMonth()];
            const year = now.getFullYear();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const zone = language === 'en' ? 'UTC+7' : 'WIB';

            setCurrentTime(`${dayName}, ${date} ${monthName} ${year} ${hours}:${minutes} ${zone}`);
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);

        fetchSettings();

        return () => {
            clearInterval(interval);
            if (saveNoticeTimeoutRef.current) clearTimeout(saveNoticeTimeoutRef.current);
        };
    }, [language]);

    const fetchSettings = async () => {
        try {
            const savedSettings = localStorage.getItem('appSettings');
            let localObj = {};
            if (savedSettings) {
                localObj = JSON.parse(savedSettings);
                setSettings(prev => ({ ...prev, ...localObj, theme: themeMode, language }));
            }
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.success && data.data) {
                setSettings(prev => ({
                    ...prev,
                    ...data.data,
                    ...localObj,
                    theme: themeMode || localObj.theme || data.data.theme || 'dark',
                    language: language || localObj.language || data.data.language || 'id',
                }));
            }
        } catch (e) {
            console.error('Error fetching settings:', e);
        }
    };

    const handleUpdateSetting = (key, value) => {
        setSettings(prev => {
            const next = { ...prev, [key]: value };
            localStorage.setItem('appSettings', JSON.stringify(next));
            window.dispatchEvent(new CustomEvent('app-settings-changed', { detail: next }));
            
            triggerAutoSaveFeedback();

            // Asynchronously persist to backend API
            const token = localStorage.getItem('token');
            fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(next)
            }).catch(err => console.error('Error syncing settings:', err));

            return next;
        });
    };

    const handleToggle = (key) => {
        handleUpdateSetting(key, !settings[key]);
    };

    const handleThemeChange = (mode) => {
        handleUpdateSetting('theme', mode);
        setThemeMode(mode);
    };

    const handleLanguageChange = (newLang) => {
        handleUpdateSetting('language', newLang);
        setLanguage(newLang);
    };

    return (
        <div className="space-y-6 pb-12 max-w-7xl mx-auto">
            {/* Header & Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <nav className="flex items-center gap-2 text-xs text-gray-400 mb-1 font-medium">
                        <span className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors">{t('home')}</span>
                        <span>&gt;</span>
                        <span className="text-gray-700 dark:text-gray-300 font-semibold">{t('settingsTitle')}</span>
                    </nav>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        {t('settingsTitle')}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        {t('settingsSubtitle')}
                    </p>
                </div>

                {/* Top Right Live Clock & Auto-Save Badge */}
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                    {/* Auto-Save Status Badge */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-300 ${
                        savedNotice
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 shadow-xs'
                            : 'bg-white dark:bg-gray-800 border-gray-200/80 dark:border-gray-700 text-gray-500 dark:text-gray-400 shadow-xs'
                    }`}>
                        <span className="relative flex h-2 w-2">
                            {savedNotice && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            )}
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${savedNotice ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                        </span>
                        <span className="font-medium">
                            {savedNotice ? t('changesSaved') : t('autoSaveActive')}
                        </span>
                    </div>

                    {/* Live Clock Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium shadow-xs">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{currentTime}</span>
                    </div>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left Column: Category Vertical Navigation */}
                <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-2.5 sm:p-3 space-y-1">
                    
                    {/* Item 1: Tampilan */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('tampilan')}
                        className={`w-full text-left p-3.5 rounded-xl transition-all cursor-pointer flex items-start gap-3.5 ${
                            activeTab === 'tampilan'
                                ? 'bg-rose-50/80 dark:bg-rose-950/40 text-red-700 dark:text-red-400 border border-rose-100 dark:border-rose-900/40'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        <div className={`p-2 rounded-lg mt-0.5 ${
                            activeTab === 'tampilan' 
                                ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                            <Sliders className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold leading-tight">{t('tabAppearance')}</p>
                            <p className="text-[11px] text-gray-400 mt-1 leading-snug">{t('tabAppearanceSub')}</p>
                        </div>
                    </button>

                    {/* Item 2: Gudang & Scanner */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('gudang')}
                        className={`w-full text-left p-3.5 rounded-xl transition-all cursor-pointer flex items-start gap-3.5 ${
                            activeTab === 'gudang'
                                ? 'bg-rose-50/80 dark:bg-rose-950/40 text-red-700 dark:text-red-400 border border-rose-100 dark:border-rose-900/40'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        <div className={`p-2 rounded-lg mt-0.5 ${
                            activeTab === 'gudang' 
                                ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                            <Boxes className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold leading-tight">{t('tabWarehouse')}</p>
                            <p className="text-[11px] text-gray-400 mt-1 leading-snug">{t('tabWarehouseSub')}</p>
                        </div>
                    </button>

                    {/* Item 3: Notifikasi */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('notifikasi')}
                        className={`w-full text-left p-3.5 rounded-xl transition-all cursor-pointer flex items-start gap-3.5 ${
                            activeTab === 'notifikasi'
                                ? 'bg-rose-50/80 dark:bg-rose-950/40 text-red-700 dark:text-red-400 border border-rose-100 dark:border-rose-900/40'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        <div className={`p-2 rounded-lg mt-0.5 ${
                            activeTab === 'notifikasi' 
                                ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                            <Bell className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold leading-tight">{t('tabNotifications')}</p>
                            <p className="text-[11px] text-gray-400 mt-1 leading-snug">{t('tabNotificationsSub')}</p>
                        </div>
                    </button>

                    {/* Item 3: Keamanan */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('keamanan')}
                        className={`w-full text-left p-3.5 rounded-xl transition-all cursor-pointer flex items-start gap-3.5 ${
                            activeTab === 'keamanan'
                                ? 'bg-rose-50/80 dark:bg-rose-950/40 text-red-700 dark:text-red-400 border border-rose-100 dark:border-rose-900/40'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        <div className={`p-2 rounded-lg mt-0.5 ${
                            activeTab === 'keamanan' 
                                ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                            <Shield className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold leading-tight">{t('tabSecurity')}</p>
                            <p className="text-[11px] text-gray-400 mt-1 leading-snug">{t('tabSecuritySub')}</p>
                        </div>
                    </button>

                    {/* Item 4: Tentang Sistem */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('tentang')}
                        className={`w-full text-left p-3.5 rounded-xl transition-all cursor-pointer flex items-start gap-3.5 ${
                            activeTab === 'tentang'
                                ? 'bg-rose-50/80 dark:bg-rose-950/40 text-red-700 dark:text-red-400 border border-rose-100 dark:border-rose-900/40'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        <div className={`p-2 rounded-lg mt-0.5 ${
                            activeTab === 'tentang' 
                                ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                            <Info className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold leading-tight">{t('tabAbout')}</p>
                            <p className="text-[11px] text-gray-400 mt-1 leading-snug">{t('tabAboutSub')}</p>
                        </div>
                    </button>

                </div>

                {/* Right Column: Settings Content Panels */}
                <div className="lg:col-span-8 space-y-6">

                    {/* TAB: TAMPILAN */}
                    {activeTab === 'tampilan' && (
                        <div className="space-y-6">

                            {/* Section 1: Tampilan & Tema */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6 sm:p-7 space-y-5">
                                <div className="flex items-start gap-3.5">
                                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300">
                                        <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                            {t('sectionAppearance')}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {t('sectionAppearanceDesc')}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        {t('labelTheme')}
                                    </label>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                                        {/* 3 Theme Options */}
                                        <div className="md:col-span-7 grid grid-cols-3 gap-3">
                                            
                                            {/* Light Card */}
                                            <button
                                                type="button"
                                                onClick={() => handleThemeChange('light')}
                                                className={`relative flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                                                    settings.theme === 'light'
                                                        ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20 ring-2 ring-red-500/20 text-gray-900 dark:text-white'
                                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 hover:border-gray-300 text-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                {settings.theme === 'light' && (
                                                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">
                                                        <Check className="w-2.5 h-2.5" />
                                                    </span>
                                                )}
                                                <Sun className={`w-5 h-5 mb-2 ${settings.theme === 'light' ? 'text-amber-500' : 'text-gray-400'}`} />
                                                <span className="text-xs font-bold">{t('themeLight')}</span>
                                                <span className="text-[10px] text-gray-400 mt-0.5">{t('themeLightDesc')}</span>
                                            </button>

                                            {/* Dark Card */}
                                            <button
                                                type="button"
                                                onClick={() => handleThemeChange('dark')}
                                                className={`relative flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                                                    settings.theme === 'dark'
                                                        ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20 ring-2 ring-red-500/20 text-gray-900 dark:text-white'
                                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 hover:border-gray-300 text-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                {settings.theme === 'dark' && (
                                                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">
                                                        <Check className="w-2.5 h-2.5" />
                                                    </span>
                                                )}
                                                <Moon className={`w-5 h-5 mb-2 ${settings.theme === 'dark' ? 'text-red-500' : 'text-gray-400'}`} />
                                                <span className="text-xs font-bold">{t('themeDark')}</span>
                                                <span className="text-[10px] text-gray-400 mt-0.5">{t('themeDarkDesc')}</span>
                                            </button>

                                            {/* System Card */}
                                            <button
                                                type="button"
                                                onClick={() => handleThemeChange('system')}
                                                className={`relative flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                                                    settings.theme === 'system'
                                                        ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20 ring-2 ring-red-500/20 text-gray-900 dark:text-white'
                                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 hover:border-gray-300 text-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                {settings.theme === 'system' && (
                                                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">
                                                        <Check className="w-2.5 h-2.5" />
                                                    </span>
                                                )}
                                                <Laptop className={`w-5 h-5 mb-2 ${settings.theme === 'system' ? 'text-blue-500' : 'text-gray-400'}`} />
                                                <span className="text-xs font-bold">{t('themeSystem')}</span>
                                                <span className="text-[10px] text-gray-400 mt-0.5">{t('themeSystemDesc')}</span>
                                            </button>

                                        </div>

                                        {/* Mini Mockup Preview */}
                                        <div className="md:col-span-5 flex items-center gap-3.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200/70 dark:border-gray-700">
                                            {/* Miniature UI Mockup */}
                                            <div className="w-28 h-20 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 shadow-sm flex flex-shrink-0 bg-gray-900">
                                                {/* Mini Sidebar */}
                                                <div className="w-7 bg-red-800 p-1 flex flex-col gap-1 border-r border-red-900">
                                                    <div className="w-2.5 h-2.5 rounded bg-white/40 mb-1"></div>
                                                    <div className="w-4 h-1 rounded bg-white/60"></div>
                                                    <div className="w-3.5 h-1 rounded bg-white/30"></div>
                                                    <div className="w-4 h-1 rounded bg-white/30"></div>
                                                </div>
                                                {/* Mini Body */}
                                                <div className="flex-1 p-1.5 flex flex-col justify-between bg-gray-950">
                                                    <div className="flex items-center justify-between pb-1 border-b border-gray-800">
                                                        <div className="w-6 h-1 bg-gray-700 rounded"></div>
                                                        <div className="w-2 h-2 rounded-full bg-red-600"></div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-1 my-1">
                                                        <div className="h-4 rounded bg-gray-800 border border-gray-700/60"></div>
                                                        <div className="h-4 rounded bg-gray-800 border border-gray-700/60"></div>
                                                    </div>
                                                    <div className="h-3 rounded bg-gray-800/80"></div>
                                                </div>
                                            </div>

                                            {/* Preview Caption */}
                                            <div className="text-left">
                                                <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                                                    {darkMode ? t('darkModeActive') : t('lightModeActive')}
                                                </p>
                                                <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                                                    {darkMode ? t('darkPreviewDesc') : t('lightPreviewDesc')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Bahasa & Lokalisasi */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6 sm:p-7 space-y-4">
                                <div className="flex items-start gap-3.5">
                                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300">
                                        <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                            {t('sectionLanguage')}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {t('sectionLanguageDesc')}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2 max-w-md">
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        {t('labelLanguage')}
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={settings.language}
                                            onChange={(e) => handleLanguageChange(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition cursor-pointer"
                                        >
                                            <option value="id">🇮🇩 Bahasa Indonesia</option>
                                            <option value="en">🇺🇸 English (US)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Pengaturan Lainnya */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6 sm:p-7 space-y-4">
                                <div className="flex items-start gap-3.5">
                                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300">
                                        <Sliders className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                            {t('sectionOther')}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {t('sectionOtherDesc')}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    {/* Toggle: Refresh otomatis dashboard */}
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200/70 dark:border-gray-700 flex flex-col justify-between">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 mt-0.5 shadow-xs">
                                                    <RotateCw className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                                        {t('toggleAutoRefresh')}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                                        {t('toggleAutoRefreshDesc')}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Toggle switch */}
                                            <button
                                                type="button"
                                                onClick={() => handleToggle('auto_refresh')}
                                                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                                                    settings.auto_refresh ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-700'
                                                }`}
                                            >
                                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                                    settings.auto_refresh ? 'translate-x-5' : 'translate-x-0'
                                                }`} />
                                            </button>
                                        </div>

                                        {/* Point 1: Pilihan Interval Waktu */}
                                        {settings.auto_refresh && (
                                            <div className="mt-3 pt-3 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between gap-2">
                                                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                                                    {t('refreshInterval')}
                                                </label>
                                                <select
                                                    value={settings.refresh_interval}
                                                    onChange={(e) => handleUpdateSetting('refresh_interval', e.target.value)}
                                                    className="px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none cursor-pointer focus:ring-1 focus:ring-red-500"
                                                >
                                                    <option value="1">{t('interval1m')}</option>
                                                    <option value="3">{t('interval3m')}</option>
                                                    <option value="5">{t('interval5m')}</option>
                                                    <option value="10">{t('interval10m')}</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {/* Toggle: Tampilkan jumlah stok */}
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200/70 dark:border-gray-700">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 mt-0.5 shadow-xs">
                                                <Eye className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                                    {t('toggleShowStock')}
                                                </p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                    {t('toggleShowStockDesc')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Toggle switch */}
                                        <button
                                            type="button"
                                            onClick={() => handleToggle('show_stock')}
                                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                                                settings.show_stock ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-700'
                                            }`}
                                        >
                                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                                settings.show_stock ? 'translate-x-5' : 'translate-x-0'
                                            }`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Format Data & Tampilan Tabel (Point 5 & 6) */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6 sm:p-7 space-y-5">
                                <div className="flex items-start gap-3.5">
                                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300">
                                        <Coins className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                            {t('displayPreferences')}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {t('displayPreferencesDesc')}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                    {/* Pagination Limit */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                            {t('paginationLimit')}
                                        </label>
                                        <select
                                            value={settings.pagination_limit}
                                            onChange={(e) => handleUpdateSetting('pagination_limit', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition cursor-pointer"
                                        >
                                            <option value="10">{t('rows10')}</option>
                                            <option value="25">{t('rows25')}</option>
                                            <option value="50">{t('rows50')}</option>
                                            <option value="100">{t('rows100')}</option>
                                        </select>
                                    </div>

                                    {/* Currency Format */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                            {t('currencyFormat')}
                                        </label>
                                        <select
                                            value={settings.currency_format}
                                            onChange={(e) => handleUpdateSetting('currency_format', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition cursor-pointer"
                                        >
                                            <option value="IDR">{t('currencyIDR')}</option>
                                            <option value="USD">{t('currencyUSD')}</option>
                                        </select>
                                    </div>

                                    {/* Number Format */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                            {t('numberFormat')}
                                        </label>
                                        <select
                                            value={settings.number_format}
                                            onChange={(e) => handleUpdateSetting('number_format', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition cursor-pointer"
                                        >
                                            <option value="id">{t('numberFormatId')}</option>
                                            <option value="en">{t('numberFormatEn')}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Auto-save footer note */}
                            <div className="flex items-center justify-end gap-1.5 pt-1 text-[11px] text-gray-400 dark:text-gray-500">
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span>{t('autoSavedNote')}</span>
                            </div>

                        </div>
                    )}

                    {/* TAB: GUDANG & SCANNER (Points 2, 3, 4) */}
                    {activeTab === 'gudang' && (
                        <div className="space-y-6">

                            {/* Section 1: Konfigurasi Scanner QR Kamera (Point 2) */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6 sm:p-7 space-y-5">
                                <div className="flex items-start gap-3.5">
                                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300">
                                        <Camera className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                            {t('scannerSettings')}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {t('scannerSettingsDesc')}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-1">
                                    {/* Scanner Beep Sound */}
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200/70 dark:border-gray-700">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 mt-0.5 shadow-xs">
                                                <Volume2 className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                                    {t('scannerSound')}
                                                </p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                    {t('scannerSoundDesc')}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleToggle('scanner_sound')}
                                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                                                settings.scanner_sound ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-700'
                                            }`}
                                        >
                                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                                settings.scanner_sound ? 'translate-x-5' : 'translate-x-0'
                                            }`} />
                                        </button>
                                    </div>

                                    {/* Camera Lens Choice */}
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200/70 dark:border-gray-700">
                                        <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                            {t('scannerCamera')}
                                        </label>
                                        <select
                                            value={settings.scanner_camera}
                                            onChange={(e) => handleUpdateSetting('scanner_camera', e.target.value)}
                                            className="w-full max-w-md px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition cursor-pointer"
                                        >
                                            <option value="environment">{t('scannerCameraBack')}</option>
                                            <option value="user">{t('scannerCameraFront')}</option>
                                        </select>
                                    </div>

                                    {/* Auto Open Form */}
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200/70 dark:border-gray-700">
                                        <div>
                                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                                {t('scannerAutoOpen')}
                                            </p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">
                                                {t('scannerAutoOpenDesc')}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleToggle('scanner_auto_submit')}
                                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                                                settings.scanner_auto_submit ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-700'
                                            }`}
                                        >
                                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                                settings.scanner_auto_submit ? 'translate-x-5' : 'translate-x-0'
                                            }`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Pengaturan Batch & Masa Kadaluarsa (Point 3) */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6 sm:p-7 space-y-4">
                                <div className="flex items-start gap-3.5">
                                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300">
                                        <CalendarClock className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                            {t('batchSettings')}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {t('batchSettingsDesc')}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-1 max-w-md">
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        {t('expiryWarningDays')}
                                    </label>
                                    <select
                                        value={settings.batch_expiry_warning_days}
                                        onChange={(e) => handleUpdateSetting('batch_expiry_warning_days', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition cursor-pointer"
                                    >
                                        <option value="7">{t('days7')}</option>
                                        <option value="14">{t('days14')}</option>
                                        <option value="30">{t('days30')}</option>
                                        <option value="60">{t('days60')}</option>
                                    </select>
                                </div>
                            </div>

                            {/* Section 3: Standardisasi Kode & Prefix Gudang (Point 4) */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6 sm:p-7 space-y-4">
                                <div className="flex items-start gap-3.5">
                                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300">
                                        <Hash className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                            {t('codeStandards')}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {t('codeStandardsDesc')}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            {t('skuPrefix')}
                                        </label>
                                        <p className="text-[11px] text-gray-400 mb-2">
                                            {t('skuPrefixDesc')}
                                        </p>
                                        <input
                                            type="text"
                                            value={settings.sku_prefix}
                                            onChange={(e) => handleUpdateSetting('sku_prefix', e.target.value)}
                                            placeholder="PRD-"
                                            className="w-full px-3.5 py-2 rounded-xl text-xs font-mono bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            {t('batchPrefix')}
                                        </label>
                                        <p className="text-[11px] text-gray-400 mb-2">
                                            {t('batchPrefixDesc')}
                                        </p>
                                        <input
                                            type="text"
                                            value={settings.batch_prefix}
                                            onChange={(e) => handleUpdateSetting('batch_prefix', e.target.value)}
                                            placeholder="LOT-"
                                            className="w-full px-3.5 py-2 rounded-xl text-xs font-mono bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Auto-save footer note */}
                            <div className="flex items-center justify-end gap-1.5 pt-1 text-[11px] text-gray-400 dark:text-gray-500">
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span>{t('autoSavedNote')}</span>
                            </div>

                        </div>
                    )}

                    {/* TAB: NOTIFIKASI */}
                    {activeTab === 'notifikasi' && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6 sm:p-7 space-y-6">
                            <div className="flex items-start gap-3.5">
                                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300">
                                    <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                        {t('notifPreferences')}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {t('notifPreferencesDesc')}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200/70 dark:border-gray-700">
                                    <div>
                                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{t('notifLowStock')}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">{t('notifLowStockDesc')}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleToggle('notif_low_stock')}
                                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                                            settings.notif_low_stock ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-700'
                                        }`}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                            settings.notif_low_stock ? 'translate-x-5' : 'translate-x-0'
                                        }`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200/70 dark:border-gray-700">
                                    <div>
                                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{t('notifMutation')}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">{t('notifMutationDesc')}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleToggle('notif_transactions')}
                                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                                            settings.notif_transactions ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-700'
                                        }`}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                            settings.notif_transactions ? 'translate-x-5' : 'translate-x-0'
                                        }`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200/70 dark:border-gray-700">
                                    <div>
                                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{t('notifSound')}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">{t('notifSoundDesc')}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleToggle('notif_sound')}
                                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                                            settings.notif_sound ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-700'
                                        }`}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                            settings.notif_sound ? 'translate-x-5' : 'translate-x-0'
                                        }`} />
                                    </button>
                                </div>
                            </div>

                            {/* Auto-save footer note */}
                            <div className="flex items-center justify-end gap-1.5 pt-1 text-[11px] text-gray-400 dark:text-gray-500">
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span>{t('autoSavedNote')}</span>
                            </div>
                        </div>
                    )}

                    {/* TAB: KEAMANAN */}
                    {activeTab === 'keamanan' && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6 sm:p-7 space-y-6">
                            <div className="flex items-start gap-3.5">
                                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300">
                                    <ShieldCheck className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                        {t('securityTitle')}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {t('securityDesc')}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        {t('sessionTimeout')}
                                    </label>
                                    <select
                                        value={settings.session_timeout}
                                        onChange={(e) => handleUpdateSetting('session_timeout', e.target.value)}
                                        className="w-full max-w-md px-4 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition cursor-pointer"
                                    >
                                        <option value="30">{t('timeout30')}</option>
                                        <option value="60">{t('timeout60')}</option>
                                        <option value="120">{t('timeout120')}</option>
                                        <option value="480">{t('timeout480')}</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200/70 dark:border-gray-700">
                                    <div>
                                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{t('twoFactor')}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">{t('twoFactorDesc')}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleToggle('two_factor')}
                                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                                            settings.two_factor ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-700'
                                        }`}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                            settings.two_factor ? 'translate-x-5' : 'translate-x-0'
                                        }`} />
                                    </button>
                                </div>

                                <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 flex items-start gap-3">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                                        {t('changePwAlert')}
                                    </p>
                                </div>
                            </div>

                            {/* Auto-save footer note */}
                            <div className="flex items-center justify-end gap-1.5 pt-1 text-[11px] text-gray-400 dark:text-gray-500">
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span>{t('autoSavedNote')}</span>
                            </div>
                        </div>
                    )}

                    {/* TAB: TENTANG SISTEM */}
                    {activeTab === 'tentang' && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6 sm:p-7 space-y-6">
                            <div className="flex items-start gap-3.5">
                                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300">
                                    <Info className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                        {t('aboutTitle')}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {t('aboutDesc')}
                                    </p>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-100 dark:divide-gray-700/60 text-xs">
                                <div className="py-3 flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">{t('appNameField')}</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{t('appName')}</span>
                                </div>
                                <div className="py-3 flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">{t('appVersionField')}</span>
                                    <span className="font-mono font-bold text-red-600 dark:text-red-400">v2.4.0 (Stable)</span>
                                </div>
                                <div className="py-3 flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">{t('backendEngineField')}</span>
                                    <span className="text-gray-800 dark:text-gray-200">Laravel 11.x (PHP 8.2)</span>
                                </div>
                                <div className="py-3 flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">{t('frontendStackField')}</span>
                                    <span className="text-gray-800 dark:text-gray-200">React 19, Tailwind CSS v4, Lucide</span>
                                </div>
                                <div className="py-3 flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">{t('dbDriverField')}</span>
                                    <span className="text-gray-800 dark:text-gray-200">SQLite (Local Production Database)</span>
                                </div>
                                <div className="py-3 flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">{t('apiStatusField')}</span>
                                    <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        {t('apiStatusNormal')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}
