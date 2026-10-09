import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, AlertTriangle, ArrowRight, ArrowUpFromLine, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function FefoEarlyWarningWidget({ batches = [], darkMode }) {
    const expiringItems = batches.slice(0, 4);
    const hasItems = expiringItems.length > 0;

    return (
        <div className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
            darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-100 shadow-xs'
        }`}>
            <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                                    Peringatan Dini FEFO
                                </h3>
                                {hasItems && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                                        {batches.length} Batch
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-normal leading-tight mt-0.5">
                                First Expired, First Out (Prioritas Pengeluaran Stok)
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/batch?tab=expiring"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition"
                    >
                        <span>Lihat Semua</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Content */}
                {!hasItems ? (
                    <div className="py-6 text-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            Semua Batch Aman
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            Tidak ada batch yang mendekati masa kadaluarsa dalam 30 hari ke depan.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {expiringItems.map((batch) => {
                            const isExpired = batch.days_left < 0;
                            const isCritical = batch.days_left >= 0 && batch.days_left <= 7;
                            const isWarning = batch.days_left > 7 && batch.days_left <= 14;

                            return (
                                <div
                                    key={batch.id}
                                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                                        isExpired
                                            ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30'
                                            : isCritical
                                            ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/40'
                                            : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800'
                                    }`}
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                                {batch.produk?.nama_produk || 'Produk'}
                                            </p>
                                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-gray-200/70 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex-shrink-0">
                                                {batch.qr_code}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                                            <span>Rak: <strong className="text-gray-700 dark:text-gray-300">{batch.lokasi_rak || '-'}</strong></span>
                                            <span>•</span>
                                            <span>Sisa: <strong className="text-gray-700 dark:text-gray-300">{batch.stok_saat_ini} pcs</strong></span>
                                            <span>•</span>
                                            <span>Exp: {batch.tanggal_kadaluarsa}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                                            isExpired
                                                ? 'bg-red-600 text-white'
                                                : isCritical
                                                ? 'bg-amber-500 text-white shadow-2xs'
                                                : isWarning
                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                                        }`}>
                                            {isExpired 
                                                ? `Kadaluarsa` 
                                                : `H-${batch.days_left} Hari`}
                                        </span>

                                        <Link
                                            to="/stok/Keluar"
                                            title="Keluarkan stok batch ini"
                                            className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
                                        >
                                            <ArrowUpFromLine className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {hasItems && (
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between">
                    <span>💡 Tip: Terapkan sistem FEFO saat mengeluarkan barang.</span>
                    <Link
                        to="/stok/Keluar"
                        className="text-red-600 dark:text-red-400 font-semibold hover:underline"
                    >
                        Proses Stok Keluar →
                    </Link>
                </div>
            )}
        </div>
    );
}
