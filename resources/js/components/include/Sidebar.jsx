import React from 'react';
import { NavLink } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    LayoutDashboard, Package, Tag, Truck, ArrowLeftRight, LayoutGrid, BarChart3, LogOut
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Sidebar({ isOpen, onClose, darkMode }) {
    const { t } = useLanguage();

    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
        { path: '/produk', icon: Package, label: t('products') },
        { path: '/kategori', icon: Tag, label: t('categories') },
        { path: '/pemasok', icon: Truck, label: t('suppliers') },
        { path: '/stok', icon: ArrowLeftRight, label: t('stockInOut') },
        { path: '/batch', icon: LayoutGrid, label: t('batch') },
        { path: '/laporan', icon: BarChart3, label: t('reports') },
    ];

    const handleLogout = () => {
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
                } catch (e) {
                    console.error(e);
                } finally {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
            }
        });
    };

    return (
        <>
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                bg-gradient-to-b from-[#821422] via-[#8c1727] to-[#600b16]
                text-white flex flex-col justify-between shadow-xl select-none overflow-hidden
            `}>
                {/* Decorative Organic Waves at the bottom */}
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden h-44 z-0">
                    <svg viewBox="0 0 256 160" className="w-full h-full opacity-40" preserveAspectRatio="none">
                        <path 
                            d="M0,50 C70,10 130,90 190,40 C225,10 245,65 256,45 L256,160 L0,160 Z" 
                            fill="url(#sidebarWave1)" 
                        />
                        <path 
                            d="M0,90 C80,40 145,120 205,65 C235,38 248,95 256,80 L256,160 L0,160 Z" 
                            fill="url(#sidebarWave2)" 
                        />
                        <defs>
                            <linearGradient id="sidebarWave1" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#ff4d6d" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#dc2626" stopOpacity="0.8" />
                            </linearGradient>
                            <linearGradient id="sidebarWave2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
                                <stop offset="100%" stopColor="#ff758f" stopOpacity="0.4" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Main Content Area */}
                <div className="relative z-10 flex flex-col h-full">
                    {/* Brand Header */}
                    <div className="flex items-center gap-3 px-6 h-20 border-b border-white/10">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center p-2 border border-white/20 shadow-inner">
                            {/* Isometric 3D Box Logo */}
                            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[15px] font-bold tracking-tight text-white leading-tight">
                                {t('appName')}
                            </span>
                            <span className="text-[11px] text-rose-200/80 font-normal leading-tight">
                                {t('appSubtitle')}
                            </span>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1.5">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `
                                        flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200
                                        ${isActive 
                                            ? 'bg-red-600 text-white font-semibold shadow-lg shadow-red-950/30' 
                                            : 'text-white/80 hover:text-white hover:bg-white/10'
                                        }
                                    `}
                                >
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    <span>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* Bottom Logout */}
                    <div className="p-4 border-t border-white/10 relative z-10">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3.5 w-full px-3.5 py-2.5 rounded-xl text-xs font-medium text-white/85 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
                        >
                            <LogOut className="w-4 h-4 flex-shrink-0" />
                            <span>{t('logout')}</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile backdrop */}
            {isOpen && (
                <div onClick={onClose} className="fixed inset-0 z-30 bg-black/50 lg:hidden backdrop-blur-xs" />
            )}
        </>
    );
}