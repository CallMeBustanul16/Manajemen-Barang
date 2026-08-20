import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
    return (
        <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
            <nav>
                <ul className="space-y-2">
                    <li>
                        <Link to="/dashboard" className="block py-2 px-4 hover:bg-gray-700 rounded transition">
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to="/produk" className="block py-2 px-4 hover:bg-gray-700 rounded transition">
                            Produk
                        </Link>
                    </li>
                    <li>
                        <Link to="/kategori" className="block py-2 px-4 hover:bg-gray-700 rounded transition">
                            Kategori
                        </Link>
                    </li>
                    <li>
                        <Link to="/pemasok" className="block py-2 px-4 hover:bg-gray-700 rounded transition">
                            Pemasok
                        </Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}