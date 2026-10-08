import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Search, Bell, Moon, Sun, LogOut, ChevronDown, Check, User, Settings } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { playNotificationChime } from '../../lib/sound';
import Swal from 'sweetalert2';

export default function Header({ onMenuToggle, isSidebarOpen, darkMode, toggleDarkMode }) {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const dropdownRef = useRef(null);
    const notificationRef = useRef(null);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadUserData = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error(e);
            }
        }
        // Fetch fresh profile from API
        fetch('/api/profile')
            .then(res => res.json())
            .then(res => {
                if (res.success && res.data) {
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                }
            })
            .catch(err => console.error('Error fetching profile:', err));
    };

    useEffect(() => {
        loadUserData();

        const handleProfileUpdate = () => loadUserData();
        window.addEventListener('user-profile-updated', handleProfileUpdate);

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

                    {/* Search Bar pill shape */}
                    <div className="relative w-full max-w-md hidden sm:block">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-full text-xs font-normal border-none transition-all outline-none ${
                                darkMode 
                                    ? 'bg-gray-800 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-red-500/40' 
                                    : 'bg-[#f1f3f9] text-gray-700 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-red-500/20 shadow-inner'
                            }`}
                        />
                    </div>
                </div>

                {/* Right: Notifications & User Profile */}
                <div className="flex items-center gap-4 sm:gap-6">
                    {/* Dark mode switch */}
                    <button
                        onClick={toggleDarkMode}
                        className={`p-2 rounded-xl transition-colors ${
                            darkMode ? 'hover:bg-gray-800 text-amber-400' : 'hover:bg-gray-100 text-gray-500'
                        }`}
                        title={t('toggleTheme')}
                    >
                        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
                                        notifications.map((item) => (
                                            <div 
                                                key={item.id}
                                                className={`p-2.5 rounded-xl border ${
                                                    item.type === 'danger' 
                                                        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-300'
                                                        : item.type === 'warning'
                                                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-300'
                                                        : 'bg-gray-50 dark:bg-gray-800/60 border-gray-100 dark:border-gray-700/50 text-gray-800 dark:text-gray-200'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <p className="font-bold text-xs">{item.title}</p>
                                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono ml-2 flex-shrink-0">{item.time}</span>
                                                </div>
                                                <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5 leading-tight">{item.desc}</p>
                                            </div>
                                        ))
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
                                <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
                                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{user?.name || 'Admin User'}</p>
                                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{user?.email || 'admin@admin.com'}</p>
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
        </header>
    );
}