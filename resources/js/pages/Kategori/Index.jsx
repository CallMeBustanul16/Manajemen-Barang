// resources/js/pages/Kategori/Index.jsx
import { kategoriAPI } from '../../lib/api';
import { useEffect, useState } from 'react';

function KategoriIndex() {
    const [kategori, setKategori] = useState([]);

    useEffect(() => {
        // GET data
        kategoriAPI.getAll()
            .then(res => setKategori(res.data.data))
            .catch(err => console.error(err));
    }, []);

    const handleAdd = () => {
        // POST data
        kategoriAPI.create({
            nama_kategori: 'Alat Tulis',
            deskripsi: 'Kategori untuk alat tulis kantor',
            slug: 'alat-tulis'
        })
        .then(() => {
            // Refresh data setelah tambah
            kategoriAPI.getAll()
                .then(res => setKategori(res.data.data));
        })
        .catch(err => console.error(err));
    };

    return (
        <div>
            <button onClick={handleAdd}>Tambah Kategori</button>
            {/* Render data kategori */}
        </div>
    );
}