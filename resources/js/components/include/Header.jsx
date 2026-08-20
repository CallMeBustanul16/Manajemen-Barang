import React from 'react';

export default function Header() {
    return (
        <header className="bg-blue-600 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold">Manajemen Inventory</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm">Admin</span>
                    <button className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition">
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}