import React from 'react';

export default function Dashboard() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="mt-4 text-gray-600">Selamat datang di Manajemen Inventory!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-blue-600">Total Produk</h3>
                    <p className="text-3xl font-bold mt-2">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-green-600">Total Kategori</h3>
                    <p className="text-3xl font-bold mt-2">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-red-600">Stok Menipis</h3>
                    <p className="text-3xl font-bold mt-2">0</p>
                </div>
            </div>
        </div>
    );
}