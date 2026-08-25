import React from 'react';
import { NavLink } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    LayoutDashboard,
    Package,
    Tags,
    Truck,
    ShoppingCart,
    BarChart3,
    Settings,
    LogOut,
} from 'lucide-react';

const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/produk', icon: Package, label: 'Produk' },
    { path: '/kategori', icon: Tags, label: 'Kategori' },
    { path: '/pemasok', icon: Truck, label: 'Pemasok' },
    { path: '/stok', icon: ShoppingCart, label: 'Manajemen Stok' },
    { path: '/laporan', icon: BarChart3, label: 'Laporan' },
];

export default function Sidebar({ isOpen, onClose, darkMode }) {
    const handleLogout = () => {
        Swal.fire({
            title: 'Yakin ingin logout?',
            text: 'Anda akan keluar dari akun ini.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Logout!',
            cancelButtonText: 'Batal',
            reverseButtons: true,
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

                    localStorage.removeItem('token');
                    localStorage.removeItem('user');

                    Swal.fire({
                        title: 'Berhasil Logout!',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                    });

                    window.location.href = '/login';
                } catch (error) {
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
                fixed inset-y-0 left-0 z-40 w-64 shadow-lg
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
                ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-r border-gray-200'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Brand */}
                    <div className={`flex items-center gap-2 px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <Package className="w-8 h-8 text-blue-600" />
                        <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            Manajemen Barang
                        </span>
                    </div>

                    {/* Menu */}
                    <nav className="flex-1 px-3 py-4 overflow-y-auto">
                        <ul className="space-y-1">
                            {menuItems.map((item) => (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        onClick={onClose}
                                        className={({ isActive }) => `
                                            flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                                            transition-colors duration-200
                                            ${isActive
                                                ? darkMode
                                                    ? 'bg-gray-800 text-blue-400'
                                                    : 'bg-blue-50 text-blue-700'
                                                : darkMode
                                                    ? 'text-gray-300 hover:bg-gray-800'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }
                                        `}
                                    >
                                        <item.icon className={`w-5 h-5 ${({ isActive }) => isActive ? (darkMode ? 'text-blue-400' : 'text-blue-600') : (darkMode ? 'text-gray-400' : 'text-gray-400')}`} />
                                        {item.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Bottom: Logout & Settings */}
                    <div className={`border-t p-3 space-y-1 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <button
                            onClick={() => window.location.href = '/settings'}
                            className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            <Settings className="w-5 h-5 text-gray-400" />
                            Pengaturan
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-800"
                        >
                            <LogOut className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay (mobile) */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                />
            )}
        </>
    );
}