import React, { useState, useEffect } from 'react';
import { 
    History, Search, Filter, RefreshCw, User, Calendar, 
    Shield, ArrowDown, ArrowUp, Scale, Edit3, Trash2, PlusCircle, FileSpreadsheet
} from 'lucide-react';
import { formatDateByPreference } from '../../lib/formatters';

export default function AuditLogIndex() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [entityFilter, setEntityFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchLogs();
    }, [page, actionFilter, entityFilter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({ page, per_page: 15 });
            if (actionFilter) params.append('action', actionFilter);
            if (entityFilter) params.append('entity_type', entityFilter);
            if (search) params.append('search', search);

            const res = await fetch(`/api/audit-logs?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (res.ok) {
                const result = await res.json();
                setLogs(result.data?.data || []);
                setTotalPages(result.data?.last_page || 1);
                setTotalItems(result.data?.total || 0);
            }
        } catch (e) {
            console.error('Error fetching logs:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchLogs();
    };

    const getActionBadge = (action) => {
        switch (action) {
            case 'create':
                return { bg: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', label: 'Tambah Data', icon: PlusCircle };
            case 'update':
                return { bg: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800', label: 'Perbarui', icon: Edit3 };
            case 'delete':
                return { bg: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800', label: 'Hapus', icon: Trash2 };
            case 'in':
                return { bg: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', label: 'Stok Masuk', icon: ArrowUp };
            case 'out':
                return { bg: 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800', label: 'Stok Keluar', icon: ArrowDown };
            case 'adjustment':
                return { bg: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800', label: 'Stock Opname', icon: Scale };
            case 'import':
                return { bg: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800', label: 'Import Excel', icon: FileSpreadsheet };
            default:
                return { bg: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700', label: action, icon: Shield };
        }
    };

    return (
        <div className="space-y-4 p-2 sm:p-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-red-600" />
                        Audit Log & Riwayat Aktivitas
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Catatan audit transparansi setiap mutasi, pembuatan, dan pengeditan data di sistem
                    </p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="p-2 self-start sm:self-auto text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                    title="Refresh Log"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row gap-3">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari deskripsi aktivitas atau nama user..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                </form>

                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                    <select
                        value={actionFilter}
                        onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                        className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value="">Semua Aksi</option>
                        <option value="create">Tambah Data</option>
                        <option value="update">Perbarui</option>
                        <option value="delete">Hapus Data</option>
                        <option value="in">Stok Masuk</option>
                        <option value="out">Stok Keluar</option>
                        <option value="adjustment">Stock Opname</option>
                        <option value="import">Import Excel</option>
                    </select>

                    <select
                        value={entityFilter}
                        onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
                        className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value="">Semua Entitas</option>
                        <option value="Produk">Produk</option>
                        <option value="Stok">Stok Transaksi</option>
                        <option value="Batch">Batch</option>
                        <option value="Kategori">Kategori</option>
                        <option value="Pemasok">Pemasok</option>
                    </select>
                </div>
            </div>

            {/* List / Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="text-center py-12 text-xs text-gray-400">Memuat riwayat aktivitas...</div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-12 text-xs text-gray-400">
                        <History className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                        Belum ada catatan aktivitas yang sesuai
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {logs.map((log) => {
                            const badge = getActionBadge(log.action);
                            const IconComponent = badge.icon;
                            return (
                                <div key={log.id} className="p-3.5 sm:p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors flex items-start gap-3">
                                    <div className={`p-2 rounded-xl border flex-shrink-0 ${badge.bg}`}>
                                        <IconComponent className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                                                {badge.label}
                                            </span>
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                                {log.entity_type}
                                            </span>
                                            <span className="text-[11px] text-gray-400 ml-auto font-mono">
                                                {new Date(log.created_at).toLocaleString('id-ID', {
                                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed font-normal">
                                            {log.description}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                                            <span className="flex items-center gap-1 font-medium text-gray-600 dark:text-gray-400">
                                                <User className="w-3 h-3 text-red-500" />
                                                {log.user_name || 'Admin'}
                                            </span>
                                            <span>•</span>
                                            <span className="font-mono text-[10px] text-gray-400">
                                                IP: {log.ip_address || '127.0.0.1'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                            Halaman {page} dari {totalPages} ({totalItems} total aktivitas)
                        </span>
                        <div className="flex gap-1.5">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40"
                            >
                                Sebelumnya
                            </button>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40"
                            >
                                Berikutnya
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
