import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { BarChart3, ChevronDown, RefreshCw } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// Plugin kustom untuk menampilkan angka stok di atas setiap bar grafik
const barTopLabelsPlugin = {
    id: 'barTopLabelsPlugin',
    afterDatasetsDraw(chart) {
        const { ctx } = chart;
        chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            meta.data.forEach((bar, index) => {
                const value = dataset.data[index];
                if (value !== undefined && value !== null) {
                    ctx.save();
                    ctx.fillStyle = '#475569';
                    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText(String(value), bar.x, bar.y - 4);
                    ctx.restore();
                }
            });
        });
    }
};

export default function StokKategoriChart({ chartData, darkMode }) {
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [dataState, setDataState] = useState(chartData || null);
    const [loadingFilter, setLoadingFilter] = useState(false);

    useEffect(() => {
        if (chartData) {
            setDataState(chartData);
        }
    }, [chartData]);

    const handleFilterChange = async (e) => {
        const katId = e.target.value;
        setSelectedFilter(katId);
        setLoadingFilter(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/dashboard/stok-chart?kategori_id=${katId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });
            if (res.ok) {
                const json = await res.json();
                if (json.data) {
                    setDataState(json.data);
                }
            }
        } catch (err) {
            console.error('Error filtering category chart:', err);
        } finally {
            setLoadingFilter(false);
        }
    };

    const categories = dataState?.categories || [];
    const labels = (dataState?.labels || []).map(l => (typeof l === 'string' && l.length > 18) ? l.split(' & ') : l);
    const values = dataState?.values || [];
    const colors = dataState?.colors || ['#ef4444', '#f59e0b', '#b91c1c', '#f87171', '#fca5a5'];
    const isProductBreakdown = dataState?.is_product_breakdown || false;

    const maxVal = values.length > 0 ? Math.max(...values) : 100;
    const computedYMax = Math.ceil((maxVal * 1.25) / 50) * 50 || 100;

    const data = {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor: colors,
                borderRadius: {
                    topLeft: 6,
                    topRight: 6,
                    bottomLeft: 0,
                    bottomRight: 0,
                },
                borderSkipped: false,
                barPercentage: values.length === 1 ? 0.3 : 0.6,
                categoryPercentage: 0.8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 25,
                bottom: 0,
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#0f172a',
                padding: 10,
                cornerRadius: 8,
                titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: '600' },
                bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
                callbacks: {
                    label: (context) => ` Total Stok: ${context.parsed.y} unit`,
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: darkMode ? '#94a3b8' : '#64748b',
                    font: {
                        family: 'Plus Jakarta Sans',
                        size: 11,
                        weight: '500',
                    },
                    maxRotation: 0,
                    autoSkip: false,
                },
                border: {
                    display: false,
                },
            },
            y: {
                beginAtZero: true,
                max: Math.max(computedYMax, 50),
                ticks: {
                    stepSize: computedYMax > 200 ? 50 : 25,
                    color: darkMode ? '#64748b' : '#94a3b8',
                    font: {
                        family: 'Plus Jakarta Sans',
                        size: 11,
                    },
                },
                grid: {
                    color: darkMode ? '#1e293b' : '#f1f5f9',
                    borderDash: [3, 3],
                },
                border: {
                    display: false,
                },
            },
        },
    };

    return (
        <div className={`p-6 rounded-2xl border transition-all duration-200 ${
            darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-100 shadow-xs'
        }`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                            {isProductBreakdown ? 'Stok Produk per Kategori' : 'Stok per Kategori'}
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-normal leading-tight mt-0.5">
                            {isProductBreakdown 
                                ? 'Rincian jumlah stok per produk dalam kategori terpilih' 
                                : 'Jumlah stok berdasarkan kategori produk'}
                        </p>
                    </div>
                </div>

                {/* Dropdown Filter Kategori dari Database */}
                <div className="relative self-start sm:self-auto flex items-center gap-2">
                    {loadingFilter && <RefreshCw className="w-3.5 h-3.5 text-red-600 animate-spin" />}
                    <div className="relative">
                        <select
                            value={selectedFilter}
                            onChange={handleFilterChange}
                            className={`text-xs font-medium py-1.5 pl-3 pr-8 rounded-xl border appearance-none outline-none cursor-pointer transition-all ${
                                darkMode 
                                    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' 
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-xs'
                            }`}
                        >
                            <option value="all">Semua Kategori</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.nama_kategori}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Chart Canvas */}
            <div className="h-64 sm:h-72 w-full">
                {values.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400">
                        Belum ada produk terdaftar dalam kategori ini.
                    </div>
                ) : (
                    <Bar data={data} options={options} plugins={[barTopLabelsPlugin]} />
                )}
            </div>
        </div>
    );
}
