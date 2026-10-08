import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Box, ArrowUpRight, ArrowDownRight, History } from 'lucide-react';

export default function AktivitasTerbaru({ activities, darkMode }) {
    const items = Array.isArray(activities) ? activities.slice(0, 5) : [];

    const formatTime = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const isToday = date.toDateString() === now.toDateString();
            
            if (isToday) {
                return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
            }
            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        } catch {
            return '-';
        }
    };

    return (
        <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-200 ${
            darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-100 shadow-xs'
        }`}>
            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-4 h-4" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                            Aktivitas Terbaru
                        </h3>
                    </div>

                    <Link
                        to="/stok"
                        className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 flex items-center gap-1 group transition-colors"
                    >
                        <span>Lihat Semua</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                {/* Activity List or Empty State */}
                {items.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mb-2">
                            <History className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            Belum Ada Transaksi Persediaan
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 max-w-xs">
                            Transaksi stok masuk atau keluar akan otomatis tercatat di sini.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3.5">
                        {items.map((item) => {
                            const isMasuk = item.tipe === 'masuk';
                            return (
                                <div key={item.id} className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-xs ${
                                            isMasuk 
                                                ? 'bg-emerald-500 text-white' 
                                                : 'bg-rose-500 text-white'
                                        }`}>
                                            {isMasuk ? (
                                                <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
                                            ) : (
                                                <ArrowDownRight className="w-4 h-4" strokeWidth={2.5} />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate leading-tight">
                                                {isMasuk ? 'Stok masuk' : 'Stok keluar'}
                                            </p>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate leading-tight mt-0.5">
                                                <span className={`font-bold font-mono ${isMasuk ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                    {isMasuk ? '+' : '-'}{item.jumlah} unit
                                                </span>
                                                {' • '}{item.produk?.nama_produk || 'Barang'}
                                            </p>
                                        </div>
                                    </div>

                                    <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono flex-shrink-0">
                                        {formatTime(item.tanggal || item.created_at)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
