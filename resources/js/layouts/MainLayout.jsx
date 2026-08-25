import React, { useState } from 'react';
import Header from '../components/include/Header';
import Sidebar from '../components/include/Sidebar';
import Footer from '../components/include/Footer';

export default function MainLayout({ children, darkMode, toggleDarkMode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <Header
                onMenuToggle={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
            />

            <div className="flex flex-1">
                <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} darkMode={darkMode} />

                <main className={`flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            <Footer darkMode={darkMode} />
        </div>
    );
}