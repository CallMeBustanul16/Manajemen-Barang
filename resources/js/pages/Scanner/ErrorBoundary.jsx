import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Scanner Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="max-w-2xl mx-auto p-8 text-center">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-red-700 dark:text-red-400">Terjadi Kesalahan</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {this.state.error?.message || 'Gagal mengakses kamera. Silakan refresh halaman.'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                            Refresh Halaman
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}