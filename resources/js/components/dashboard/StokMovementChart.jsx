import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { ArrowLeftRight, ArrowUpRight, ArrowDownRight, ChevronDown, RefreshCw } from 'lucide-react';
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

export default function StokMovementChart({ movementData, darkMode }) {
    const [period, setPeriod] = useState('7d');
    const [dataState, setDataState] = useState(movementData || null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (movementData) {
            setDataState(movementData);
        }
    }, [movementData]);

    const handlePeriodChange = async (e) => {
        const val = e.target.value;
        setPeriod(val);
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const daysCount = val === '30d' ? 30 : 7;
            const res = await fetch(`/api/dashboard/movement-chart?days=${daysCount}`, {
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
            console.error('Error fetching movement data:', err);
        } finally {
            setLoading(false);
        }
    };

    const days = dataState?.days || [];
    const masukData = dataState?.masuk || [];
    const keluarData = dataState?.keluar || [];
    const todayIn = dataState?.today_in ?? 0;
    const todayOut = dataState?.today_out ?? 0;

    const maxVal = Math.max(
        masukData.length > 0 ? Math.max(...masukData) : 0,
        keluarData.length > 0 ? Math.max(...keluarData) : 0,
        10
    );
    const computedYMax = Math.ceil((maxVal * 1.3) / 10) * 10;

    const data = {
        labels: days,
        datasets: [
            {
                label: 'Masuk',
                data: masukData,
                backgroundColor: '#0d9488', // Teal / Emerald
                borderRadius: {
                    topLeft: 4,
                    topRight: 4,
                    bottomLeft: 0,
                    bottomRight: 0,
                },
                borderSkipped: false,
                barPercentage: period === '30d' ? 0.9 : 0.65,
                categoryPercentage: 0.65,
            },
            {
                label: 'Keluar',
                data: keluarData,
                backgroundColor: '#ef4444', // Red
                borderRadius: {
                    topLeft: 4,
                    topRight: 4,
                    bottomLeft: 0,
                    bottomRight: 0,
                },
                borderSkipped: false,
                barPercentage: period === '30d' ? 0.9 : 0.65,
                categoryPercentage: 0.65,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
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
                    label: (context) => ` ${context.dataset.label}: ${context.parsed.y} barang`,
                }
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
                        size: period === '30d' ? 9 : 10,
                    },
                    maxRotation: period === '30d' ? 45 : 0,
                },
                border: {
                    display: false,
                },
            },
            y: {
                beginAtZero: true,
                max: Math.max(computedYMax, 20),
                ticks: {
                    stepSize: computedYMax > 50 ? 20 : 10,
                    color: darkMode ? '#64748b' : '#94a3b8',
                    font: {
                        family: 'Plus Jakarta Sans',
                        size: 10,
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
        <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-200 ${
            darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-100 shadow-xs'
        }`}>
            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                            <ArrowLeftRight className="w-4 h-4" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                            Stok Masuk & Keluar
                        </h3>
                    </div>

                    <div className="relative flex items-center gap-2">
                        {loading && <RefreshCw className="w-3.5 h-3.5 text-red-600 animate-spin" />}
                        <div className="relative">
                            <select
                                value={period}
                                onChange={handlePeriodChange}
                                className={`text-xs font-medium py-1 pl-2.5 pr-7 rounded-lg border appearance-none outline-none cursor-pointer ${
                                    darkMode 
                                        ? 'bg-gray-800 border-gray-700 text-gray-300' 
                                        : 'bg-white border-gray-200 text-gray-600 shadow-xs'
                                }`}
                            >
                                <option value="7d">7 Hari Terakhir</option>
                                <option value="30d">30 Hari Terakhir</option>
                            </select>
                            <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* 2 Highlight Stat Cards dari Database Riil */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Stok Masuk Hari Ini */}
                    <div className={`p-3 rounded-xl flex items-center gap-3 border ${
                        darkMode 
                            ? 'bg-emerald-950/20 border-emerald-900/30' 
                            : 'bg-[#f0fdf4] border-emerald-100'
                    }`}>
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate leading-tight">
                                Stok Masuk Hari Ini
                            </p>
                            <p className="text-sm font-bold text-gray-900 dark:text-emerald-300 leading-tight mt-0.5">
                                +{todayIn} barang
                            </p>
                        </div>
                    </div>

                    {/* Stok Keluar Hari Ini */}
                    <div className={`p-3 rounded-xl flex items-center gap-3 border ${
                        darkMode 
                            ? 'bg-rose-950/20 border-rose-900/30' 
                            : 'bg-[#fff1f2] border-rose-100'
                    }`}>
                        <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                            <ArrowDownRight className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate leading-tight">
                                Stok Keluar Hari Ini
                            </p>
                            <p className="text-sm font-bold text-rose-600 dark:text-rose-300 leading-tight mt-0.5">
                                -{todayOut} barang
                            </p>
                        </div>
                    </div>
                </div>

                {/* Legend indicator */}
                <div className="flex items-center gap-4 text-[11px] font-medium text-gray-500 mb-2">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0d9488]"></span>
                        Masuk
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
                        Keluar
                    </span>
                </div>
            </div>

            {/* Grouped Bar Chart */}
            <div className="h-44 w-full mt-2">
                {days.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400">
                        Belum ada pergerakan stok.
                    </div>
                ) : (
                    <Bar data={data} options={options} />
                )}
            </div>
        </div>
    );
}
