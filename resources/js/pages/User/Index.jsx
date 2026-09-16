import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User as UserIcon, Shield } from 'lucide-react';
import Swal from 'sweetalert2';

export default function UserIndex() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const result = await response.json();
            if (response.ok) setUsers(result.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'Yakin ingin menghapus?',
            text: `User "${name}" akan dihapus.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then(async (result) => {
            if (result.isConfirmed) {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/users/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (response.ok) {
                    Swal.fire('Terhapus!', 'User berhasil dihapus.', 'success');
                    fetchUsers();
                } else {
                    const data = await response.json();
                    Swal.fire('Error', data.message, 'error');
                }
            }
        });
    };

    if (loading) {
        return <div className="text-center py-12">Memuat data...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Manajemen User
                </h1>
                <button
                    onClick={() => window.location.href = '/user/create'}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                    <Plus className="w-5 h-5" />
                    Tambah User
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3">Nama</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    {user.name}
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                        user.role === 'manager' ? 'bg-purple-100 text-purple-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => window.location.href = `/user/edit/${user.id}`}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id, user.name)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}