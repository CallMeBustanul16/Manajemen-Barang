import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, Moon, Sun, QrCode } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Header({ onMenuToggle, isSidebarOpen, darkMode, toggleDarkMode }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setDropdownOpen(false);
        Swal.fire({
            title: 'Konfirmasi Logout',
            text: 'Anda akan keluar dari sistem.',
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
        <header className={`h-14 border-b sticky top-0 z-30 transition-colors duration-200 ${
            darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-800'
        }`}>
            <div className="h-full px-4 flex justify-between items-center">
                
                {/* Left: Sidebar Toggle Button */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onMenuToggle}
                        className={`p-1.5 rounded transition-colors ${
                            darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        title="Toggle Sidebar"
                    >
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    
                    {/* Scan QR (Khusus HP / Mobile Only) */}
                    <button
                        onClick={() => navigate('/scan')}
                        className="lg:hidden p-1.5 rounded transition-colors bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                        aria-label="Scan QR Code"
                        title="Scan QR Code"
                    >
                        <QrCode className="w-4 h-4" />
                    </button>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className={`p-1.5 rounded transition-colors ${
                            darkMode ? 'hover:bg-gray-800 text-amber-400' : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        title="Toggle Tema"
                    >
                        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>

                    {/* Quick Link Dashboard */}
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={`p-1.5 rounded transition-colors hidden sm:flex items-center gap-1.5 ${
                            darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                        title="Ke Dashboard"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="text-xs font-medium">Dashboard</span>
                    </button>

                    <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700 mx-1 hidden sm:block" />

                    {/* User Profile & Dropdown Menu */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className={`flex items-center gap-2 p-1 rounded transition-colors ${
                                darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                            }`}
                        >
                            <div className="w-7 h-7 rounded bg-slate-800 text-white flex items-center justify-center font-mono text-xs font-bold border border-slate-700">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className="text-xs font-semibold hidden sm:block">
                                {user?.name || 'Operator'}
                            </span>
                        </button>

                        {/* Dropdown Content */}
                        {dropdownOpen && (
                            <div className={`absolute right-0 mt-1.5 w-48 rounded border shadow-md py-1 z-50 text-xs ${
                                darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-800'
                            }`}>
                                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                                    <p className="font-bold truncate">{user?.name || 'User'}</p>
                                    <p className="text-[11px] text-gray-400 truncate">{user?.email || '-'}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </header>
    );
}