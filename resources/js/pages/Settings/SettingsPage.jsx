import React, { useState, useEffect, useRef } from 'react';
import { 
    Sliders, Bell, Shield, Info, Monitor, Sun, Moon, Globe, 
    RotateCw, Eye, Check, Clock, Laptop, ShieldCheck, AlertTriangle,
    Camera, Volume2, Boxes, Rows, CalendarClock, ArrowUpDown,
    Database, Printer, Download, Layers, Hash, Compass, BookOpen,
    Building2, FileText, CheckCircle2, Save, FileCode
} from 'lucide-react';
import Swal from 'sweetalert2';
import { gunakanDarkMode } from '../../context/DarkModeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function SettingsPage() {
    const { darkMode, themeMode, setThemeMode } = gunakanDarkMode();
    const { language, setLanguage, t } = useLanguage();
    const [activeTab, setActiveTab] = useState('tampilan'); // 'tampilan' | 'gudang' | 'notifikasi' | 'keamanan' | 'data' | 'perusahaan' | 'tentang'
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
        table_density: 'comfortable', // 'comfortable' | 'compact'
        default_sort: 'newest', // 'newest' | 'lowest_stock' | 'highest_stock' | 'name_asc'
        date_format: 'DD/MM/YYYY', // Point 4: DD/MM/YYYY, YYYY-MM-DD, DD MMMM YYYY
        // Gudang Lanjutan & Inventaris (Point 1, 3, 5)
        default_min_stock: '5', // Point 3: 5, 10, 20, 50
        qr_label_size: 'medium', // Point 1: small, medium, standard
        qr_show_product_info: true, // Point 1
        fifo_enforcement: true, // Point 5: FIFO recommendations
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
        app_version: '2.5.2',
    });

    // Identitas Perusahaan & Kop Surat (Point 4)
    const [company, setCompany] = useState({
        company_name: 'PT. LOGISTIK JAYA ABADI',
        company_tagline: 'Divisi Pergudangan & Logistik Modern',
        company_address: 'Jl. Industri Pergudangan No. 88, Blok B, Jakarta Barat',
        company_phone: '021-5558899 / 0812-3456-7890',
        company_email: 'gudang@logistikjaya.co.id',
        company_pic: 'Admin User',
        company_pic_role: 'Kepala Logistik & Pergudangan',
        company_note: 'Barang yang telah diterima harap diperiksa secara teliti sesuai dokumen bukti fisik ini.'
    });
    const [companyLoading, setCompanyLoading] = useState(false);
    const [sqlBackupLoading, setSqlBackupLoading] = useState(false);
    const [sqliteBackupLoading, setSqliteBackupLoading] = useState(false);

    const [backupLoading, setBackupLoading] = useState(false);
    const [cacheLoading, setCacheLoading] = useState(false);
    const [savedNotice, setSavedNotice] = useState(false);
    const saveNoticeTimeoutRef = useRef(null);

    const handleSaveCompany = async (e) => {
        if (e) e.preventDefault();
        setCompanyLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/settings/company', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(company)
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('companyProfile', JSON.stringify(data.data));
                window.dispatchEvent(new CustomEvent('company-profile-updated', { detail: data.data }));
                triggerAutoSaveFeedback();
                Swal.fire({
                    icon: 'success',
                    title: 'Tersimpan!',
                    text: 'Identitas perusahaan dan kop surat berhasil diperbarui.',
                    timer: 1800,
                    showConfirmButton: false
                });
            }
        } catch (err) {
            console.error('Error saving company:', err);
            Swal.fire('Error', 'Gagal menyimpan identitas perusahaan.', 'error');
        } finally {
            setCompanyLoading(false);
        }
    };

    const handleDownloadSqlBackup = async () => {
        setSqlBackupLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/settings/backup-sql', {
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            if (!res.ok) throw new Error('Gagal mengunduh cadangan SQL');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-database-${new Date().toISOString().slice(0, 10)}.sql`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            Swal.fire({
                title: 'Berhasil!',
                text: 'File database SQL (.sql) berhasil diunduh.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error('SQL Backup error:', err);
            Swal.fire('Error', 'Gagal mengunduh berkas SQL.', 'error');
        } finally {
            setSqlBackupLoading(false);
        }
    };

    const handleDownloadSqliteBackup = async () => {
        setSqliteBackupLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/settings/backup-sqlite', {
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            if (!res.ok) throw new Error('Gagal mengunduh berkas SQLite');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `database-inventaris-${new Date().toISOString().slice(0, 10)}.sqlite`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            Swal.fire({
                title: 'Berhasil!',
                text: 'Berkas database SQLite (.sqlite) berhasil diunduh.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error('SQLite Backup error:', err);
            Swal.fire('Error', 'Gagal mengunduh berkas SQLite.', 'error');
        } finally {
            setSqliteBackupLoading(false);
        }
    };

    const handleDownloadBackup = async () => {
        setBackupLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/settings/backup', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (!res.ok) throw new Error('Gagal mengunduh cadangan data');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-gudang-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            Swal.fire({
                title: 'Berhasil!',
                text: t('backupSuccess'),
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error('Backup error:', err);
            Swal.fire('Error', 'Gagal mengunduh cadangan data.', 'error');
        } finally {
            setBackupLoading(false);
        }
    };

    const handleClearCache = async () => {
        setCacheLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/settings/clear-cache', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await res.json();
            if (data.success) {
                Swal.fire({
                    title: 'Berhasil!',
                    text: t('cacheCleared'),
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                throw new Error(data.message || 'Gagal');
            }
        } catch (err) {
            console.error('Clear cache error:', err);
            Swal.fire('Error', 'Gagal membersihkan cache aplikasi.', 'error');
        } finally {
            setCacheLoading(false);
        }
    };

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

            // Sync company profile
            const savedCompany = localStorage.getItem('companyProfile');
            if (savedCompany) {
                try {
                    setCompany(prev => ({ ...prev, ...JSON.parse(savedCompany) }));
                } catch (e) {}
            }
            const resCompany = await fetch('/api/settings/company');
            const dataCompany = await resCompany.json();
            if (dataCompany.success && dataCompany.data) {
                setCompany(prev => ({ ...prev, ...dataCompany.data }));
                localStorage.setItem('companyProfile', JSON.stringify(dataCompany.data));
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

                    {/* Item: Keamanan */}
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

                    {/* Item: Manajemen Data & Cadangan (Point 2) */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('data')}
                        className={`w-full text-left p-3.5 rounded-xl transition-all cursor-pointer flex items-start gap-3.5 ${
                            activeTab === 'data'
                                ? 'bg-rose-50/80 dark:bg-rose-950/40 text-red-700 dark:text-red-400 border border-rose-100 dark:border-rose-900/40'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        <div className={`p-2 rounded-lg mt-0.5 ${
                            activeTab === 'data' 
                                ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                            <Database className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold leading-tight">{t('tabDataManagement')}</p>
                            <p className="text-[11px] text-gray-400 mt-1 leading-snug">{t('tabDataManagementSub')}</p>
                        </div>
                    </button>

                    {/* Item: Identitas Perusahaan & Kop Surat (Point 4) */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('perusahaan')}
                        className={`w-full text-left p-3.5 rounded-xl transition-all cursor-pointer flex items-start gap-3.5 ${
                            activeTab === 'perusahaan'
                                ? 'bg-rose-50/80 dark:bg-rose-950/40 text-red-700 dark:text-red-400 border border-rose-100 dark:border-rose-900/40'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        <div className={`p-2 rounded-lg mt-0.5 ${
                            activeTab === 'perusahaan' 
                                ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                            <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold leading-tight">{t('tabCompany') || 'Profil & Kop Surat'}</p>
                            <p className="text-[11px] text-gray-400 mt-1 leading-snug">{t('tabCompanySub') || 'Identitas cetak surat & tanda terima'}</p>
                        </div>
                    </button>

                    {/* Item: Tentang Sistem */}
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

                                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
                                        {/* 4 Theme Options */}
                                        <div className="xl:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            
                                            {/* Light Card */}
                                            <button
                                                type="button"
                                                onClick={() => handleThemeChange('light')}
                                                className={`relative flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                                                    settings.theme === 'light'
                                                        ? 'border-red-500 bg-red-50/40 dark:bg-red-950/20 ring-2 ring-red-500/20 text-gray-900 dark:text-white shadow-sm'
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
                                                <span className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{t('themeLightDesc')}</span>
                                            </button>

                                            {/* Dark Card */}
                                            <button
                                                type="button"
                                                onClick={() => handleThemeChange('dark')}
                                                className={`relative flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                                                    settings.theme === 'dark'
                                                        ? 'border-red-500 bg-red-50/40 dark:bg-red-950/20 ring-2 ring-red-500/20 text-gray-900 dark:text-white shadow-sm'
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
                                                <span className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{t('themeDarkDesc')}</span>
                                            </button>

                                            {/* Midnight Navy Card */}
                                            <button
                                                type="button"
                                                onClick={() => handleThemeChange('navy')}
                                                className={`relative flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                                                    settings.theme === 'navy'
                                                        ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/20 text-gray-900 dark:text-white shadow-sm'
                                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 hover:border-gray-300 text-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                {settings.theme === 'navy' && (
                                                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                                                        <Check className="w-2.5 h-2.5" />
                                                    </span>
                                                )}
                                                <Compass className={`w-5 h-5 mb-2 ${settings.theme === 'navy' ? 'text-blue-500' : 'text-gray-400'}`} />
                                                <span className="text-xs font-bold">{t('themeNavy')}</span>
                                                <span className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{t('themeNavyDesc')}</span>
                                            </button>

                                            {/* Warm Paper Card */}
                                            <button
                                                type="button"
                                                onClick={() => handleThemeChange('warm')}
                                                className={`relative flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                                                    settings.theme === 'warm'
                                                        ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-600/20 text-gray-900 dark:text-white shadow-sm'
                                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 hover:border-gray-300 text-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                {settings.theme === 'warm' && (
                                                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">
                                                        <Check className="w-2.5 h-2.5" />
                                                    </span>
                                                )}
                                                <BookOpen className={`w-5 h-5 mb-2 ${settings.theme === 'warm' ? 'text-amber-600' : 'text-gray-400'}`} />
                                                <span className="text-xs font-bold">{t('themeWarm')}</span>
                                                <span className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{t('themeWarmDesc')}</span>
                                            </button>

                                        </div>

                                        {/* Mini Mockup Preview */}
                                        <div className="xl:col-span-4 flex items-center gap-3.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200/70 dark:border-gray-700">
                                            {/* Miniature UI Mockup */}
                                            <div className={`w-28 h-20 rounded-lg overflow-hidden border shadow-sm flex flex-shrink-0 transition-colors ${
                                                settings.theme === 'navy' 
                                                    ? 'bg-[#080e1e] border-[#1f356c]'
                                                    : settings.theme === 'warm'
                                                    ? 'bg-[#f5f0e6] border-[#ded5c2]'
                                                    : settings.theme === 'light'
                                                    ? 'bg-slate-100 border-gray-300'
                                                    : 'bg-gray-950 border-gray-700'
                                            }`}>
                                                {/* Mini Sidebar */}
                                                <div className={`w-7 p-1 flex flex-col gap-1 border-r ${
                                                    settings.theme === 'navy'
                                                        ? 'bg-[#0c162e] border-[#1f356c]'
                                                        : settings.theme === 'warm'
                                                        ? 'bg-[#eae3d2] border-[#ded5c2]'
                                                        : settings.theme === 'light'
                                                        ? 'bg-red-600 border-red-700'
                                                        : 'bg-red-800 border-red-900'
                                                }`}>
                                                    <div className={`w-2.5 h-2.5 rounded mb-1 ${settings.theme === 'warm' ? 'bg-amber-800/40' : 'bg-white/40'}`}></div>
                                                    <div className={`w-4 h-1 rounded ${settings.theme === 'warm' ? 'bg-amber-800/50' : 'bg-white/60'}`}></div>
                                                    <div className={`w-3.5 h-1 rounded ${settings.theme === 'warm' ? 'bg-amber-800/30' : 'bg-white/30'}`}></div>
                                                    <div className={`w-4 h-1 rounded ${settings.theme === 'warm' ? 'bg-amber-800/30' : 'bg-white/30'}`}></div>
                                                </div>
                                                {/* Mini Body */}
                                                <div className={`flex-1 p-1.5 flex flex-col justify-between ${
                                                    settings.theme === 'navy'
                                                        ? 'bg-[#080e1e]'
                                                        : settings.theme === 'warm'
                                                        ? 'bg-[#f5f0e6]'
                                                        : settings.theme === 'light'
                                                        ? 'bg-white'
                                                        : 'bg-gray-950'
                                                }`}>
                                                    <div className={`flex items-center justify-between pb-1 border-b ${
                                                        settings.theme === 'navy'
                                                            ? 'border-[#1f356c]'
                                                            : settings.theme === 'warm'
                                                            ? 'border-[#ded5c2]'
                                                            : settings.theme === 'light'
                                                            ? 'border-gray-200'
                                                            : 'border-gray-800'
                                                    }`}>
                                                        <div className={`w-6 h-1 rounded ${settings.theme === 'warm' ? 'bg-stone-300' : 'bg-gray-700'}`}></div>
                                                        <div className={`w-2 h-2 rounded-full ${settings.theme === 'navy' ? 'bg-blue-500' : settings.theme === 'warm' ? 'bg-amber-600' : 'bg-red-600'}`}></div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-1 my-1">
                                                        <div className={`h-4 rounded border ${
                                                            settings.theme === 'navy'
                                                                ? 'bg-[#122044] border-[#1f356c]'
                                                                : settings.theme === 'warm'
                                                                ? 'bg-[#fffdfa] border-[#ded5c2]'
                                                                : settings.theme === 'light'
                                                                ? 'bg-gray-50 border-gray-200'
                                                                : 'bg-gray-800 border-gray-700/60'
                                                        }`}></div>
                                                        <div className={`h-4 rounded border ${
                                                            settings.theme === 'navy'
                                                                ? 'bg-[#122044] border-[#1f356c]'
                                                                : settings.theme === 'warm'
                                                                ? 'bg-[#fffdfa] border-[#ded5c2]'
                                                                : settings.theme === 'light'
                                                                ? 'bg-gray-50 border-gray-200'
                                                                : 'bg-gray-800 border-gray-700/60'
                                                        }`}></div>
                                                    </div>
                                                    <div className={`h-3 rounded ${
                                                        settings.theme === 'navy'
                                                            ? 'bg-[#182b58]'
                                                            : settings.theme === 'warm'
                                                            ? 'bg-[#eae3d2]'
                                                            : settings.theme === 'light'
                                                            ? 'bg-gray-100'
                                                            : 'bg-gray-800/80'
                                                    }`}></div>
                                                </div>
                                            </div>

                                            {/* Preview Caption */}
                                            <div className="text-left">
                                                <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                                                    {settings.theme === 'navy' 
                                                        ? t('navyModeActive') 
                                                        : settings.theme === 'warm'
                                                        ? t('warmModeActive')
                                                        : settings.theme === 'light'
                                                        ? t('lightModeActive')
                                                        : t('darkModeActive')}
                                                </p>
                                                <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                                                    {settings.theme === 'navy'
                                                        ? t('navyPreviewDesc')
                                                        : settings.theme === 'warm'
                                                        ? t('warmPreviewDesc')
                                                        : settings.theme === 'light'
                                                        ? t('lightPreviewDesc')
                                                        : t('darkPreviewDesc')}
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
                                        <Rows className="w-5 h-5 text-gray-600 dark:text-gray-300" />
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

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
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

                                    {/* Table Row Density */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                            {t('tableDensity')}
                                        </label>
                                        <select
                                            value={settings.table_density || 'comfortable'}
                                            onChange={(e) => handleUpdateSetting('table_density', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition cursor-pointer"
                                        >
                                            <option value="comfortable">{t('densityComfortable')}</option>
                                            <option value="compact">{t('densityCompact')}</option>
                                        </select>
                                    </div>

                                    {/* Default Sort Order */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                            {t('defaultSort')}
                                        </label>
                                        <select
                                            value={settings.default_sort || 'newest'}
                                            onChange={(e) => handleUpdateSetting('default_sort', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition cursor-pointer"
                                        >
                                            <option value="newest">{t('sortNewest')}</option>
                                            <option value="lowest_stock">{t('sortLowestStock')}</option>
                                            <option value="highest_stock">{t('sortHighestStock')}</option>
                                            <option value="name_asc">{t('sortNameAsc')}</option>
                                        </select>
                                    </div>

                                    {/* Format Tanggal Transaksi (Point 4) */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                            {t('dateFormat')}
                                        </label>
                                        <select
                                            value={settings.date_format || 'DD/MM/YYYY'}
                                            onChange={(e) => handleUpdateSetting('date_format', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition cursor-pointer"
                                        >
                                            <option value="DD/MM/YYYY">{t('dateFormatId')}</option>
                                            <option value="YYYY-MM-DD">{t('dateFormatIso')}</option>
                                            <option value="DD MMMM YYYY">{t('dateFormatLong')}</option>
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

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
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

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            {t('defaultMinStock')}
                                        </label>
                                        <p className="text-[11px] text-gray-400 mb-2">
                                            {t('defaultMinStockDesc')}
                                        </p>
                                        <select
                                            value={settings.default_min_stock || '5'}
                                            onChange={(e) => handleUpdateSetting('default_min_stock', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition cursor-pointer"
                                        >
                                            <option value="5">{t('minStock5')}</option>
                                            <option value="10">{t('minStock10')}</option>
                                            <option value="20">{t('minStock20')}</option>
                                            <option value="50">{t('minStock50')}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Preferensi Cetak Label QR Kardus & Rak (Point 1) */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6 sm:p-7 space-y-4">
                                <div className="flex items-start gap-3.5">
                                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300">
                                        <Printer className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                            {t('qrPrintSettings')}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {t('qrPrintDesc')}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                            {t('qrLabelSize')}
                                        </label>
                                        <select
                                            value={settings.qr_label_size || 'medium'}
                                            onChange={(e) => handleUpdateSetting('qr_label_size', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition cursor-pointer"
                                        >
                                            <option value="small">{t('sizeSmall')}</option>
                                            <option value="medium">{t('sizeMedium')}</option>
                                            <option value="standard">{t('sizeStandard')}</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200/70 dark:border-gray-700 self-end">
                                        <div>
                                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                                {t('qrShowInfo')}
                                            </p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">
                                                {t('qrShowInfoDesc')}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleToggle('qr_show_product_info')}
                                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                                                settings.qr_show_product_info ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-700'
                                            }`}
                                        >
                                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                                settings.qr_show_product_info ? 'translate-x-5' : 'translate-x-0'
                                            }`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Kebijakan Pengeluaran Barang (FIFO) (Point 5) */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6 sm:p-7 space-y-4">
                                <div className="flex items-start gap-3.5">
                                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300">
                                        <Layers className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                            {t('fifoPolicy')}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {t('fifoPolicyDesc')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200/70 dark:border-gray-700">
                                    <div>
                                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                            {t('fifoEnforce')}
                                        </p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                            {t('fifoEnforceDesc')}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleToggle('fifo_enforcement')}
                                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                                            settings.fifo_enforcement ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-700'
                                        }`}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                            settings.fifo_enforcement ? 'translate-x-5' : 'translate-x-0'
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

                    {/* TAB: MANAJEMEN DATA & CADANGAN (Point 2) */}
                    {activeTab === 'data' && (
                        <div className="space-y-6">
                            {/* Card Backup Database Lengkap */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6 sm:p-7 space-y-5">
                                <div className="flex items-start gap-3.5">
                                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300">
                                        <Database className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                            {t('backupTitle')}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {t('backupDesc')}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Option 1: Backup SQL */}
                                    <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200/70 dark:border-gray-700 flex flex-col justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">.SQL Dump</span>
                                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                                    Cadangkan Database SQL 1-Klik
                                                </p>
                                            </div>
                                            <p className="text-[11px] text-gray-400">
                                                Ekspor seluruh struktur tabel & record riil ke format teks SQL standar. Kompatibel dengan MySQL, MariaDB, & SQLite.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleDownloadSqlBackup}
                                            disabled={sqlBackupLoading}
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            <FileCode className={`w-4 h-4 ${sqlBackupLoading ? 'animate-bounce' : ''}`} />
                                            <span>{sqlBackupLoading ? 'Menyiapkan SQL...' : 'Unduh Cadangan SQL (.sql)'}</span>
                                        </button>
                                    </div>

                                    {/* Option 2: Backup SQLite Mentah */}
                                    <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200/70 dark:border-gray-700 flex flex-col justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">.SQLite File</span>
                                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                                    Cadangkan Berkas Database Mentah
                                                </p>
                                            </div>
                                            <p className="text-[11px] text-gray-400">
                                                Salinan berkas biner SQLite aktif (database.sqlite). Sempurna untuk restore instan, kloning lokal, atau arsip server.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleDownloadSqliteBackup}
                                            disabled={sqliteBackupLoading}
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            <Database className={`w-4 h-4 ${sqliteBackupLoading ? 'animate-bounce' : ''}`} />
                                            <span>{sqliteBackupLoading ? 'Mengunduh SQLite...' : 'Unduh Berkas SQLite (.sqlite)'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Option 3: JSON Snapshot */}
                                <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200/70 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                            Ekspor Snapshot JSON Gudang
                                        </p>
                                        <p className="text-[11px] text-gray-400">
                                            Menghasilkan file arsip .json berisi seluruh data produk, batch, stok, kategori, dan pemasok.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleDownloadBackup}
                                        disabled={backupLoading}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-600 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                                    >
                                        <Download className={`w-4 h-4 ${backupLoading ? 'animate-bounce' : ''}`} />
                                        <span>{backupLoading ? 'Mengunduh...' : t('downloadBackupBtn')}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Card Clear Cache */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6 sm:p-7 space-y-5">
                                <div className="flex items-start gap-3.5">
                                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300">
                                        <RotateCw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                            {t('clearCacheTitle')}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {t('clearCacheDesc')}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200/70 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                            Reset Cache Server & Query
                                        </p>
                                        <p className="text-[11px] text-gray-400">
                                            Menghapus query cache server Laravel dan memperbarui status aplikasi.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleClearCache}
                                        disabled={cacheLoading}
                                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-600 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                                    >
                                        <RotateCw className={`w-4 h-4 ${cacheLoading ? 'animate-spin' : ''}`} />
                                        <span>{cacheLoading ? 'Membersihkan...' : t('clearCacheBtn')}</span>
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

                    {/* TAB: PROFIL PERUSAHAAN & KOP SURAT (Point 4) */}
                    {activeTab === 'perusahaan' && (
                        <div className="space-y-6">
                            {/* Card Identitas */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6 sm:p-7 space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700/60 pb-5">
                                    <div className="flex items-start gap-3.5">
                                        <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                                Identitas Perusahaan & Kop Surat Resmi
                                            </h3>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Informasi ini dicetak otomatis pada header bukti transaksi serah terima dan ekspor PDF laporan resmi.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSaveCompany}
                                        disabled={companyLoading}
                                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                                    >
                                        <Save className={`w-4 h-4 ${companyLoading ? 'animate-spin' : ''}`} />
                                        <span>{companyLoading ? 'Menyimpan...' : 'Simpan Profil & Kop Surat'}</span>
                                    </button>
                                </div>

                                <form onSubmit={handleSaveCompany} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                            Nama Perusahaan / Instansi <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={company.company_name}
                                            onChange={(e) => setCompany({ ...company, company_name: e.target.value })}
                                            placeholder="Contoh: PT. LOGISTIK JAYA ABADI"
                                            className="w-full px-4 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                            Sub-judul / Tagline Kop Surat
                                        </label>
                                        <input
                                            type="text"
                                            value={company.company_tagline}
                                            onChange={(e) => setCompany({ ...company, company_tagline: e.target.value })}
                                            placeholder="Contoh: Divisi Pergudangan & Logistik Modern"
                                            className="w-full px-4 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                            Alamat Lengkap Kantor / Gudang
                                        </label>
                                        <textarea
                                            rows="2"
                                            value={company.company_address}
                                            onChange={(e) => setCompany({ ...company, company_address: e.target.value })}
                                            placeholder="Contoh: Jl. Industri Pergudangan No. 88, Blok B, Jakarta Barat"
                                            className="w-full px-4 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                            Nomor Telepon / WhatsApp
                                        </label>
                                        <input
                                            type="text"
                                            value={company.company_phone}
                                            onChange={(e) => setCompany({ ...company, company_phone: e.target.value })}
                                            placeholder="Contoh: 021-5558899 / 0812-3456-7890"
                                            className="w-full px-4 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                            Email Resmi
                                        </label>
                                        <input
                                            type="email"
                                            value={company.company_email}
                                            onChange={(e) => setCompany({ ...company, company_email: e.target.value })}
                                            placeholder="Contoh: gudang@logistikjaya.co.id"
                                            className="w-full px-4 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                            Nama PIC / Kepala Gudang (Tanda Tangan)
                                        </label>
                                        <input
                                            type="text"
                                            value={company.company_pic}
                                            onChange={(e) => setCompany({ ...company, company_pic: e.target.value })}
                                            placeholder="Contoh: Admin User"
                                            className="w-full px-4 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                            Jabatan PIC Resmi
                                        </label>
                                        <input
                                            type="text"
                                            value={company.company_pic_role}
                                            onChange={(e) => setCompany({ ...company, company_pic_role: e.target.value })}
                                            placeholder="Contoh: Kepala Logistik & Pergudangan"
                                            className="w-full px-4 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                            Catatan Kaki Dokumen Cetak (Footer Note)
                                        </label>
                                        <input
                                            type="text"
                                            value={company.company_note}
                                            onChange={(e) => setCompany({ ...company, company_note: e.target.value })}
                                            placeholder="Contoh: Barang yang telah diterima harap diperiksa secara teliti sesuai dokumen bukti fisik ini."
                                            className="w-full px-4 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                                        />
                                    </div>
                                </form>
                            </div>

                            {/* Live Preview Kop Surat & Tanda Tangan */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-6 sm:p-7 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Printer className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                            Pratinjau Langsung Kop Surat & Dokumen Resmi
                                        </h4>
                                    </div>
                                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200/50 dark:border-emerald-800/40">
                                        Live Preview
                                    </span>
                                </div>

                                <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 font-sans text-gray-900 dark:text-gray-100 shadow-inner">
                                    {/* Header Preview */}
                                    <div className="border-b-2 border-gray-900 dark:border-gray-100 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
                                        <div>
                                            <h2 className="text-base sm:text-lg font-black tracking-tight uppercase text-gray-900 dark:text-white">
                                                {company.company_name || 'NAMA PERUSAHAAN'}
                                            </h2>
                                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                {company.company_tagline || 'Tagline / Divisi'}
                                            </p>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                {company.company_address} 
                                                {company.company_phone && ` • Telp: ${company.company_phone}`}
                                                {company.company_email && ` • Email: ${company.company_email}`}
                                            </p>
                                        </div>
                                        <div className="text-right sm:text-right text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                                            BUKTI TRANSAKSI GUDANG
                                        </div>
                                    </div>

                                    {/* Dummy Content */}
                                    <div className="py-4 space-y-2 text-xs text-gray-500 dark:text-gray-400">
                                        <p className="italic text-[11px]">... Konten tabel rincian mutasi barang masuk/keluar atau laporan stok berkala ...</p>
                                    </div>

                                    {/* Footer / Signature Preview */}
                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700/60 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-xs">
                                        <div className="max-w-xs text-[11px] text-gray-500 dark:text-gray-400 italic">
                                            "{company.company_note || 'Barang yang telah diterima harap diperiksa secara teliti.'}"
                                        </div>
                                        <div className="text-center min-w-[160px]">
                                            <p className="text-[10px] text-gray-500 mb-8">Disahkan Oleh,</p>
                                            <p className="font-bold underline text-gray-900 dark:text-white">{company.company_pic || 'Admin User'}</p>
                                            <p className="text-[10px] text-gray-400">{company.company_pic_role || 'Kepala Gudang'}</p>
                                        </div>
                                    </div>
                                </div>
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
                                    <span className="font-mono font-bold text-red-600 dark:text-red-400">v{settings.app_version || '2.5.1'} (Stable)</span>
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
