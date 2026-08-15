import React from 'react';
import Header from '../components/include/Header';
import Sidebar from '../components/include/Sidebar';
import Footer from '../components/include/Footer';

export default function MainLayout({ children }) {
    return (
        <div className="min-h-screen flex">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 p-6 bg-gray-50">
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
}