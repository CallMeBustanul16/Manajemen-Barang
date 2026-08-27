import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '../css/app.css';

// Context
import { DarkModeProvider, gunakanDarkMode } from './context/DarkModeContext';

// Kumpulan Library
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