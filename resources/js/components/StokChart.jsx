import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { PieChart, BarChart2 } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function StokChart() {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/dashboard/stok-chart', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            const result = await response.json();
            if (response.ok) {
                const data = result.data || result;
                setChartData({
                    labels: data.labels || [],
                    values: data.values || [],
                });
            }
        } catch (error) {
            console.error('Error fetching chart data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!chartData || chartData.labels.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                <p>Belum ada data stok per kategori</p>
            </div>
        );
    }

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Stok per Kategori',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
        },
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    📊 Stok per Kategori
                </h3>
                <div className="h-64">
                    <Bar
                        data={{
                            labels: chartData.labels,
                            datasets: [
                                {
                                    label: 'Total Stok',
                                    data: chartData.values,
                                    backgroundColor: [
                                        '#3b82f6',
                                        '#10b981',
                                        '#8b5cf6',
                                        '#f59e0b',
                                        '#ef4444',
                                        '#06b6d4',
                                    ],
                                    borderColor: '#ffffff',
                                    borderWidth: 2,
                                },
                            ],
                        }}
                        options={barOptions}
                    />
                </div>
            </div>

            {/* Doughnut Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-indigo-500" />
                    <span>Distribusi Stok</span>
                </h3>
                <div className="h-64">
                    <Doughnut
                        data={{
                            labels: chartData.labels,
                            datasets: [
                                {
                                    data: chartData.values,
                                    backgroundColor: [
                                        '#3b82f6',
                                        '#10b981',
                                        '#8b5cf6',
                                        '#f59e0b',
                                        '#ef4444',
                                        '#06b6d4',
                                    ],
                                    borderColor: '#ffffff',
                                    borderWidth: 2,
                                },
                            ],
                        }}
                        options={doughnutOptions}
                    />
                </div>
            </div>
        </div>
    );
}