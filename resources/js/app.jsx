import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '../css/app.css';

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
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import MainLayout from './layouts/MainLayout';

// Jika membutuhkan PrivateRoute, maka uncomment code dibawah
import PrivateRoute from './components/PrivateRoute';

// Proteksi Route (Private)
// function privateRoute({ children }) {
//     const token = localStorage.getItem('token');
//     return token ? children : <Navigate to="/login" />;
// }

function App() {
    useEffect(() => {
        AOS.init({ duration: 2000, once: true });
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                {/* Auth Routes (Tanpa Layout) */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes (Dengan Layout) */}
                <Route path="/" element={
                    <PrivateRoute>
                        <MainLayout>
                            <Dashboard />
                        </MainLayout>
                    </PrivateRoute>
                } />
                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <MainLayout>
                            <Dashboard />
                        </MainLayout>
                    </PrivateRoute>
                } />
            </Routes>
        </BrowserRouter>
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