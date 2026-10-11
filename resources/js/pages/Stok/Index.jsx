import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus, Search, ChevronLeft, ChevronRight, Package,
    ArrowUp, ArrowDown, RefreshCw, Filter, X, Download, Printer, Scale
} from 'lucide-react';
import Swal from 'sweetalert2';
import { formatDateByPreference } from '../../lib/formatters';

export default function StokIndex() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterTipe, setFilterTipe] = useState('');
    const [filterProduk, setFilterProduk] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [printModalData, setPrintModalData] = useState(null);
    // Dynamic pagination & date format from user settings (Point 4 & 5)
    const [perPage, setPerPage] = useState(() => {
        try {
            const s = JSON.parse(localStorage.getItem('appSettings') || '{}');
            return parseInt(s.pagination_limit, 10) || 10;
        } catch {
            return 10;
        }
    });
    const [dateFormat, setDateFormat] = useState(() => {
        try {
            const s = JSON.parse(localStorage.getItem('appSettings') || '{}');
            return s.date_format || 'DD/MM/YYYY';
        } catch {
            return 'DD/MM/YYYY';
        }
    });

    useEffect(() => {
        const handleSettingsChange = (e) => {
            if (e.detail?.pagination_limit) {
                setPerPage(parseInt(e.detail.pagination_limit, 10) || 10);
                setCurrentPage(1);
            }
            if (e.detail?.date_format) {
                setDateFormat(e.detail.date_format);
            }
        };
        window.addEventListener('app-settings-changed', handleSettingsChange);
        return () => window.removeEventListener('app-settings-changed', handleSettingsChange);
    }, []);

    // Identitas Perusahaan / Kop Surat Dinamis
    const [companyProfile, setCompanyProfile] = useState(() => {
        try {
            const saved = localStorage.getItem('companyProfile');
            return saved ? JSON.parse(saved) : {
                company_name: 'PT. LOGISTIK JAYA ABADI',
                company_tagline: 'Divisi Pergudangan & Logistik Modern',
                company_address: 'Jl. Industri Pergudangan No. 88, Blok B, Jakarta Barat',
                company_phone: '021-5558899 / 0812-3456-7890',
                company_email: 'gudang@logistikjaya.co.id',
                company_pic: 'Admin User',
                company_pic_role: 'Kepala Logistik & Pergudangan',
                company_note: 'Barang yang telah diterima harap diperiksa secara teliti sesuai dokumen bukti fisik ini.'
            };
        } catch {
            return {
                company_name: 'PT. LOGISTIK JAYA ABADI',
                company_tagline: 'Divisi Pergudangan & Logistik Modern',
                company_address: 'Jl. Industri Pergudangan No. 88, Blok B, Jakarta Barat',
                company_phone: '021-5558899 / 0812-3456-7890',
                company_email: 'gudang@logistikjaya.co.id',
                company_pic: 'Admin User',
                company_pic_role: 'Kepala Logistik & Pergudangan',
                company_note: 'Barang yang telah diterima harap diperiksa secara teliti sesuai dokumen bukti fisik ini.'
            };
        }
    });

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await fetch('/api/settings/company');
                const json = await res.json();
                if (json.success && json.data) {
                    setCompanyProfile(json.data);
                    localStorage.setItem('companyProfile', JSON.stringify(json.data));
                }
            } catch (err) {
                console.error('Failed to load company profile:', err);
            }
        };
        fetchCompany();

        const handleCompanyUpdate = (e) => {
            if (e.detail) setCompanyProfile(e.detail);
        };
        window.addEventListener('company-profile-updated', handleCompanyUpdate);
        return () => window.removeEventListener('company-profile-updated', handleCompanyUpdate);
    }, []);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: currentPage,
                per_page: perPage,
            });
        
            if (filterTipe) params.append('tipe', filterTipe);
            if (filterProduk) params.append('produk_id', filterProduk);
            if (filterStartDate) {
            const start = new Date(filterStartDate);
                params.append('start_date', start.toISOString().split('T')[0]);
            }
            if (filterEndDate) {
                const end = new Date(filterEndDate);
                params.append('end_date', end.toISOString().split('T')[0]);
            }
            const response = await fetch(`/api/stok/history?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            const result = await response.json();

            if (response.ok) {
                const data = result.data || result;
                setTransactions(data.data || []);
                setTotalPages(data.last_page || 1);
                setTotalItems(data.total || 0);
                setLastUpdated(new Date());
            } else {
                Swal.fire('Error', result.message || 'Gagal memuat data', 'error');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            Swal.fire('Error', 'Gagal memuat riwayat stok', 'error');
        } finally {
            setLoading(false);
        }
    }, [currentPage, perPage, filterTipe, filterProduk, filterStartDate, filterEndDate]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleRefresh = () => {
        fetchTransactions();
        Swal.fire({
            title: 'Diperbarui!',
            text: 'Data riwayat stok telah diperbarui.',
            icon: 'success',
            timer: 1000,
            showConfirmButton: false,
        });
    };

    const handleExport = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();

            if (filterTipe) params.append('tipe', filterTipe);
            if (filterProduk) params.append('produk_id', filterProduk);
            if (filterStartDate) params.append('start_date', filterStartDate);
            if (filterEndDate) params.append('end_date', filterEndDate);

            const queryString = params.toString();
            const url = `/api/stok/export/excel${queryString ? '?' + queryString : ''}`;

            console.log('📤 Export URL:', url);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    Swal.fire('Error', errorData.message || 'Gagal export data', 'error');
                } else {
                    Swal.fire('Error', 'Gagal export data', 'error');
                }
                return;
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `stok-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);

            Swal.fire({
                title: 'Berhasil!',
                text: 'File Excel berhasil diunduh.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error('Export error:', error);
            Swal.fire('Error', 'Gagal export data', 'error');
        }
    };

    // Filter dinamis tanpa membuat ulang memori
    const filteredData = useMemo(() => {
        return transactions.filter(item =>
            item.produk?.nama_produk?.toLowerCase().includes(search.toLowerCase()) ||
            item.produk?.sku?.toLowerCase().includes(search.toLowerCase()) ||
            item.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
            item.catatan?.toLowerCase().includes(search.toLowerCase())
        );
    }, [transactions, search]);

    if (loading && currentPage === 1) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-xs text-gray-500">
                Memuat riwayat stok...
            </div>
        );
    }

    return (
        <div className="space-y-4 p-2 sm:p-4">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        Manajemen Stok
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                        Riwayat transaksi stok masuk dan keluar
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <button
                        onClick={handleRefresh}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">Export Excel</span>
                        <span className="xs:hidden">Export</span>
                    </button>

                    <Link
                        to="/stok/opname"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                    >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Stock Opname</span>
                    </Link>

                    <Link
                        to="/stok/masuk"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Stok Masuk</span>
                    </Link>

                    <Link
                        to="/stok/keluar"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Stok Keluar</span>
                    </Link>
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari produk, SKU, user..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="hidden sm:flex gap-2">
                    <select
                        value={filterTipe}
                        onChange={(e) => { setFilterTipe(e.target.value); setCurrentPage(1); }}
                        className="px-3 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                        <option value="">Semua Tipe</option>
                        <option value="masuk">Masuk</option>
                        <option value="keluar">Keluar</option>
                    </select>

                    {/* Input Tanggal Mulai */}
                    <input
                        type="date"
                        value={filterStartDate}
                        onChange={(e) => { setFilterStartDate(e.target.value); setCurrentPage(1); }}
                        className="px-3 py-2 text-xs border rounded-lg"
                        placeholder="Dari"
                    />

                    {/* Input Tanggal Selesai */}
                    <input
                        type="date"
                        value={filterEndDate}
                        onChange={(e) => { setFilterEndDate(e.target.value); setCurrentPage(1); }}
                        className="px-3 py-2 text-xs border rounded-lg"
                        placeholder="Sampai"
                    />

                    <button
                        onClick={() => {
                            setFilterTipe('');
                            setFilterProduk('');
                            setFilterStartDate('');
                            setFilterEndDate('');
                            setSearch('');
                            setCurrentPage(1);
                        }}
                        className="px-3 py-2 text-xs border rounded-lg hover:bg-gray-50"
                    >
                        Reset
                    </button>
                </div>

                <button
                    onClick={() => setShowMobileFilter(!showMobileFilter)}
                    className="sm:hidden flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300"
                >
                    <Filter className="w-3.5 h-3.5" />
                    Filter
                    {filterTipe && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                </button>
            </div>

            {/* Mobile Filter Panel */}
            {showMobileFilter && (
                <div className="sm:hidden bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-xs text-gray-700 dark:text-gray-300">Filter Tipe</span>
                        <button onClick={() => setShowMobileFilter(false)} className="p-1 text-gray-500">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <select
                        value={filterTipe}
                        onChange={(e) => { setFilterTipe(e.target.value); setCurrentPage(1); }}
                        className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value="">Semua Tipe</option>
                        <option value="masuk">Masuk</option>
                        <option value="keluar">Keluar</option>
                    </select>
                </div>
            )}

            {/* TABLE / MOBILE CARDS */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {filteredData.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-500">
                        <Package className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p>{search || filterTipe ? 'Tidak ada transaksi yang sesuai' : 'Belum ada transaksi stok'}</p>
                    </div>
                ) : (
                    <>
                        {/* DESKTOP TABLE */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3">No</th>
                                        <th className="px-4 py-3">Produk</th>
                                        <th className="px-4 py-3">Tipe</th>
                                        <th className="px-4 py-3 text-center">Jumlah</th>
                                        <th className="px-4 py-3">Perubahan Stok</th>
                                        <th className="px-4 py-3">User</th>
                                        <th className="px-4 py-3">Tanggal</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredData.map((item, index) => {
                                        const isMasuk = item.tipe === 'masuk';
                                        const isOpname = item.tipe === 'penyesuaian';
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                <td className="px-4 py-3 text-gray-500">{(currentPage - 1) * perPage + index + 1}</td>
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold text-gray-900 dark:text-white">{item.produk?.nama_produk || '-'}</div>
                                                    <div className="text-[11px] text-gray-400">SKU: {item.produk?.sku || '-'}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                                        isMasuk 
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                                            : isOpname
                                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                                                    }`}>
                                                        {isMasuk ? <ArrowUp className="w-3 h-3" /> : isOpname ? <Scale className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                                        {isMasuk ? 'Masuk' : isOpname ? 'Penyesuaian' : 'Keluar'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center font-bold font-mono text-gray-900 dark:text-white">{item.jumlah}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                                            isMasuk 
                                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                                                                : isOpname
                                                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                                                : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                                                        }`}>
                                                            {item.batch_id ? `Batch #${item.batch_id}` : 'Gudang'}
                                                        </span>
                                                        <span className="text-gray-400">{item.stok_sebelum}</span>
                                                        <span className="mx-1 text-gray-400">→</span>
                                                        <span className="font-semibold text-gray-900 dark:text-white">{item.stok_sesudah}</span>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.user?.name || '-'}</td>
                                                <td className="px-4 py-3 text-gray-400">
                                                    {item.tanggal ? formatDateByPreference(item.tanggal, dateFormat, true) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => setPrintModalData(item)}
                                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                                                        title="Cetak Bukti / Surat Jalan"
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE CARDS */}
                        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredData.map((item) => {
                                const isMasuk = item.tipe === 'masuk';
                                const isOpname = item.tipe === 'penyesuaian';
                                return (
                                    <div key={item.id} className="p-3 space-y-2 text-xs">
                                        <div className="flex justify-between items-start">
                                            <div className="truncate pr-2">
                                                <p className="font-semibold text-gray-900 dark:text-white truncate">{item.produk?.nama_produk || '-'}</p>
                                                <p className="text-[11px] text-gray-400">SKU: {item.produk?.sku || '-'}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 ${
                                                    isMasuk 
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                                        : isOpname
                                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                                                }`}>
                                                    {isMasuk ? <ArrowUp className="w-3 h-3" /> : isOpname ? <Scale className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                                    {isMasuk ? 'Masuk' : isOpname ? 'Opname' : 'Keluar'}
                                                </span>
                                                <button
                                                    onClick={() => setPrintModalData(item)}
                                                    className="p-1 text-gray-500 hover:text-red-600 rounded bg-gray-50 dark:bg-gray-800"
                                                    title="Cetak Bukti"
                                                >
                                                    <Printer className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-100 dark:border-gray-700/50">
                                            <div>
                                                <span className="text-[10px] text-gray-400">Jumlah</span>
                                                <p className="font-bold text-gray-900 dark:text-white">{item.jumlah} pcs</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-400">Stok</span>
                                                <p className="font-medium text-gray-700 dark:text-gray-300">{item.stok_sebelum} → {item.stok_sesudah}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-400">User</span>
                                                <p className="text-gray-700 dark:text-gray-300 truncate">{item.user?.name || '-'}</p>
                                            </div>
                                        </div>

                                        <p className="text-[10px] text-gray-400">
                                            {item.tanggal ? formatDateByPreference(item.tanggal, dateFormat, true) : '-'}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-xs">
                                <span className="text-gray-500">Hal {currentPage} dari {totalPages}</span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-1.5 border rounded disabled:opacity-40"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-1.5 border rounded disabled:opacity-40"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Info Footer */}
            <div className="text-center text-[11px] text-gray-400">
                Total: {totalItems} transaksi • Update: {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
            </div>

            {/* MODAL CETAK BUKTI / SURAT JALAN / SLIP TRANSAKSI */}
            {printModalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                                <Printer className="w-4 h-4 text-red-600" />
                                <span>Pratinjau Dokumen Transaksi Resmi</span>
                            </div>
                            <button
                                onClick={() => setPrintModalData(null)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Printable Area */}
                        <div id="printable-receipt" className="p-6 overflow-y-auto flex-1 bg-white text-gray-900 space-y-6">
                            {/* Kop Surat */}
                            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4">
                                <div>
                                    <h2 className="text-xl font-black tracking-tight text-gray-900 uppercase">
                                        {companyProfile.company_name || 'Sistem Manajemen Inventaris'}
                                    </h2>
                                    <p className="text-xs text-gray-700 font-semibold mt-0.5">
                                        {companyProfile.company_tagline || 'Divisi Pergudangan & Logistik • Bukti Transaksi Resmi'}
                                    </p>
                                    <p className="text-[11px] text-gray-500 mt-0.5">
                                        {companyProfile.company_address} {companyProfile.company_phone && `• Telp: ${companyProfile.company_phone}`}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                        Dicetak pada: {new Date().toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-block px-3 py-1 rounded text-xs font-black uppercase tracking-wider ${
                                        printModalData.tipe === 'masuk'
                                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                            : printModalData.tipe === 'penyesuaian'
                                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                            : 'bg-rose-100 text-rose-900 border border-rose-300'
                                    }`}>
                                        {printModalData.tipe === 'masuk'
                                            ? 'SURAT BUKTI PENERIMAAN'
                                            : printModalData.tipe === 'penyesuaian'
                                            ? 'BERITA ACARA STOCK OPNAME'
                                            : 'SURAT JALAN PENGELUARAN'}
                                    </span>
                                    <p className="text-xs font-mono font-bold mt-1 text-gray-700">
                                        NO: TRX-{String(printModalData.id).padStart(6, '0')}
                                    </p>
                                </div>
                            </div>

                            {/* Info Meta Transaksi */}
                            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div>
                                    <span className="text-gray-500 block">Tanggal Transaksi:</span>
                                    <span className="font-semibold text-gray-900">
                                        {formatDateByPreference(printModalData.tanggal, dateFormat, true)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Petugas / Operator:</span>
                                    <span className="font-semibold text-gray-900">
                                        {printModalData.user?.name || 'Administrator'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Batch / Lokasi Rak:</span>
                                    <span className="font-semibold text-gray-900">
                                        {printModalData.batch_id ? `Batch #${printModalData.batch_id} (Rak: ${printModalData.batch?.lokasi_rak || '-'})` : 'Gudang Utama'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Jenis Mutasi:</span>
                                    <span className="font-semibold text-gray-900 uppercase">
                                        {printModalData.tipe} ({printModalData.jumlah} Unit)
                                    </span>
                                </div>
                            </div>

                            {/* Tabel Barang */}
                            <table className="w-full text-xs text-left border-collapse border border-gray-300">
                                <thead className="bg-gray-100 text-gray-700 uppercase text-[10px] font-bold">
                                    <tr>
                                        <th className="border border-gray-300 p-2">Item Produk</th>
                                        <th className="border border-gray-300 p-2">SKU</th>
                                        <th className="border border-gray-300 p-2 text-center">Stok Sebelum</th>
                                        <th className="border border-gray-300 p-2 text-center">Mutasi</th>
                                        <th className="border border-gray-300 p-2 text-center">Stok Sesudah</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-gray-300 p-2 font-bold text-gray-900">
                                            {printModalData.produk?.nama_produk || '-'}
                                        </td>
                                        <td className="border border-gray-300 p-2 font-mono">
                                            {printModalData.produk?.sku || '-'}
                                        </td>
                                        <td className="border border-gray-300 p-2 text-center font-mono">
                                            {printModalData.stok_sebelum}
                                        </td>
                                        <td className="border border-gray-300 p-2 text-center font-mono font-bold">
                                            {printModalData.tipe === 'masuk' ? `+${printModalData.jumlah}` : printModalData.tipe === 'penyesuaian' ? `±${printModalData.jumlah}` : `-${printModalData.jumlah}`}
                                        </td>
                                        <td className="border border-gray-300 p-2 text-center font-mono font-bold text-gray-900">
                                            {printModalData.stok_sesudah}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Catatan */}
                            {printModalData.catatan && (
                                <div className="text-xs p-2.5 rounded bg-gray-50 border border-gray-200">
                                    <span className="font-bold text-gray-700">Keterangan / Catatan:</span>
                                    <p className="text-gray-600 mt-0.5 italic">{printModalData.catatan}</p>
                                </div>
                            )}

                            {/* Kolom Tanda Tangan */}
                            <div className="grid grid-cols-3 gap-4 pt-8 text-center text-xs">
                                <div>
                                    <p className="text-gray-500 mb-12">Diserahkan Oleh,</p>
                                    <p className="font-bold text-gray-900 border-t border-gray-300 pt-1 mx-2">( ......................... )</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Pengirim / Supplier</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-12">Diterima Oleh,</p>
                                    <p className="font-bold text-gray-900 border-t border-gray-300 pt-1 mx-2">( ......................... )</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Penerima Divisi</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-12">Kepala Gudang / PIC,</p>
                                    <p className="font-bold text-gray-900 border-t border-gray-300 pt-1 mx-2">( {companyProfile.company_pic || printModalData.user?.name || 'Administrator'} )</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{companyProfile.company_pic_role || 'Kepala Pergudangan'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <button
                                onClick={() => setPrintModalData(null)}
                                className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
                            >
                                Tutup
                            </button>
                            <button
                                onClick={() => {
                                    const printContent = document.getElementById('printable-receipt');
                                    const win = window.open('', '', 'width=800,height=600');
                                    win.document.write(`
                                        <html>
                                            <head>
                                                <title>Cetak Transaksi #${printModalData.id}</title>
                                                <script src="https://cdn.tailwindcss.com"></script>
                                                <style>
                                                    @media print {
                                                        body { margin: 0; padding: 20px; }
                                                    }
                                                </style>
                                            </head>
                                            <body onload="window.print(); window.close();">
                                                ${printContent.innerHTML}
                                            </body>
                                        </html>
                                    `);
                                    win.document.close();
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-md"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Cetak Sekarang</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}