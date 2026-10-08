import React, { useState } from 'react';
import Sidebar from '../components/include/Sidebar';
import Header from '../components/include/Header';
import Footer from '../components/include/Footer';

export default function MainLayout({ children, darkMode, toggleDarkMode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        const savedState = localStorage.getItem('sidebar_open');
        return savedState !== null ? JSON.parse(savedState) : true;
    });

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => {
            const newState = !prev;
            localStorage.setItem('sidebar_open', JSON.stringify(newState));
            return newState;
        });
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
        localStorage.setItem('sidebar_open', JSON.stringify(false));
    };

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
            darkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-[#f4f6fa] text-slate-900'
        }`}>
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} darkMode={darkMode} />

            {/* Container Utama (Header + Content + Footer) */}
            <div className={`flex flex-col flex-1 transition-all duration-300 relative ${
                isSidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
            }`}>
                {/* Organic Red Fluid Wave in top-right corner matching the reference design */}
                <div className="absolute top-0 right-0 pointer-events-none overflow-hidden w-64 sm:w-80 md:w-96 h-40 z-10 select-none">
                    <svg viewBox="0 0 360 160" className="w-full h-full opacity-90" preserveAspectRatio="none">
                        <path 
                            d="M120,0 C170,90 230,20 280,75 C310,110 340,40 360,55 L360,0 Z" 
                            fill="url(#topWaveGrad1)" 
                        />
                        <path 
                            d="M190,0 C220,70 265,15 305,60 C325,82 348,30 360,40 L360,0 Z" 
                            fill="url(#topWaveGrad2)" 
                        />
                        <path 
                            d="M250,0 C270,50 300,10 330,45 C345,60 355,20 360,25 L360,0 Z" 
                            fill="url(#topWaveGrad3)" 
                        />
                        <defs>
                            <linearGradient id="topWaveGrad1" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                                <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.95" />
                            </linearGradient>
                            <linearGradient id="topWaveGrad2" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#f87171" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#dc2626" stopOpacity="0.8" />
                            </linearGradient>
                            <linearGradient id="topWaveGrad3" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#fca5a5" stopOpacity="0.5" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <Header
                    onMenuToggle={toggleSidebar}
                    isSidebarOpen={isSidebarOpen}
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 relative z-10">
                    <div className="max-w-[1520px] mx-auto">
                        {children}
                    </div>
                </main>

                <Footer darkMode={darkMode} />
            </div>
        </div>
    );
}