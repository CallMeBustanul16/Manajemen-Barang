import React, { useState, useEffect } from 'react';
import { AlertTriangle, Package, X } from 'lucide-react';

export default function StokAlert() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dismissed, setDismissed] = useState([]);

    useEffect(() => {
        fetchData();
        // Auto refresh setiap 60 detik
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/dashboard/low-stock', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            const result = await response.json();
            if (response.ok) {
                setProducts(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching low stock:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = (id) => {
        setDismissed([...dismissed, id]);
    };

    const visibleProducts = products.filter(p => !dismissed.includes(p.id));

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (visibleProducts.length === 0) {
        return (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <p className="text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
                    ✅ Semua stok produk aman.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Stok Menipis!</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({visibleProducts.length} produk)
                </span>
            </div>

            {visibleProducts.map((product) => (
                <div
                    key={product.id}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-red-500" />
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {product.nama_produk}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Stok: {product.stok} / Minimal: {product.stok_minimal}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleDismiss(product.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}