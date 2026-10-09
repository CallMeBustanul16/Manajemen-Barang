import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Plus, Edit, Trash2, 
    Search, ChevronLeft, ChevronRight, 
    QrCode, Download, X, Eye, Printer, Upload, FileSpreadsheet
} from 'lucide-react';
import Swal from 'sweetalert2';
import { produkAPI } from '../../lib/api';

export default function ProdukHome() {
    const navigate = useNavigate();
    const [produk, setProduk] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [qrModalProduk, setQrModalProduk] = useState(null);
    const [qrModalImage, setQrModalImage] = useState(null);
    const [qrLoading, setQrLoading] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importing, setImporting] = useState(false);
    
    // Dynamic pagination, table density & default sort from user settings (Point 5 & 6)
    const [perPage, setPerPage] = useState(() => {
        try {
            const s = JSON.parse(localStorage.getItem('appSettings') || '{}');
            return parseInt(s.pagination_limit, 10) || 10;
        } catch {
            return 10;
        }
    });

    const [tableDensity, setTableDensity] = useState(() => {
        try {
            const s = JSON.parse(localStorage.getItem('appSettings') || '{}');
            return s.table_density || 'comfortable';
        } catch {
            return 'comfortable';
        }
    });

    const [defaultSort, setDefaultSort] = useState(() => {
        try {
            const s = JSON.parse(localStorage.getItem('appSettings') || '{}');
            return s.default_sort || 'newest';
        } catch {
            return 'newest';
        }
    });

    useEffect(() => {
        const handleSettingsChange = (e) => {
            if (e.detail?.pagination_limit) {
                setPerPage(parseInt(e.detail.pagination_limit, 10) || 10);
                setCurrentPage(1);
            }
            if (e.detail?.table_density) {
                setTableDensity(e.detail.table_density);
            }
            if (e.detail?.default_sort) {
                setDefaultSort(e.detail.default_sort);
            }
        };
        window.addEventListener('app-settings-changed', handleSettingsChange);
        return () => window.removeEventListener('app-settings-changed', handleSettingsChange);
    }, []);

    // Fetch API HANYA sekali saat komponen pertama di-mount
    useEffect(() => {
        fetchProduk();
    }, []);

    // Reset ke halaman 1 setiap kali input pencarian berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const fetchProduk = async () => {
        setLoading(true);
        try {
            const response = await produkAPI.getAll();
            const data = response.data.data || response.data;
            setProduk(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error mengumpulkan data produk:', error);
            Swal.fire('Error', 'Gagal memuat data produk', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id, nama) => {
        Swal.fire({
            title: 'Kamu yakin ingin menghapusnya?',
            text: `Produk "${nama}" akan dihapus secara permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await produkAPI.delete(id);
                    Swal.fire('Terhapus!', `Produk "${nama}" berhasil dihapus.`, 'success');
                    fetchProduk();
                } catch (error) {
                    console.error('Error deleting produk:', error);
                    Swal.fire('Error', 'Gagal menghapus produk', 'error');
                }
            }
        });
    };

    const getStatusStok = (stok, stokMinimal) => {
        if (stok <= 0) return { label: 'Habis', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
        if (stok <= stokMinimal) return { label: 'Menipis', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
        return { label: 'Aman', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
    };

    // Filter & Sorting dihitung secara dinamis via useMemo (Memori Ringan)
    const filteredData = useMemo(() => {
        const list = produk.filter(item =>
            item.nama_produk?.toLowerCase().includes(search.toLowerCase()) ||
            item.sku?.toLowerCase().includes(search.toLowerCase())
        );

        return list.slice().sort((a, b) => {
            if (defaultSort === 'lowest_stock') {
                return (Number(a.stok) || 0) - (Number(b.stok) || 0);
            }
            if (defaultSort === 'highest_stock') {
                return (Number(b.stok) || 0) - (Number(a.stok) || 0);
            }
            if (defaultSort === 'name_asc') {
                return (a.nama_produk || '').localeCompare(b.nama_produk || '');
            }
            // default 'newest': sort by id descending
            const idA = Number(a.id) || 0;
            const idB = Number(b.id) || 0;
            return idB - idA;
        });
    }, [produk, search, defaultSort]);

    const totalPages = useMemo(() => {
        return Math.ceil(filteredData.length / perPage) || 1;
    }, [filteredData]);

    const paginatedData = useMemo(() => {
        return filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);
    }, [filteredData, currentPage]);

    const cellPadding = tableDensity === 'compact' ? 'px-3 py-1.5' : 'px-4 py-3';
    const mobilePadding = tableDensity === 'compact' ? 'p-2 space-y-1.5' : 'p-3 space-y-2';

    const handleOpenQrModal = async (item) => {
        setQrLoading(true);
        setQrModalProduk(item);
        setQrModalImage(null);

        try {
            const token = localStorage.getItem('token');
            // Pastikan QR string & file PNG selalu ada di server
            const genRes = await fetch(`/api/produk/${item.id}/generate-qr`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });
            const genData = await genRes.json();
            
            if (genRes.ok && genData.data?.qr_code) {
                const updatedItem = { ...item, qr_code: genData.data.qr_code };
                setQrModalProduk(updatedItem);
                setProduk(prev => prev.map(p => p.id === item.id ? updatedItem : p));
            }

            // Fetch gambar QR via blob agar tampil 100% instan di modal
            const imgResponse = await fetch(`/api/produk/${item.id}/download-qr`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (imgResponse.ok) {
                const blob = await imgResponse.blob();
                const imgUrl = URL.createObjectURL(blob);
                setQrModalImage(imgUrl);
            } else {
                setQrModalImage(`/storage/qrcodes/produk-${item.id}.png?t=${Date.now()}`);
            }
        } catch (error) {
            console.error('Error opening QR modal:', error);
            setQrModalImage(`/storage/qrcodes/produk-${item.id}.png?t=${Date.now()}`);
        } finally {
            setQrLoading(false);
        }
    };

    const handleCloseQrModal = () => {
        if (qrModalImage && qrModalImage.startsWith('blob:')) {
            URL.revokeObjectURL(qrModalImage);
        }
        setQrModalProduk(null);
        setQrModalImage(null);
    };

    const handleDownloadProdukQr = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/produk/${id}/download-qr`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `produk-${id}.png`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                const data = await response.json();
                Swal.fire('Error', data.message || 'Gagal download QR', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Gagal download QR', 'error');
        }
    };

    // Preferensi Cetak Label QR Kardus & Rak (Point 1)
    const handlePrintQrLabel = () => {
        if (!qrModalImage || !qrModalProduk) return;
        try {
            const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
            const labelSize = settings.qr_label_size || 'medium';
            const showInfo = settings.qr_show_product_info !== false;

            const sizeDimensions = {
                small: { w: '30mm', h: '20mm', img: '14mm', font: '8px' },
                medium: { w: '50mm', h: '30mm', img: '22mm', font: '10px' },
                standard: { w: '70mm', h: '50mm', img: '35mm', font: '12px' },
            }[labelSize] || { w: '50mm', h: '30mm', img: '22mm', font: '10px' };

            const printWindow = window.open('', '_blank', 'width=500,height=500');
            if (!printWindow) {
                window.print();
                return;
            }
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Label QR - ${qrModalProduk.nama_produk}</title>
                    <style>
                        @page {
                            size: ${sizeDimensions.w} ${sizeDimensions.h};
                            margin: 0;
                        }
                        body {
                            margin: 0;
                            padding: 2mm;
                            font-family: system-ui, -apple-system, sans-serif;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            box-sizing: border-box;
                            text-align: center;
                        }
                        img {
                            width: ${sizeDimensions.img};
                            height: ${sizeDimensions.img};
                            object-fit: contain;
                        }
                        .name {
                            font-size: ${sizeDimensions.font};
                            font-weight: bold;
                            margin-top: 1mm;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            max-width: 95%;
                        }
                        .sku {
                            font-size: calc(${sizeDimensions.font} - 2px);
                            color: #444;
                            font-family: monospace;
                        }
                    </style>
                </head>
                <body>
                    <img src="${qrModalImage}" alt="QR" />
                    ${showInfo ? `
                        <div class="name">${qrModalProduk.nama_produk}</div>
                        <div class="sku">SKU: ${qrModalProduk.sku || '-'}</div>
                    ` : ''}
                    <script>
                        window.onload = function() {
                            window.print();
                            window.onafterprint = function() { window.close(); };
                        };
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        } catch (e) {
            console.error('Print label error:', e);
            window.print();
        }
    };

    const handleDownloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "nama_produk,kategori,pemasok,stok,stok_minimal,deskripsi\n"
            + "Baterai AA Alkaline,Elektronik,PT Sumber Jaya,100,20,Baterai ukuran AA isi ulang\n"
            + "Kertas HVS A4 80gr,Alat Tulis,CV Makmur Paper,50,10,Kertas fotokopi 1 rim\n"
            + "Kabel HDMI 2 Meter,Elektronik,PT Elektronik Indo,30,5,Kabel HDMI 4K high speed\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "template_import_produk.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleImportSubmit = async (e) => {
        e.preventDefault();
        if (!importFile) {
            Swal.fire('Peringatan', 'Silakan pilih file CSV terlebih dahulu', 'warning');
            return;
        }

        setImporting(true);
        try {
            const formData = new FormData();
            formData.append('file', importFile);

            const token = localStorage.getItem('token');
            const res = await fetch('/api/produk/import', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const result = await res.json();
            if (res.ok && result.success) {
                Swal.fire({
                    title: 'Berhasil!',
                    text: result.message || `Berhasil mengimpor ${result.data?.total_imported} produk.`,
                    icon: 'success',
                });
                setShowImportModal(false);
                setImportFile(null);
                fetchProduk();
            } else {
                Swal.fire('Gagal Import', result.message || 'Terjadi kesalahan saat memproses data.', 'error');
            }
        } catch (error) {
            console.error('Import error:', error);
            Swal.fire('Error', 'Gagal memproses file import', 'error');
        } finally {
            setImporting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-sm text-gray-500">
                Memuat data produk...
            </div>
        );
    }

    return (
        <div className="space-y-4 p-2 sm:p-4 relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Manajemen Produk</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Kelola data produk inventory</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                        <Upload className="w-4 h-4" /> Import Excel
                    </button>
                    <Link
                        to="/Produk/Create"
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Tambah Produk
                    </Link>
                </div>
            </div>

            {/* Input Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Cari produk (nama atau SKU)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-red-500 outline-none"
                />
            </div>

            {/* List Data */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {paginatedData.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-500">
                        {search ? 'Tidak ada produk yang cocok' : 'Belum ada data produk'}
                    </div>
                ) : (
                    <>
                        {/* Tampilan Desktop (Tabel) */}
                        <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                                <tr>
                                                    <th className={cellPadding}>No</th>
                                                    <th className={cellPadding}>Produk</th>
                                                    <th className={cellPadding}>Kategori</th>
                                                    <th className={`${cellPadding} text-center`}>Stok</th>
                                                    <th className={`${cellPadding} text-center`}>Aksi</th>
                                                    <th className={`${cellPadding} text-center`}>QR Code</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {paginatedData.map((item, index) => {
                                                    const status = getStatusStok(item.stok, item.stok_minimal || 5);
                                                    return (
                                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                            <td className={`${cellPadding} text-gray-500`}>{(currentPage - 1) * perPage + index + 1}</td>
                                                            <td className={cellPadding}>
                                                                <div className="font-semibold text-gray-900 dark:text-white">{item.nama_produk}</div>
                                                                <div className="text-[11px] text-gray-400">SKU: {item.sku}</div>
                                                            </td>
                                                            <td className={cellPadding}>
                                                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[11px]">
                                                                    {item.kategori?.nama_kategori || '-'}
                                                                </span>
                                                            </td>
                                                            <td className={`${cellPadding} text-center`}>
                                                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${status.color}`}>
                                                                    {status.label} ({item.stok})
                                                                </span>
                                                            </td>
                                                            <td className={cellPadding}>
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <button onClick={() => navigate(`/Produk/edit/${item.id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded">
                                                                        <Edit className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={() => handleDelete(item.id, item.nama_produk)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className={`${cellPadding} text-center`}>
                                                                {item.qr_code ? (
                                                                    <button 
                                                                        onClick={() => handleOpenQrModal(item)} 
                                                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg transition-colors" 
                                                                        title="Lihat QR Code"
                                                                    >
                                                                        <QrCode className="w-3.5 h-3.5" />
                                                                        <span>Lihat QR</span>
                                                                    </button>
                                                                ) : (
                                                                    <button 
                                                                        onClick={() => handleOpenQrModal(item)} 
                                                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-colors"
                                                                    >
                                                                        <QrCode className="w-3.5 h-3.5" />
                                                                        <span>Generate</span>
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Tampilan Mobile (Card Stack) */}
                                    <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                                        {paginatedData.map((item) => {
                                            const status = getStatusStok(item.stok, item.stok_minimal || 5);
                                            return (
                                                <div key={item.id} className={mobilePadding}>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold text-xs text-gray-900 dark:text-white">{item.nama_produk}</p>
                                                            <p className="text-[11px] text-gray-400">SKU: {item.sku}</p>
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${status.color}`}>
                                                            {status.label}: {item.stok}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-1 border-t border-gray-100 dark:border-gray-700/50">
                                                        <span className="text-[11px] text-gray-500">{item.kategori?.nama_kategori || 'Tanpa Kategori'}</span>
                                                        <div className="flex items-center gap-2">
                                                            <button 
                                                                onClick={() => handleOpenQrModal(item)} 
                                                                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] bg-red-50 text-red-600 font-semibold rounded border border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400"
                                                            >
                                                                <QrCode className="w-3 h-3" />
                                                                <span>{item.qr_code ? 'QR' : 'Generate'}</span>
                                                            </button>
                                                            <button onClick={() => navigate(`/Produk/edit/${item.id}`)} className="p-1 text-blue-600">
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDelete(item.id, item.nama_produk)} className="p-1 text-red-600">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
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

            {/* Modal Popup Preview QR Code */}
            {qrModalProduk && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                        {/* Top Close Button */}
                        <button
                            onClick={handleCloseQrModal}
                            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Header */}
                        <div className="text-center space-y-1 mb-5">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-1">
                                <QrCode className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">QR Code Produk</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{qrModalProduk.nama_produk}</p>
                        </div>

                        {/* QR Image Frame */}
                        <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700 mb-5">
                            {qrLoading || !qrModalImage ? (
                                <div className="w-48 h-48 flex items-center justify-center text-xs text-gray-400">
                                    <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
                                    Memuat QR...
                                </div>
                            ) : (
                                <img
                                    src={qrModalImage}
                                    alt={`QR Code ${qrModalProduk.nama_produk}`}
                                    className="w-48 h-48 object-contain rounded-lg shadow-sm"
                                />
                            )}
                            
                            <div className="mt-3 text-center">
                                <span className="inline-block px-2.5 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-[11px] font-mono font-medium text-gray-600 dark:text-gray-300">
                                    SKU: {qrModalProduk.sku || '-'}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={handlePrintQrLabel}
                                className="flex-1 py-2.5 px-3 bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 active:scale-[0.98] text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                title="Cetak Label QR (Ukuran disesuaikan di menu Pengaturan)"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Cetak Label</span>
                            </button>
                            <button
                                onClick={() => handleDownloadProdukQr(qrModalProduk.id)}
                                className="flex-1 py-2.5 px-3 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <Download className="w-4 h-4" />
                                <span>Unduh PNG</span>
                            </button>
                            <button
                                onClick={handleCloseQrModal}
                                className="py-2.5 px-3.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Import Produk Massal */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-100 dark:border-gray-800 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                                <span>Import Massal Produk (CSV / Excel)</span>
                            </div>
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleImportSubmit} className="p-6 space-y-4 text-xs">
                            <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl space-y-2">
                                <p className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                                    <FileSpreadsheet className="w-4 h-4" />
                                    Format File Diperlukan
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Pastikan file berformat <strong>.CSV</strong> dengan kolom berikut: <br />
                                    <code className="text-[11px] font-mono bg-white dark:bg-gray-800 px-1 py-0.5 rounded border mt-1 inline-block">
                                        nama_produk, kategori, pemasok, stok, stok_minimal, deskripsi
                                    </code>
                                </p>
                                <button
                                    type="button"
                                    onClick={handleDownloadTemplate}
                                    className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                                >
                                    <Download className="w-3.5 h-3.5" /> Unduh Template CSV Contoh
                                </button>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block font-semibold text-gray-700 dark:text-gray-300">
                                    Pilih File CSV / Excel (.csv) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="file"
                                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                    required
                                    onChange={(e) => setImportFile(e.target.files[0])}
                                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-950 dark:file:text-emerald-300 file:cursor-pointer border border-gray-200 dark:border-gray-700 rounded-xl p-2 bg-gray-50 dark:bg-gray-800"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setShowImportModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={importing}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>{importing ? 'Mengimpor...' : 'Mulai Import'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}