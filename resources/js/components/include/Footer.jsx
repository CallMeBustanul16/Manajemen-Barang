import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-blue-600 text-white text-center py-3 mt-4">
            <p className="text-sm">
                &copy; {new Date().getFullYear()} Manajemen Barang
            </p>
        </footer>
    );
}