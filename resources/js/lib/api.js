import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Fungsi untuk Kategori
export const kategoriAPI = {
    getAll: () => api.get('/kategori'),
    create: (data) => api.post('/kategori', data),
    update: (id, data) => api.put(`/kategori/${id}`, data),
    delete: (id) => api.delete(`/kategori/${id}`),
};

// Fungsi untuk Produk
export const produkAPI = {
    getAll: () => api.get('/produk'),
    create: (data) => api.post('/produk', data),
    update: (id, data) => api.put(`/produk/${id}`, data),
    delete: (id) => api.delete(`/produk/${id}`),
};

// Fungsi untuk Pemasok
export const pemasokAPI = {
    getAll: () => api.get('/pemasok'),
    create: (data) => api.post('/pemasok', data),
    update: (id, data) => api.put(`/pemasok/${id}`, data),
    delete: (id) => api.delete(`/pemasok/${id}`),
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