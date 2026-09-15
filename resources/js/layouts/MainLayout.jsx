import React, { useState, useEffect } from 'react';
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
            darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
        }`}>
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} darkMode={darkMode} />

            {/* Container Utama (Header + Content + Footer) */}
            <div className={`flex flex-col flex-1 transition-all duration-200 ${
                isSidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
            }`}>
                <Header
                    onMenuToggle={toggleSidebar}
                    isSidebarOpen={isSidebarOpen}
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                />

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

                <Footer darkMode={darkMode} />
            </div>
        </div>
    );
}