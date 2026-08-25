import React from 'react';
import { FaGithub, FaHeart } from 'react-icons/fa';
import { GiCoffeeCup } from 'react-icons/gi';

export default function Footer({ darkMode }) {
    const currentYear=new Date().getFullYear();
    return (
        <footer className={`border-t py-4 px-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm">
                <div className="flex items-center gap-1">
                    <span>&copy; {currentYear}</span>
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Manajemen Barang</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">All rights reserved</span>
                </div>

                <div className="flex items-center gap-3 mt-2 sm:mt-0">
                    <a href="Malas taro link wak" className="text-gray-400 hover:text-gray-600">
                        <FaGithub className="w-4 h-4" />
                    </a>
                    <span className={`flex items-center gap-1 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Dibuat dengan <FaHeart className="text-red-600" /> oleh Tim Dev
                    </span>
                    <GiCoffeeCup className="w-4 h-4 text-gray-400" />
                </div>
            </div>
        </footer>
    );
}