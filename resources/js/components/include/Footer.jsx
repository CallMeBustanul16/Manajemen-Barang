import React from 'react';
import { FaGithub, FaHeart } from 'react-icons/fa';
import { GiCoffeeCup } from 'react-icons/gi';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 py-4 px-6">
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
                <div className="flex items-center gap-1">
                    <span>&copy; {new Date().getFullYear()}</span>
                    <span className="font-medium text-gray-700">Manajemen Barang</span>
                </div>

                <div className="flex items-center gap-3 mt-2 sm:mt-0">
                    <a href="#" className="text-gray-400 hover:text-gray-600">
                        <FaGithub className="w-4 h-4" />
                    </a>
                    <span className="flex items-center gap-1">
                        Dibuat dengan <FaHeart className="text-red-500" /> oleh Tim Dev
                    </span>
                    <GiCoffeeCup className="w-4 h-4 text-gray-400" />
                </div>
            </div>
        </footer>
    );
}