import React from 'react';
import { NavLink } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    LayoutDashboard, Package, Tags, Truck, ShoppingCart, QrCode, BarChart3, Settings, LogOut
} from 'lucide-react';

const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/produk', icon: Package, label: 'Produk' },
    { path: '/kategori', icon: Tags, label: 'Kategori' },
    { path: '/pemasok', icon: Truck, label: 'Pemasok' },
    { path: '/stok', icon: ShoppingCart, label: 'Stok Masuk / Keluar' },
    { path: '/batch', icon: QrCode, label: 'Batch Inventaris' },
    { path: '/laporan', icon: BarChart3, label: 'Laporan Data' },
];

export default function Sidebar({ isOpen, onClose, darkMode }) {
    const handleLogout = () => {
        Swal.fire({
            title: 'Konfirmasi Logout',
            text: 'Keluar dari sistem gudang?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#4b5563',
            confirmButtonText: 'Logout',
            cancelButtonText: 'Batal',
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
                transform transition-transform duration-200 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                ${darkMode 
                    ? 'bg-gray-900 border-gray-800 text-white' 
                    : 'bg-white border-gray-200 text-gray-800'
                } border-r
            `}>
                <div className="flex flex-col h-full">
                    {/* Header Brand */}
                    <div className={`flex items-center gap-2.5 px-4 h-14 border-b ${
                        darkMode ? 'border-gray-800' : 'border-gray-200'
                    }`}>
                        <Package className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <span className="text-sm font-bold tracking-wider uppercase">
                            Manajemen Barang
                        </span>
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors
                                        ${isActive 
                                            ? 'bg-red-600 text-white font-semibold' 
                                            : darkMode 
                                                ? 'text-gray-300 hover:bg-gray-800' 
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }
                                    `}
                                >
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    {item.label}
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* Bottom Utility */}
                    <div className={`p-2 border-t space-y-0.5 ${
                        darkMode ? 'border-gray-800' : 'border-gray-200'
                    }`}>
                        <NavLink
                            to="/settings"
                            className={`flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors ${
                                darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Settings className="w-4 h-4" /> Pengaturan
                        </NavLink>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2 rounded text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </div>
            </aside>

            {isOpen && (
                <div onClick={onClose} className="fixed inset-0 z-30 bg-black/40 lg:hidden" />
            )}
        </>
    );
}