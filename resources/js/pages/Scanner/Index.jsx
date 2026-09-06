import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Package, X, Camera, RefreshCw, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import { Html5Qrcode } from 'html5-qrcode';
import ScanBatchModal from '../../components/ScanBatchModal';
import ErrorBoundary from './ErrorBoundary';

export default function ScannerHome() {
    const [scanMode, setScanMode] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const html5QrCodeRef = useRef(null);

    // Fungsi selectMode
    const selectMode = (mode) => {
        setScanMode(mode);
        setResult(null);
    };

    useEffect(() => {
        if (scanMode) {
            const timer = setTimeout(() => {
                startScanner();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [scanMode]);

    // Start scanner
    const startScanner = async () => {
        if (!scanMode) return;

        // Jangan izinkan start berkali-kali
        if (html5QrCodeRef.current?.isScanning) {
            console.log('Scanner masih berjalan.');
            return;
        }

        const element = document.getElementById('scanner-container');

        if (!element) {
            console.error('Element #scanner-container tidak ditemukan!');
            return;
        }

        try {
            setError(null);

            // Bersihkan instance lama jika ada
            if (html5QrCodeRef.current) {
                try {
                    if (html5QrCodeRef.current.isScanning) {
                        await html5QrCodeRef.current.stop();
                    }

                    await html5QrCodeRef.current.clear();
                } catch (err) {
                    console.warn('Cleanup scanner lama:', err);
                }

                html5QrCodeRef.current = null;
            }

            const scanner = new Html5Qrcode('scanner-container');
            html5QrCodeRef.current = scanner;

            const config = {
                fps: 10,
                qrbox: {
                    width: 250,
                    height: 250
                },
                aspectRatio: 1.0
            };

            await scanner.start(
                { facingMode: 'environment' },
                config,
                onScanSuccess,
                onScanError
            );

            setScanning(true);

            console.log('✅ Scanner berhasil dimulai');

        } catch (error) {
            console.error('❌ Error starting scanner:', error);

            setScanning(false);

            // Buang instance yang gagal
            html5QrCodeRef.current = null;

            if (error?.name === 'NotAllowedError') {
                setError(
                    'Akses kamera ditolak. Silakan izinkan kamera pada browser lalu coba lagi.'
                );
            } else {
                setError(
                    'Kamera tidak dapat dijalankan. Pastikan kamera tidak sedang digunakan aplikasi lain.'
                );
            }
        }
    };

    // Stop scanner
    const stopScanner = async () => {
        const scanner = html5QrCodeRef.current;
        if (!scanner) {
            setScanning(false);
            return;
        }
        try {
            if (scanner.isScanning) {
                await scanner.stop();
            }
            try {
                await scanner.clear();
            } catch (clearError) {
                console.warn('Scanner clear warning:', clearError);
            }
        } catch (error) {
            console.warn('Scanner stop warning:', error);
        } finally {
            html5QrCodeRef.current = null;
            setScanning(false);
        }
    };

    // Handle scan success
    const onScanSuccess = async (decodedText) => {
        await stopScanner();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/batch/scan/${decodeURIComponent(decodedText)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setResult(data);
                if (data.mode === 'batch') {
                    setModalOpen(true);
                } else {
                    setModalOpen(true);
                }
            } else {
                await Swal.fire(
                    'Error',
                    data.message || 'QR Code tidak ditemukan',
                    'error'
                );
            
                if (scanMode) {
                    await startScanner();
                }
            }
        } catch (error) {
            console.error('Error scanning QR:', error);

            await Swal.fire(
                'Error',
                'Gagal memproses QR Code',
                'error'
            );

            if (scanMode) {
                await startScanner();
            }
        } finally {
            setLoading(false);
        }
    };

    const onScanError = (error) => {
        // Ignore scan errors
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current) {
                html5QrCodeRef.current.stop().catch(() => {});
            }
        };
    }, []);

    // Reset scanner
    const handleReset = () => {

        // Bersihkan scanner
        if (html5QrCodeRef.current) {
            html5QrCodeRef.current.stop().catch(() => {});
            html5QrCodeRef.current = null;
        }

        // Reset semua state
        setResult(null);
        setScanMode(null);
        setScanning(false);
        setModalOpen(false);
        setLoading(false);
    };

    // Render pilihan mode
    if (!scanMode) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Scan QR Code
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Pilih mode scan yang ingin digunakan
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={() => selectMode('batch')}
                        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-md text-center"
                    >
                        <Package className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Scan Batch</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Scan QR Code per kardus/batch
                        </p>
                    </button>

                    <button
                        onClick={() => selectMode('produk')}
                        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-md text-center"
                    >
                        <QrCode className="w-16 h-16 mx-auto text-purple-600 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Scan Produk</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Scan QR Code per produk
                        </p>
                    </button>
                </div>
            </div>
        );
    }

    // Render scanner
    return (
        <ErrorBoundary>
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleReset}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {scanMode === 'batch' ? 'Scan Batch' : 'Scan Produk'}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Arahkan kamera ke QR Code
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${scanning ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {scanning ? 'Kamera Aktif' : 'Kamera Mati'}
                    </span>
                    <button
                        onClick={startScanner}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Restart Kamera"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Scanner Container */}
            <div 
                id="scanner-container" 
                className="w-full max-w-md mx-auto aspect-square bg-black rounded-lg overflow-hidden relative"
            >
                {!scanning ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-900">
                        <Camera className="w-12 h-12 mb-2" />
                        <p className="text-sm text-gray-400">Kamera tidak aktif</p>
                        <button
                            onClick={startScanner}
                            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                        >
                            Aktifkan Kamera
                        </button>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-48 h-48 border-2 border-blue-500 rounded-lg animate-pulse"></div>
                    </div>
                )}
            </div>

            {/* Loading */}
            {loading && (
                <div className="text-center py-4">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Memproses QR Code...</p>
                </div>
            )}

            {/* Result Display */}
            {result && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Hasil Scan
                    </h3>
                    <pre className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}

            {/* Modal Scan Batch */}
            {result && result.mode === 'batch' && (
                <ScanBatchModal
                    isOpen={modalOpen}
                    onClose={async () => {
                        await stopScanner();

                        setModalOpen(false);
                        setResult(null);
                        setScanMode(null);
                    }}
                    onSuccess={async () => {
                        await stopScanner();
                        setModalOpen(false);
                        setResult(null);
                        setScanMode(null);
                    }}
                    data={result.data}
                />
            )}

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                    <p className="text-red-700 dark:text-red-400">{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            setScanMode(null);
                        }}
                        className="mt-2 px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                    >
                        Kembali
                    </button>
                </div>
            )}
        </div>
        </ErrorBoundary>
    );
}