import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Tags,
    Users,
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

export default function Sidebar({ isOpen, onClose }) {
    const handleLogout = async () => {
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
            window.location.href = '/login';
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 shadow-lg
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                <div className="flex flex-col h-full">
                    {/* Nama */}
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
                        <Package className="w-8 h-8 text-blue-600" />
                        <span className="text-lg font-bold text-gray-800">Manajemen Barang</span>
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
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }
                                        `}
                                    >
                                        <item.icon className={`w-5 h-5 ${({ isActive }) => isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                        {item.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="border-t border-gray-200 p-3 space-y-1">
                        <button
                            onClick={() => window.location.href = '/settings'}
                            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <Settings className="w-5 h-5 text-gray-400" />
                            Pengaturan
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
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