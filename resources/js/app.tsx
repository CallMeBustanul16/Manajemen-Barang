// import React, { useEffect } from 'react';
// import { createRoot } from 'react-dom/client';

// import '../css/app.css';

// // Impor library eksternal
// import AOS from 'aos';
// import 'aos/dist/aos.css';
// import * as anime from 'animejs';
// import gsap from 'gsap';
// import { useGSAP } from '@gsap/react';
// import Swal from 'sweetalert2';

// // Daftarkan plugin GSAP
// gsap.registerPlugin(useGSAP);

// function App() {
//     useEffect(() => {
//         AOS.init({ duration: 1000, once: true });
//     }, []);

//     useGSAP(() => {
//         gsap.from('.title', { opacity: 0, y: -50, duration: 1.2, ease: 'power3.out' });
//         gsap.from('.subtitle', { opacity: 0, y: 30, duration: 1, delay: 0.3, ease: 'power3.out' });
//     });

//     const handleDemo = () => {
//         Swal.fire({
//             title: 'Selamat!',
//             text: 'Semua library berfungsi!',
//             icon: 'success',
//             confirmButtonText: 'Keren!',
//             timer: 3000,
//             timerProgressBar: true,
//         });

//         // AnimeJS: panggil dengan .default
//         anime.default({
//             targets: '.box',
//             translateX: 250,
//             rotate: 360,
//             duration: 1200,
//             easing: 'easeInOutQuad',
//             borderRadius: ['0%', '50%'],
//             backgroundColor: ['#3b82f6', '#ef4444'],
//         });
//     };

//     return (
//         <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
//             <div className="text-center">
//                 <h1 className="title text-5xl font-bold text-blue-600 mb-4" data-aos="fade-up">
//                     Manajemen Inventory
//                 </h1>
//                 <p className="subtitle text-xl text-gray-600 mb-8" data-aos="fade-up" data-aos-delay="200">
//                     Laravel + React + Tailwind v4 + Animasi Keren
//                 </p>
//                 <div className="box w-24 h-24 bg-blue-500 rounded-lg mx-auto mb-8"></div>
//                 <button
//                     onClick={handleDemo}
//                     className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl 
//                                hover:bg-blue-700 transition-all duration-300 shadow-lg 
//                                hover:shadow-xl transform hover:-translate-y-1"
//                     data-aos="fade-up"
//                     data-aos-delay="400"
//                 >
//                     Coba Animasi & Alert
//                 </button>
//                 <p className="mt-8 text-sm text-gray-400" data-aos="fade-up" data-aos-delay="600">
//                     Scroll untuk melihat AOS | GSAP | AnimeJS | SweetAlert2
//                 </p>
//             </div>
//         </div>
//     );
// }

// const root = document.getElementById('root');
// if (root) {
//     createRoot(root).render(<App />);
// }