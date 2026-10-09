import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Package, ArrowDownToLine, ArrowUpFromLine, FileText, ClipboardCheck, History } from 'lucide-react';

export default function AksiCepat({ darkMode }) {
    const actions = [
        {
            to: '/produk/Create',
            icon: Package,
            label: 'Tambah Produk',
            iconColor: 'text-red-600',
        },
        {
            to: '/stok/Masuk',
            icon: ArrowDownToLine,
            label: 'Stok Masuk',
            iconColor: 'text-emerald-600',
        },
        {
            to: '/stok/Keluar',
            icon: ArrowUpFromLine,
            label: 'Stok Keluar',
            iconColor: 'text-rose-600',
        },
        {
            to: '/stok/opname',
            icon: ClipboardCheck,
            label: 'Stock Opname',
            iconColor: 'text-amber-500',
        },
        {
            to: '/laporan',
            icon: FileText,
            label: 'Laporan',
            iconColor: 'text-blue-500',
        },
        {
            to: '/audit-log',
            icon: History,
            label: 'Riwayat Audit',
            iconColor: 'text-purple-500',
        },
    ];

    return (
        <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-200 ${
            darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-100 shadow-xs'
        }`}>
            <div>
                {/* Header */}
                <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
                        <Zap className="w-4 h-4 fill-red-600 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                            Aksi Cepat
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-normal leading-tight mt-0.5">
                            Pintasan cepat operasional gudang
                        </p>
                    </div>
                </div>

                {/* 2x3 Action Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {actions.map((act, index) => {
                        const Icon = act.icon;
                        return (
                            <Link
                                key={index}
                                to={act.to}
                                className={`p-3 sm:p-3.5 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all duration-200 group border cursor-pointer ${
                                    darkMode 
                                        ? 'bg-gray-800/80 hover:bg-gray-800 border-gray-700/80 hover:border-red-500/50' 
                                        : 'bg-[#fff7f7] hover:bg-[#ffeded] border-rose-100 hover:border-red-200 shadow-xs hover:shadow'
                                } hover:-translate-y-0.5`}
                            >
                                <Icon className={`w-5 h-5 ${act.iconColor} group-hover:scale-110 transition-transform`} />
                                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                                    {act.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
