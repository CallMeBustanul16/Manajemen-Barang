import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Package, LayoutDashboard, Moon, Sun, QrCode } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Header({ onMenuToggle, isSidebarOpen, darkMode, toggleDarkMode }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

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
                        text: 'Anda telah keluar dari akun.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                    });

                    navigate('/login');
                } catch (error) {
                    console.error('Logout error:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }
            }
        });
    };

    return (
        <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-md border-b sticky top-0 z-30 transition-colors duration-300`}>
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left: Menu Toggle + Brand */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onMenuToggle}
                            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                            aria-label="Toggle Sidebar"
                        >
                            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        <div className="flex items-center gap-2">
                            <Package className="w-8 h-8 text-blue-600" />
                            <span className={`text-xl font-bold hidden sm:block ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                Manajemen Barang
                            </span>
                            <span className={`text-xl font-bold sm:hidden ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                MB
                            </span>
                        </div>
                    </div>

                    {/* Right: Dark Mode Toggle + User Profile */}
                    <div className="flex items-center gap-4">
                        {/* 🌙 Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}`}
                            aria-label="Toggle Dark Mode"
                        >
                            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        
                        {/* Right: Scanner (Mobile) + Dark Mode + User */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            <button
                                onClick={() => navigate('/scan')}
                                className="lg:hidden p-2 rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                                aria-label="Scan QR Code"
                                title="Scan QR Code"
                            >
                                <QrCode className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Dashboard Link */}
                        <button
                            onClick={() => navigate('/dashboard')}
                            className={`p-2 rounded-lg transition-colors hidden sm:flex items-center gap-2 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            <span className="text-sm font-medium">Dashboard</span>
                        </button>

                        {/* User Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className={`text-sm font-medium hidden sm:block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {user?.name || 'User'}
                                </span>
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-1 z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                    <div className={`px-4 py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user?.name}</p>
                                        <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-red-50'}`}
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}