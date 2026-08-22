import React, { useState } from 'react';
import Header from '../components/include/Header';
import Sidebar from '../components/include/Sidebar';
import Footer from '../components/include/Footer';

export default function MainLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <Header onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />

            <div className="flex flex-1">
                {/* Sidebar */}
                <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

                {/* Main Content */}
                <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}