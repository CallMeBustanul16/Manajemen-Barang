import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '../css/app.css';

// Context
import { DarkModeProvider, gunakanDarkMode } from './context/DarkModeContext';

// Kumpulan Semuan Library dan Halaman
// import './bootstrap';
import '../css/app.css';
import AOS from 'aos';
import 'aos/dist/aos.css'; 
import Swal from 'sweetalert2';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import * as anime from 'animejs';

// Import Halaman
import Login from './pages/Auth/login';
import Register from './pages/Auth/register';
import Dashboard from './pages/dashboard';
import MainLayout from './layouts/MainLayout';
import ForgotPassword from './pages/Auth/forgotPassword';
import ResetPassword from './pages/Auth/resetPassword';

// Import Halaman Kategori
import KategoriHome from './pages/Kategori/Index';
import BuatKategori from './pages/Kategori/Create';
import EditKategori from './pages/Kategori/Edit';

// Import Halaman Pemasok
import PemasokHome from './pages/Pemasok/Index';
import BuatPemasok from './pages/Pemasok/Create';
import EditPemasok from './pages/Pemasok/Edit';

// Import Halaman Produk
import ProdukHome from './pages/Produk/Index';
import BuatProduk from './pages/Produk/Create';
import EditProduk from './pages/Produk/Edit';   

// Import Masuk dan Keluarnya Barang
import StokHome from './pages/Stok/Index';
import StokBarangMasuk from './pages/Stok/Masuk';
import StokBarangKeluar from './pages/Stok/Keluar';

// Import Batch
import BatchHome from './pages/Batch/Index';
import BuatBatch from './pages/Batch/Create';
import EditBatch from './pages/Batch/Edit';

// Import Scanner
import ScannerHome from './pages/Scanner/Index';

// Import Batch
import BatchRiwayat from './pages/Batch/History';
import BatchDetail from './pages/Batch/Detail';

// Jika membutuhkan PrivateRoute, maka uncomment code dibawah
import PrivateRoute from './components/PrivateRoute';

// Proteksi Route (Private)
// function privateRoute({ children }) {
//     const token = localStorage.getItem('token');
//     return token ? children : <Navigate to="/login" />;
// }

function AppContent() {
    const { darkMode, toggleDarkMode } = gunakanDarkMode();

    useEffect(() => {
        AOS.init({ duration: 2000, once: true });
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                {/* Auth Routes (Tanpa Layout) */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected Routes (Dengan Layout) */}
                <Route path="/" element={
                    <PrivateRoute>
                        <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                            <Dashboard />
                        </MainLayout>
                    </PrivateRoute>
                } />
                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                            <Dashboard />
                        </MainLayout>
                    </PrivateRoute>
                } />

                {/* Kategori */}
                <Route path="/kategori" element={
                    <PrivateRoute>
                        <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                            <KategoriHome />
                        </MainLayout>
                    </PrivateRoute>
                } />
                <Route path="/kategori/Create" element={
                    <PrivateRoute>
                        <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                            <BuatKategori />
                        </MainLayout>
                    </PrivateRoute>
                } />
                <Route path="/kategori/Edit/:id" element={
                    <PrivateRoute>
                        <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                            <EditKategori />
                        </MainLayout>
                    </PrivateRoute>
                } />

                {/* Pemasok */}
                <Route path="/pemasok" element={
                    <PrivateRoute>
                        <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                            <PemasokHome />
                        </MainLayout>
                    </PrivateRoute>
                } />
                <Route path="/pemasok/Create" element={
                    <PrivateRoute>
                        <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                            <BuatPemasok />
                        </MainLayout>
                    </PrivateRoute>
                } />
                <Route path="/pemasok/Edit/:id" element={
                    <PrivateRoute>
                        <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                            <EditPemasok />
                        </MainLayout>
                    </PrivateRoute>
                } />

                {/* Produk */}
                <Route path="/produk" element={
                    <PrivateRoute>
                        <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                            <ProdukHome />
                        </MainLayout>
                    </PrivateRoute>
                } />
                <Route path="/produk/Create" element={
                    <PrivateRoute>
                        <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                            <BuatProduk />
                        </MainLayout>
                    </PrivateRoute>
                } />
                <Route path="/produk/Edit/:id" element={
                    <PrivateRoute>
                        <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                            <EditProduk />
                        </MainLayout>
                    </PrivateRoute>
                } />

                {/* Stok */}
                <Route path="/stok" element={
                    <PrivateRoute>
                        <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                            <StokHome />
                        </MainLayout>
                    </PrivateRoute>
                } />
                <Route path="/stok/Masuk" element={
                    <PrivateRoute>
                        <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                            <StokBarangMasuk />
                        </MainLayout>
                    </PrivateRoute>
                } />
                <Route path="/stok/Keluar" element={
                    <PrivateRoute>
                        <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                            <StokBarangKeluar />
                        </MainLayout>
                    </PrivateRoute>
                } />

                {/* Batch */}
                <Route path="/batch" element={
                    <PrivateRoute>
                        <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                            <BatchHome />
                        </MainLayout>
                    </PrivateRoute>
                } />
                <Route path="/batch/Create" element={
                    <PrivateRoute>
                        <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                            <BuatBatch />
                        </MainLayout>
                    </PrivateRoute>
                } />
                <Route path="/batch/Edit/:id" element={
                    <PrivateRoute>
                        <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                            <EditBatch />
                        </MainLayout>
                    </PrivateRoute>
                } />
                <Route path="/batch/History/:id" element={
                    <PrivateRoute>
                        <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                            <BatchRiwayat />
                        </MainLayout>
                    </PrivateRoute>
                } />
                <Route path="/batch/Detail/:id" element={
                    <PrivateRoute>
                        <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                            <BatchDetail />
                        </MainLayout>
                    </PrivateRoute>
                } />

                {/* Scan */}
                <Route path="/scan" element={
                    <PrivateRoute>
                        <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                            <ScannerHome />
                        </MainLayout>
                    </PrivateRoute>
                } />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

function App() {
    return (
        <DarkModeProvider>
            <AppContent />
        </DarkModeProvider>
    );
}

// const root = window._reactRoot || ReactDOM.createRoot(container);
// if (!window._reactRoot) window._reactRoot = root;

// root.render(<App />);

const root = document.getElementById('root');
if (!window.reactRoot) {
  window.reactRoot = ReactDOM.createRoot(document.getElementById('root'));
}

window.reactRoot.render(<App />);