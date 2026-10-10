import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
    Menu, X, Search, Bell, Moon, Sun, Compass, BookOpen, LogOut, ChevronDown, Check, User, Settings,
    LayoutDashboard, Package, Tag, Truck, ArrowLeftRight, ClipboardCheck, LayoutGrid, BarChart3,
    History, QrCode, PlusCircle, ArrowDownToLine, ArrowUpFromLine, CornerDownLeft, Sparkles, Box
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { gunakanDarkMode } from '../../context/DarkModeContext';
import { playNotificationChime } from '../../lib/sound';
import Swal from 'sweetalert2';

export default function Header({ onMenuToggle, isSidebarOpen, darkMode, toggleDarkMode }) {
    const { t } = useLanguage();
    const { themeMode } = gunakanDarkMode();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const dropdownRef = useRef(null);
    const notificationRef = useRef(null);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Command Palette / Global Search State (Ctrl + K)
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [commandSearch, setCommandSearch] = useState('');
    const [quickProducts, setQuickProducts] = useState([]);
    const [quickCategories, setQuickCategories] = useState([]);
    const [quickBatches, setQuickBatches] = useState([]);
    const [loadingQuickData, setLoadingQuickData] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const commandInputRef = useRef(null);

    // Prevent background page scrolling while Command Palette is active
    useEffect(() => {
        if (commandPaletteOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [commandPaletteOpen]);

    const loadUserData = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error(e);
            }
        }
        // Fetch fresh profile from API with auth header
        const token = localStorage.getItem('token');
        fetch('/api/profile', {
            headers: {
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.success && res.data) {
                    setUser(prev => {
                        const merged = { ...prev, ...res.data };
                        if (res.data.avatar !== undefined) {
                            merged.avatar = res.data.avatar;
                        }
                        localStorage.setItem('user', JSON.stringify(merged));
                        return merged;
                    });
                }
            })
            .catch(err => console.error('Error fetching profile:', err));
    };

    // Keyboard shortcut listener for Ctrl + K and /
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setCommandPaletteOpen(prev => !prev);
            } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
                e.preventDefault();
                setCommandPaletteOpen(true);
            } else if (e.key === 'Escape' && commandPaletteOpen) {
                setCommandPaletteOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [commandPaletteOpen]);

    // Auto-focus input when Command Palette opens & fetch live search items
    useEffect(() => {
        if (commandPaletteOpen) {
            setCommandSearch('');
            setSelectedIndex(0);
            setTimeout(() => commandInputRef.current?.focus(), 50);

            // Fetch products, categories, and batches once for instant fast searching
            const fetchQuickData = async () => {
                setLoadingQuickData(true);
                try {
                    const token = localStorage.getItem('token');
                    const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
                    const [prodRes, catRes, batchRes] = await Promise.allSettled([
                        fetch('/api/produk?per_page=100', { headers }),
                        fetch('/api/kategori', { headers }),
                        fetch('/api/batch?per_page=50', { headers })
                    ]);
                    if (prodRes.status === 'fulfilled' && prodRes.value.ok) {
                        const pj = await prodRes.value.json();
                        const pItems = Array.isArray(pj.data?.data) ? pj.data.data : (Array.isArray(pj.data) ? pj.data : []);
                        setQuickProducts(pItems);
                    }
                    if (catRes.status === 'fulfilled' && catRes.value.ok) {
                        const cj = await catRes.value.json();
                        const cItems = Array.isArray(cj.data) ? cj.data : (Array.isArray(cj.data?.data) ? cj.data.data : []);
                        setQuickCategories(cItems);
                    }
                    if (batchRes.status === 'fulfilled' && batchRes.value.ok) {
                        const bj = await batchRes.value.json();
                        const bItems = Array.isArray(bj.data?.data) ? bj.data.data : (Array.isArray(bj.data) ? bj.data : []);
                        setQuickBatches(bItems);
                    }
                } catch (err) {
                    console.error('Failed to load quick search data:', err);
                } finally {
                    setLoadingQuickData(false);
                }
            };
            fetchQuickData();
        }
    }, [commandPaletteOpen]);

    useEffect(() => {
        loadUserData();

        const handleProfileUpdate = (e) => {
            if (e?.detail) {
                setUser(e.detail);
                return;
            }
            const userData = localStorage.getItem('user');
            if (userData) {
                try {
                    setUser(JSON.parse(userData));
                } catch (err) {
                    console.error(err);
                }
            }
        };
        window.addEventListener('user-profile-updated', handleProfileUpdate);
        window.addEventListener('storage', handleProfileUpdate);

        // Fetch notifications from database
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/dashboard/notifications');
                if (res.ok) {
                    const result = await res.json();
                    if (result.data) {
                        setNotifications(result.data.items || []);
                        setUnreadCount(result.data.count || 0);
                    }
                }
            } catch (e) {
                console.error('Error fetching notifications:', e);
            }
        };
        fetchNotifications();

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('user-profile-updated', handleProfileUpdate);
            window.removeEventListener('storage', handleProfileUpdate);
        };
    }, []);

    const handleLogout = () => {
        setDropdownOpen(false);
        Swal.fire({
            title: t('logoutConfirmTitle'),
            text: t('logoutConfirmText'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#4b5563',
            confirmButtonText: t('logout'),
            cancelButtonText: t('cancel'),
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('token');
                    await fetch('/api/logout', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                        },
                    });
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }
            }
        });
    };

    // Hasil pencarian Command Palette (Navigasi, Aksi Cepat, Kategori, Produk, Batch)
    const commandResults = useMemo(() => {
        const navList = [
            { label: 'Tambah Produk Baru', path: '/produk/Create', icon: PlusCircle, category: 'Aksi Cepat', hint: 'Input master data barang' },
            { label: 'Catat Stok Masuk', path: '/stok/Masuk', icon: ArrowDownToLine, category: 'Aksi Cepat', hint: 'Penerimaan barang masuk dari supplier' },
            { label: 'Catat Stok Keluar', path: '/stok/Keluar', icon: ArrowUpFromLine, category: 'Aksi Cepat', hint: 'Pengeluaran/distribusi barang' },
            { label: 'Stock Opname / Penyesuaian', path: '/stok/opname', icon: ClipboardCheck, category: 'Aksi Cepat', hint: 'Sinkronisasi fisik vs sistem gudang' },
            { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, category: 'Navigasi' },
            { label: 'Master Produk', path: '/produk', icon: Package, category: 'Navigasi' },
            { label: 'Kategori Barang', path: '/kategori', icon: Tag, category: 'Navigasi' },
            { label: 'Daftar Pemasok / Supplier', path: '/pemasok', icon: Truck, category: 'Navigasi' },
            { label: 'Riwayat Stok Masuk/Keluar', path: '/stok', icon: ArrowLeftRight, category: 'Navigasi' },
            { label: 'Batch Inventaris & FEFO', path: '/batch', icon: LayoutGrid, category: 'Navigasi' },
            { label: 'Scanner QR Code / Barcode', path: '/scan', icon: QrCode, category: 'Navigasi' },
            { label: 'Laporan Inventaris', path: '/laporan', icon: BarChart3, category: 'Navigasi' },
            { label: 'Riwayat Audit & Aktivitas', path: '/audit-log', icon: History, category: 'Navigasi' },
            { label: 'Pengaturan Sistem', path: '/pengaturan', icon: Settings, category: 'Navigasi' },
            { label: 'Profil Saya', path: '/profil', icon: User, category: 'Navigasi' },
        ];

        const q = commandSearch.toLowerCase().trim();
        const matchActions = navList.filter(item => 
            !q || item.label.toLowerCase().includes(q) || (item.hint && item.hint.toLowerCase().includes(q))
        );

        const matchCategories = quickCategories.filter(c =>
            q && (c.nama_kategori?.toLowerCase().includes(q) || c.deskripsi?.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q))
        ).slice(0, 3).map(c => ({
            label: `Kategori: ${c.nama_kategori}`,
            path: `/kategori`,
            icon: Tag,
            category: 'Kategori',
            hint: c.deskripsi || 'Master kategori inventaris'
        }));

        const matchProds = quickProducts.filter(p => 
            q && (
                p.nama_produk?.toLowerCase().includes(q) ||
                p.kode_produk?.toLowerCase().includes(q) ||
                p.sku?.toLowerCase().includes(q) ||
                p.kategori?.nama_kategori?.toLowerCase().includes(q)
            )
        ).slice(0, 5).map(p => ({
            label: p.nama_produk,
            path: `/produk/Edit/${p.id}`,
            icon: Box,
            category: 'Produk',
            hint: `SKU: ${p.sku || p.kode_produk || '-'} | Stok: ${p.stok || 0} ${p.satuan || 'unit'}`
        }));

        const matchBatches = quickBatches.filter(b => 
            q && (
                b.qr_code?.toLowerCase().includes(q) ||
                b.lokasi_rak?.toLowerCase().includes(q) ||
                b.produk?.nama_produk?.toLowerCase().includes(q)
            )
        ).slice(0, 3).map(b => ({
            label: `Batch ${b.qr_code}`,
            path: `/batch`,
            icon: LayoutGrid,
            category: 'Batch',
            hint: `${b.produk?.nama_produk || 'Produk'} | Rak: ${b.lokasi_rak || '-'}`
        }));

        return [...matchActions, ...matchCategories, ...matchProds, ...matchBatches];
    }, [commandSearch, quickProducts, quickCategories, quickBatches]);

    return (
        <header className={`h-20 border-b sticky top-0 z-30 transition-colors duration-200 ${
            darkMode ? 'bg-gray-900/90 border-gray-800 text-white backdrop-blur' : 'bg-white/95 border-gray-100 text-gray-800 backdrop-blur'
        }`}>
            <div className="h-full px-6 sm:px-8 flex justify-between items-center gap-4">
                
                {/* Left: Mobile Toggle & Search Input */}
                <div className="flex items-center gap-3 sm:gap-6 flex-1 max-w-xl">
                    <button
                        onClick={onMenuToggle}
                        className={`p-2 rounded-xl transition-colors ${
                            darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        title="Toggle Sidebar"
                    >
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    {/* Search Bar pill shape / Command Palette Trigger (Ctrl + K) */}
                    <div 
                        onClick={() => setCommandPaletteOpen(true)}
                        className={`relative w-full max-w-md hidden sm:flex items-center justify-between px-3.5 py-2.5 rounded-full cursor-pointer transition-all duration-200 select-none group border ${
                            darkMode 
                                ? 'bg-gray-800/90 hover:bg-gray-800 text-gray-400 hover:text-gray-200 border-gray-700/60 hover:border-gray-600' 
                                : 'bg-[#f1f3f9] hover:bg-[#ebf0f8] text-gray-400 hover:text-gray-700 border-transparent hover:border-gray-200 shadow-inner'
                        }`}
                        title="Buka Command Palette (Ctrl + K)"
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <Search className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors flex-shrink-0" />
                            <span className="text-xs truncate">
                                {t('searchPlaceholder') || 'Cari cepat produk, batch, halaman...'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 pl-2">
                            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 shadow-2xs">
                                Ctrl
                            </kbd>
                            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 shadow-2xs">
                                K
                            </kbd>
                        </div>
                    </div>

                    {/* Mobile Search Button */}
                    <button
                        onClick={() => setCommandPaletteOpen(true)}
                        className={`sm:hidden p-2 rounded-xl transition-colors ${
                            darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        title="Cari Cepat (Ctrl + K)"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                </div>

                {/* Right: Notifications & User Profile */}
                <div className="flex items-center gap-4 sm:gap-6">
                    {/* Theme mode switch (4 themes: light -> dark -> navy -> warm) */}
                    <button
                        onClick={toggleDarkMode}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                            themeMode === 'navy'
                                ? 'hover:bg-blue-900/40 text-blue-400'
                                : themeMode === 'warm'
                                ? 'hover:bg-amber-200/50 text-amber-700'
                                : darkMode
                                ? 'hover:bg-gray-800 text-red-400'
                                : 'hover:bg-gray-100 text-amber-500'
                        }`}
                        title={`${t('toggleTheme')} (${
                            themeMode === 'navy' 
                                ? t('themeNavy') 
                                : themeMode === 'warm' 
                                ? t('themeWarm') 
                                : themeMode === 'dark' 
                                ? t('themeDark') 
                                : t('themeLight')
                        })`}
                    >
                        {themeMode === 'navy' ? (
                            <Compass className="w-4 h-4" />
                        ) : themeMode === 'warm' ? (
                            <BookOpen className="w-4 h-4" />
                        ) : darkMode ? (
                            <Moon className="w-4 h-4" />
                        ) : (
                            <Sun className="w-4 h-4" />
                        )}
                    </button>

                    {/* Notification Bell with Database Count */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => {
                                const nextState = !notificationOpen;
                                setNotificationOpen(nextState);
                                if (nextState) {
                                    try {
                                        const prefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
                                        if (prefs.sound_alert !== false) {
                                            playNotificationChime();
                                        }
                                    } catch (e) {}
                                }
                            }}
                            className={`p-2 rounded-xl relative transition-colors ${
                                darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                            }`}
                            title={t('notifications')}
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900 animate-pulse">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {notificationOpen && (
                            <div className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-xl border p-3 z-50 text-xs animate-in fade-in slide-in-from-top-2 ${
                                darkMode ? 'bg-gray-900 border-gray-800 text-gray-200' : 'bg-white border-gray-100 text-gray-800'
                            }`}>
                                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-gray-800">
                                    <span className="font-bold text-sm">{t('inventoryNotifications')}</span>
                                    {unreadCount > 0 && (
                                        <button 
                                            onClick={() => setUnreadCount(0)}
                                            className="text-[11px] text-red-600 font-semibold cursor-pointer hover:underline"
                                        >
                                            {t('markAsRead')}
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2 max-h-72 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <p className="text-center py-4 text-gray-400">{t('noNotifications')}</p>
                                    ) : (
                                        notifications.map((item) => {
                                            const handleItemClick = () => {
                                                setNotificationOpen(false);
                                                if (item.id.startsWith('out-') || item.id.startsWith('low-')) {
                                                    navigate('/produk');
                                                } else if (item.id.startsWith('exp-')) {
                                                    navigate('/batch');
                                                } else if (item.id.startsWith('trx-')) {
                                                    navigate('/stok');
                                                }
                                            };
                                            return (
                                                <div 
                                                    key={item.id}
                                                    onClick={handleItemClick}
                                                    className={`p-2.5 rounded-xl border cursor-pointer hover:shadow-sm hover:scale-[1.01] transition-all ${
                                                        item.type === 'danger' 
                                                            ? 'bg-rose-50/70 hover:bg-rose-100/70 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-300'
                                                            : item.type === 'warning'
                                                            ? 'bg-amber-50/70 hover:bg-amber-100/70 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-300'
                                                            : 'bg-gray-50 hover:bg-gray-100/70 dark:bg-gray-800/60 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-700/50 text-gray-800 dark:text-gray-200'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <p className="font-bold text-xs">{item.title}</p>
                                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono ml-2 flex-shrink-0">{item.time}</span>
                                                    </div>
                                                    <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5 leading-tight">{item.desc}</p>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-800 hidden sm:block" />

                    {/* User Profile */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-3 p-1 rounded-xl hover:opacity-90 transition-all cursor-pointer"
                        >
                            <div className="relative">
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user?.name || 'Admin'}
                                        className="w-10 h-10 rounded-full object-cover ring-2 ring-red-100 dark:ring-red-950"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-sm shadow-sm ring-2 ring-red-100 dark:ring-red-950">
                                        {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                    </div>
                                )}
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
                            </div>
                            <div className="text-left hidden md:block">
                                <div className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                                    {user?.name || 'Admin'}
                                </div>
                                <div className="text-[11px] text-gray-400 font-normal leading-tight">
                                    {user?.role || 'Administrator'}
                                </div>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                        </button>

                        {/* User Dropdown */}
                        {dropdownOpen && (
                            <div className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 ${
                                darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-800'
                            }`}>
                                <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user?.name || 'Admin'}
                                            className="w-9 h-9 rounded-full object-cover ring-2 ring-red-100 dark:ring-red-950 flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs shadow-sm ring-2 ring-red-100 dark:ring-red-950 flex-shrink-0">
                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{user?.name || 'Admin User'}</p>
                                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{user?.email || 'admin@admin.com'}</p>
                                    </div>
                                </div>

                                <div className="py-1 space-y-0.5">
                                    <button
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            navigate('/profil');
                                        }}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors font-medium text-left cursor-pointer ${
                                            darkMode 
                                                ? 'text-gray-200 hover:bg-gray-800 hover:text-white' 
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <User className="w-4 h-4 text-red-500" />
                                        <span>{t('myProfile')}</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            navigate('/pengaturan');
                                        }}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors font-medium text-left cursor-pointer ${
                                            darkMode 
                                                ? 'text-gray-200 hover:bg-gray-800 hover:text-white' 
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <Settings className="w-4 h-4 text-gray-400" />
                                        <span>{t('settings')}</span>
                                    </button>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors font-medium text-left cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>{t('logout')}</span>
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Global Search / Command Palette Modal (Ctrl + K) */}
            {commandPaletteOpen && typeof document !== 'undefined' && createPortal(
                <div 
                    className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto animate-in fade-in duration-150"
                    onClick={() => setCommandPaletteOpen(false)}
                >
                    <div 
                        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden transition-all duration-200 animate-in zoom-in-95 ${
                            darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Search Input Box */}
                        <div className={`flex items-center px-4 py-3.5 border-b ${
                            darkMode ? 'border-gray-800 bg-gray-900/90' : 'border-gray-100 bg-gray-50/70'
                        }`}>
                            <Search className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                            <input
                                ref={commandInputRef}
                                type="text"
                                value={commandSearch}
                                onChange={(e) => {
                                    setCommandSearch(e.target.value);
                                    setSelectedIndex(0);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        setSelectedIndex(prev => (prev + 1) % Math.max(1, commandResults.length));
                                    } else if (e.key === 'ArrowUp') {
                                        e.preventDefault();
                                        setSelectedIndex(prev => (prev - 1 + commandResults.length) % Math.max(1, commandResults.length));
                                    } else if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (commandResults[selectedIndex]) {
                                            setCommandPaletteOpen(false);
                                            navigate(commandResults[selectedIndex].path);
                                        }
                                    }
                                }}
                                placeholder="Ketik apa saja untuk mencari... (contoh: opname, laporan, baut, BATCH-01)"
                                className="w-full bg-transparent text-sm sm:text-base outline-none placeholder-gray-400 dark:placeholder-gray-500"
                            />
                            {commandSearch ? (
                                <button
                                    onClick={() => setCommandSearch('')}
                                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            ) : null}
                            <kbd className="ml-2 px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700">
                                ESC
                            </kbd>
                        </div>

                        {/* Search Results List */}
                        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
                            {commandResults.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-red-500" />
                                    <p className="text-sm font-medium">Tidak ada hasil ditemukan untuk "{commandSearch}"</p>
                                    <p className="text-xs text-gray-400 mt-1">Coba kata kunci lain seperti nama barang, nomor batch, atau nama menu.</p>
                                </div>
                            ) : (
                                commandResults.map((item, idx) => {
                                    const Icon = item.icon;
                                    const isSelected = idx === selectedIndex;
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                setCommandPaletteOpen(false);
                                                navigate(item.path);
                                            }}
                                            onMouseEnter={() => setSelectedIndex(idx)}
                                            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                                                isSelected 
                                                    ? 'bg-red-600 text-white shadow-md shadow-red-950/20' 
                                                    : darkMode 
                                                    ? 'hover:bg-gray-800 text-gray-200' 
                                                    : 'hover:bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                    isSelected 
                                                        ? 'bg-white/20 text-white' 
                                                        : darkMode 
                                                        ? 'bg-gray-800 text-red-400 border border-gray-700' 
                                                        : 'bg-red-50 text-red-600'
                                                }`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs sm:text-sm font-bold truncate leading-tight">
                                                        {item.label}
                                                    </p>
                                                    {item.hint && (
                                                        <p className={`text-[11px] truncate leading-tight mt-0.5 ${
                                                            isSelected ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'
                                                        }`}>
                                                            {item.hint}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                    isSelected 
                                                        ? 'bg-white/20 text-white' 
                                                        : darkMode 
                                                        ? 'bg-gray-800 text-gray-400' 
                                                        : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {item.category}
                                                </span>
                                                {isSelected && (
                                                    <CornerDownLeft className="w-3.5 h-3.5 text-white/90" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer Tips */}
                        <div className={`px-4 py-2.5 border-t flex items-center justify-between text-[11px] ${
                            darkMode ? 'border-gray-800 bg-gray-900/60 text-gray-400' : 'border-gray-100 bg-gray-50/80 text-gray-500'
                        }`}>
                            <div className="flex items-center gap-3">
                                <span><kbd className="font-mono font-semibold">↑</kbd> <kbd className="font-mono font-semibold">↓</kbd> Navigasi</span>
                                <span><kbd className="font-mono font-semibold">↵</kbd> Pilih</span>
                                <span><kbd className="font-mono font-semibold">ESC</kbd> Tutup</span>
                            </div>
                            <span className="hidden sm:inline font-medium text-red-500">Shortcut Global (Ctrl+K)</span>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </header>
    );
}