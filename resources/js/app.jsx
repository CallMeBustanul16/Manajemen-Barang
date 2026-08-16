// Kumpulan Library
// import './bootstrap';
import '../css/app.css';
import AOS from 'aos';
import 'aos/dist/aos.css'; 
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import ReactDOM from 'react-dom/client';
import '../css/app.css';
import Swal from 'sweetalert2';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import * as anime from 'animejs';

AOS.init();

const container = document.getElementById('app');

function App() {
    useEffect(() => {
        // Inisialisasi AOS
        AOS.init({
            duration: 1000,
            once: true,
        });
    }, []);

    useGSAP(() => {
        // Contoh animasi GSAP
        gsap.from('.title', { opacity: 0, y: -50, duration: 1 });
    });

    const handleClick = () => {
        // SweetAlert2
        Swal.fire({
            title: 'Selamat!',
            text: 'Library berfungsi dengan baik',
            icon: 'success',
            confirmButtonText: 'OK'
        });

        // AnimeJS
        anime({
            targets: '.box',
            translateX: 250,
            duration: 1000,
            easing: 'easeOutQuad'
        });
    };

    return (
        <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center">
            <h1 className="title text-3xl font-bold text-blue-600" data-aos="fade-up">
                Manajemen Inventory
            </h1>
            <p className="mt-4 text-gray-600" data-aos="fade-up" data-aos-delay="200">
                React + Laravel + Animasi
            </p>
            <div className="box w-20 h-20 bg-red-500 mt-8 rounded"></div>
            <button 
                onClick={handleClick}
                className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
                Coba Animasi & Alert
            </button>
        </div>
    );
}

const root = window._reactRoot || ReactDOM.createRoot(container);
if (!window._reactRoot) window._reactRoot = root;

root.render(<App />);