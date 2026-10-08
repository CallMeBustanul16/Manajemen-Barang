import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Mouse, Keyboard, Cable, Printer, BatteryCharging, Package, CheckCircle2 } from 'lucide-react';

export default function StokMenipisTable({ products, darkMode, showStock = true }) {
    const getIconForProduct = (name) => {
        const lower = (name || '').toLowerCase();
        if (lower.includes('mouse')) return Mouse;
        if (lower.includes('keyboard')) return Keyboard;
        if (lower.includes('kabel') || lower.includes('hdmi')) return Cable;
        if (lower.includes('printer') || lower.includes('toner')) return Printer;
        if (lower.includes('power') || lower.includes('bank') || lower.includes('baterai')) return BatteryCharging;
        return Package;
    };

    const items = Array.isArray(products) ? products.slice(0, 5) : [];

    return (
        <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-200 ${
            darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-100 shadow-xs'
        }`}>
            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                                Stok Menipis
                            </h3>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-normal leading-tight mt-0.5">
                                Produk dengan jumlah stok di bawah minimum
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/stok"
                        className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 flex items-center gap-1 group transition-colors"
                    >
                        <span>Lihat Semua</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                {/* Table or Empty State */}
                {items.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            Semua Stok Produk Aman
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 max-w-xs">
                            Tidak ada produk dengan jumlah stok di bawah batas minimum saat ini.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className={`border-b text-[11px] font-semibold uppercase tracking-wider ${
                                    darkMode ? 'border-gray-800 text-gray-400' : 'border-gray-100 text-gray-400'
                                }`}>
                                    <th className="py-2.5 px-2 w-8">No</th>
                                    <th className="py-2.5 px-3">Produk</th>
                                    <th className="py-2.5 px-3 text-center">Stok</th>
                                    <th className="py-2.5 px-3 text-center">Minimum</th>
                                    <th className="py-2.5 px-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${darkMode ? 'divide-gray-800/60' : 'divide-gray-50'}`}>
                                {items.map((item, index) => {
                                    const IconComponent = getIconForProduct(item.nama_produk);
                                    const isHabis = Number(item.stok) <= 0;
                                    return (
                                        <tr key={item.id || index} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                                            <td className="py-3 px-2 text-gray-400 font-medium">
                                                {index + 1}
                                            </td>
                                            <td className="py-3 px-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 flex-shrink-0">
                                                        <IconComponent className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div className="truncate max-w-[150px]">
                                                        <span className="font-semibold text-gray-800 dark:text-gray-200 block truncate">
                                                            {item.nama_produk}
                                                        </span>
                                                        {item.kategori?.nama_kategori && (
                                                            <span className="text-[10px] text-gray-400 block truncate">
                                                                {item.kategori.nama_kategori}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`py-3 px-3 text-center font-bold ${
                                                isHabis ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                                            }`}>
                                                {showStock ? item.stok : '••••'}
                                            </td>
                                            <td className="py-3 px-3 text-center text-gray-400 dark:text-gray-500 font-medium">
                                                {showStock ? (item.stok_minimal || 0) : '••••'}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                                    isHabis 
                                                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40' 
                                                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40'
                                                }`}>
                                                    {isHabis ? 'Habis' : 'Menipis'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
