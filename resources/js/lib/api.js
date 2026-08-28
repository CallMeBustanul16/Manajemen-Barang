import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor untuk menambahkan token ke setiap request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor untuk menangani error 401 (unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Fungsi untuk Kategori
export const kategoriAPI = {
    getAll: () => api.get('/kategori'),
    getById: (id) => api.get(`/kategori/${id}`),
    create: (data) => api.post('/kategori', data),
    update: (id, data) => api.put(`/kategori/${id}`, data),
    delete: (id) => api.delete(`/kategori/${id}`),
};

// Fungsi untuk Pemasok
export const pemasokAPI = {
    getAll: () => api.get('/pemasok'),
    getById: (id) => api.get(`/pemasok/${id}`),
    create: (data) => api.post('/pemasok', data),
    update: (id, data) => api.put(`/pemasok/${id}`, data),
    delete: (id) => api.delete(`/pemasok/${id}`),
};

// Fungsi untuk Produk
export const produkAPI = {
    getAll: () => api.get('/produk'),
    getById: (id) => api.get(`/produk/${id}`),
    create: (data) => api.post('/produk', data),
    update: (id, data) => api.put(`/produk/${id}`, data),
    delete: (id) => api.delete(`/produk/${id}`),
};

// Interceptor untuk menangani error
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Redirect ke login jika perlu
        }
        return Promise.reject(error);
    }
);

export default api;