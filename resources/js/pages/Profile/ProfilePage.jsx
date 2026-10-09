import React, { useState, useEffect, useRef } from 'react';
import { 
    User, Mail, Shield, Calendar, Clock, ShieldCheck, Camera, Trash2, 
    Info, Save, Lock, Sliders, CheckCircle2, Eye, EyeOff, Bell, Volume2, Zap
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { playNotificationChime } from '../../lib/sound';
import { formatDateByPreference } from '../../lib/formatters';
import Swal from 'sweetalert2';

export default function ProfilePage() {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState('info'); // 'info' | 'password' | 'preferences'
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profile state
    const [profile, setProfile] = useState({
        id: 1,
        name: 'Admin',
        email: 'admin@inventaris.com',
        role: 'Administrator',
        tanggal_bergabung: '10 Juni 2025',
        tanggal_bergabung_iso: '2025-06-10',
        login_terakhir: 'Selasa, 10 Juni 2025 10:24 WIB',
        total_login: 48,
        avatar_letter: 'A',
    });

    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);

    // Password state
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    // Preferences state (Points 2 - 6)
    const [preferences, setPreferences] = useState({
        email_notif_low_stock: true,
        email_notif_login: false,
        email_daily_digest: false,
        sound_alert: true,
        confirm_transaction: true,
        timezone: 'WIB',
        date_format: 'DD/MM/YYYY',
    });
    const [isPlayingSound, setIsPlayingSound] = useState(false);
    const [savedNotice, setSavedNotice] = useState(false);
    const saveNoticeTimeoutRef = useRef(null);

    useEffect(() => {
        fetchProfile();
        return () => {
            if (saveNoticeTimeoutRef.current) clearTimeout(saveNoticeTimeoutRef.current);
        };
    }, [language]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            // 1. Ambil data profil
            const res = await fetch('/api/profile', { headers });
            const result = await res.json();
            if (result.success && result.data) {
                setProfile(result.data);
                if (result.data.avatar) {
                    setAvatarPreview(result.data.avatar);
                } else {
                    const localUser = localStorage.getItem('user');
                    if (localUser) {
                        try {
                            const parsed = JSON.parse(localUser);
                            if (parsed.avatar) {
                                setAvatarPreview(parsed.avatar);
                            }
                        } catch (e) {}
                    }
                }
            }

            // 2. Ambil data preferensi dari server (Point 6)
            try {
                const prefRes = await fetch('/api/profile/preferences', { headers });
                const prefResult = await prefRes.json();
                if (prefResult.success && prefResult.data) {
                    setPreferences(prev => ({
                        ...prev,
                        ...prefResult.data,
                    }));
                    localStorage.setItem('userPreferences', JSON.stringify(prefResult.data));
                } else {
                    const localPrefs = localStorage.getItem('userPreferences');
                    if (localPrefs) {
                        setPreferences(prev => ({ ...prev, ...JSON.parse(localPrefs) }));
                    }
                }
            } catch (pErr) {
                const localPrefs = localStorage.getItem('userPreferences');
                if (localPrefs) {
                    setPreferences(prev => ({ ...prev, ...JSON.parse(localPrefs) }));
                }
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveInfo = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    name: profile.name,
                    email: profile.email,
                    avatar: avatarPreview,
                }),
            });
            const result = await res.json();
            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: t('profileSaved'),
                    text: t('profileSavedDesc'),
                    timer: 2000,
                    showConfirmButton: false,
                });
                const updatedUser = { 
                    ...profile, 
                    name: profile.name, 
                    email: profile.email, 
                    avatar: result.data?.avatar !== undefined ? result.data.avatar : avatarPreview 
                };
                setProfile(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: updatedUser }));
            } else {
                Swal.fire({
                    icon: 'error',
                    title: t('error'),
                    text: result.message || 'Error occurred while saving profile.',
                });
            }
        } catch (err) {
            console.error('Error saving profile:', err);
            Swal.fire({
                icon: 'error',
                title: t('error'),
                text: 'Connection failed.',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            Swal.fire({
                icon: 'warning',
                title: t('passwordMismatch'),
                text: t('passwordMismatchDesc'),
            });
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/profile/password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    current_password: passwordData.current_password,
                    new_password: passwordData.new_password,
                    new_password_confirmation: passwordData.new_password_confirmation,
                }),
            });
            const result = await res.json();
            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: t('passwordUpdated'),
                    text: t('passwordUpdatedDesc'),
                    timer: 2000,
                    showConfirmButton: false,
                });
                setPasswordData({
                    current_password: '',
                    new_password: '',
                    new_password_confirmation: '',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: t('error'),
                    text: result.message || 'Check your current password.',
                });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: t('error'),
                text: 'Failed to update password.',
            });
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                Swal.fire(t('warning'), t('profilePhotoDesc'), 'warning');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Data = reader.result;
                setAvatarPreview(base64Data);
                const updated = { ...profile, avatar: base64Data };
                setProfile(updated);
                localStorage.setItem('user', JSON.stringify(updated));
                window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: updated }));

                // Auto-sync avatar ke server backend seketika
                try {
                    const token = localStorage.getItem('token');
                    await fetch('/api/profile', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                        },
                        body: JSON.stringify({
                            name: profile.name,
                            email: profile.email,
                            avatar: base64Data,
                        }),
                    });
                } catch (err) {
                    console.error('Error auto-syncing avatar:', err);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = async () => {
        setAvatarPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        const updated = { ...profile, avatar: null };
        setProfile(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: updated }));

        // Auto-sync penghapusan avatar ke server backend
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    name: profile.name,
                    email: profile.email,
                    avatar: null,
                }),
            });
        } catch (err) {
            console.error('Error syncing avatar removal:', err);
        }
    };

    const handleTestSound = () => {
        setIsPlayingSound(true);
        playNotificationChime();
        setTimeout(() => setIsPlayingSound(false), 500);
    };

    const triggerAutoSaveFeedback = () => {
        setSavedNotice(true);
        if (saveNoticeTimeoutRef.current) clearTimeout(saveNoticeTimeoutRef.current);
        saveNoticeTimeoutRef.current = setTimeout(() => {
            setSavedNotice(false);
        }, 2200);
    };

    const handleUpdatePreference = (key, value) => {
        setPreferences(prev => {
            const next = { ...prev, [key]: value };

            // 1. Simpan seketika ke LocalStorage
            localStorage.setItem('userPreferences', JSON.stringify(next));

            // 2. Broadcast event realtime agar komponen lain langsung sinkron
            window.dispatchEvent(new CustomEvent('user-preferences-changed', { detail: next }));

            // 3. Tampilkan indikator visual tersimpan otomatis
            triggerAutoSaveFeedback();

            // 4. Asynchronous persist ke server backend
            const token = localStorage.getItem('token');
            fetch('/api/profile/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(next),
            }).catch(err => console.error('Error auto-syncing preferences:', err));

            return next;
        });
    };

    return (
        <div className="space-y-6 pb-12 max-w-7xl mx-auto">
            {/* Header & Breadcrumb */}
            <div>
                <nav className="flex items-center gap-2 text-xs text-gray-400 mb-1 font-medium">
                    <span className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors">{t('home')}</span>
                    <span>&gt;</span>
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">{t('myProfile')}</span>
                </nav>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {t('profileTitle')}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {t('profileSubtitle')}
                </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden transition-all">
                    {/* Top Decorative Crimson Banner */}
                    <div className="h-28 bg-gradient-to-r from-[#991b1b] via-[#b91c1c] to-[#dc2626] relative"></div>

                    {/* Avatar Circle with Badge */}
                    <div className="px-6 pb-6 text-center relative">
                        <div className="-mt-14 mx-auto w-24 h-24 rounded-full relative flex items-center justify-center ring-4 ring-white dark:ring-gray-800 shadow-lg bg-red-600 text-white">
                            {avatarPreview ? (
                                <img 
                                    src={avatarPreview} 
                                    alt={profile.name} 
                                    className="w-full h-full rounded-full object-cover" 
                                />
                            ) : (
                                <span className="text-3xl font-bold uppercase select-none">
                                    {profile.name ? profile.name.charAt(0) : 'A'}
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-slate-700 text-white hover:bg-slate-800 transition shadow-md ring-2 ring-white dark:ring-gray-800 cursor-pointer"
                                title={t('changePhoto')}
                            >
                                <Camera className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* User Identity */}
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-3.5">
                            {profile.name || 'Admin'}
                        </h2>
                        <div className="inline-block mt-1">
                            <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                                {profile.role || 'Administrator'}
                            </span>
                        </div>

                        {/* Email & Joined info */}
                        <div className="mt-5 space-y-2 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center justify-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                                <span>{profile.email || 'admin@inventaris.com'}</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                <span>{t('joinedSince')} {formatDateByPreference(profile.tanggal_bergabung_iso || profile.tanggal_bergabung, preferences.date_format)}</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-100 dark:border-gray-700/60 my-5"></div>

                        {/* Account Statistics */}
                        <div className="text-left space-y-3.5">
                            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                {t('accountStats')}
                            </h3>

                            <div className="flex items-start gap-3 text-xs">
                                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/40 text-gray-500 dark:text-gray-400 mt-0.5">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-400 font-medium">{t('lastLogin')}</p>
                                    <p className="text-gray-700 dark:text-gray-300 font-semibold mt-0.5">
                                        {profile.login_terakhir || 'Selasa, 10 Juni 2025 10:24 WIB'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 text-xs">
                                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/40 text-gray-500 dark:text-gray-400 mt-0.5">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-400 font-medium">{t('totalLogins')}</p>
                                    <p className="text-gray-700 dark:text-gray-300 font-semibold mt-0.5">
                                        {profile.total_login || 48} {t('timesUnit')}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Right Column: Profile Tabs & Content */}
                <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden">
                    
                    {/* Navigation Tabs */}
                    <div className="flex items-center border-b border-gray-100 dark:border-gray-700/60 px-6 pt-3 gap-6">
                        <button
                            type="button"
                            onClick={() => setActiveTab('info')}
                            className={`flex items-center gap-2 py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                                activeTab === 'info'
                                    ? 'border-red-600 text-red-600 dark:text-red-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                            }`}
                        >
                            <User className="w-4 h-4" />
                            <span>{t('tabAccountInfo')}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('password')}
                            className={`flex items-center gap-2 py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                                activeTab === 'password'
                                    ? 'border-red-600 text-red-600 dark:text-red-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                            }`}
                        >
                            <Lock className="w-4 h-4" />
                            <span>{t('tabChangePassword')}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('preferences')}
                            className={`flex items-center gap-2 py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                                activeTab === 'preferences'
                                    ? 'border-red-600 text-red-600 dark:text-red-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                            }`}
                        >
                            <Sliders className="w-4 h-4" />
                            <span>{t('tabPreferences')}</span>
                        </button>
                    </div>

                    {/* TAB 1: INFORMASI AKUN */}
                    {activeTab === 'info' && (
                        <form onSubmit={handleSaveInfo} className="p-6 sm:p-8 space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                    {t('personalInfo')}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {t('personalInfoDesc')}
                                </p>
                            </div>

                            {/* 2x2 Form Inputs Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                                {/* Nama Lengkap */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        {t('fullName')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <User className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                                            placeholder={t('fullName')}
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        {t('email')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                                            placeholder={t('email')}
                                        />
                                    </div>
                                </div>

                                {/* Role (Readonly) */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        {t('role')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Shield className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={profile.role}
                                            readOnly
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed select-none"
                                        />
                                    </div>
                                </div>

                                {/* Tanggal Bergabung */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        {t('joinedDate')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={formatDateByPreference(profile.tanggal_bergabung_iso || profile.tanggal_bergabung, preferences.date_format)}
                                            readOnly
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed select-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section Foto Profil */}
                            <div className="pt-2">
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                                    {t('profilePhoto')}
                                </h4>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                    {t('profilePhotoDesc')}
                                </p>

                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handlePhotoUpload} 
                                    accept="image/png, image/jpeg, image/webp" 
                                    className="hidden" 
                                />

                                <div className="flex items-center gap-4 mt-3">
                                    <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xl shadow-sm ring-2 ring-gray-100 dark:ring-gray-700 overflow-hidden">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{profile.name ? profile.name.charAt(0).toUpperCase() : 'A'}</span>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 rounded-xl transition cursor-pointer"
                                    >
                                        <Camera className="w-3.5 h-3.5 text-gray-500" />
                                        <span>{t('changePhoto')}</span>
                                    </button>

                                    {avatarPreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemovePhoto}
                                            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>{t('removePhoto')}</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Security Callout Banner */}
                            <div className="bg-rose-50/70 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl p-3.5 flex items-start gap-3">
                                <Info className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-[11px] text-rose-800 dark:text-rose-300 leading-relaxed">
                                    {t('securityCallout')}
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{saving ? t('saving') : t('saveChanges')}</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* TAB 2: UBAH PASSWORD */}
                    {activeTab === 'password' && (
                        <form onSubmit={handleSavePassword} className="p-6 sm:p-8 space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                    {t('passwordTitle')}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {t('passwordDesc')}
                                </p>
                            </div>

                            <div className="space-y-4 max-w-lg">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        {t('currentPassword')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Lock className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <input
                                            type={showCurrentPw ? "text" : "password"}
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                            required
                                            className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                                            placeholder={t('currentPassword')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPw(!showCurrentPw)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                                        >
                                            {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        {t('newPassword')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Lock className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <input
                                            type={showNewPw ? "text" : "password"}
                                            value={passwordData.new_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                            required
                                            minLength={8}
                                            className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                                            placeholder={t('ruleMin8')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPw(!showNewPw)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                                        >
                                            {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm New Password */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        {t('confirmNewPassword')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Lock className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <input
                                            type={showConfirmPw ? "text" : "password"}
                                            value={passwordData.new_password_confirmation}
                                            onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                                            required
                                            className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                                            placeholder={t('confirmNewPassword')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPw(!showConfirmPw)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                                        >
                                            {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Password requirements */}
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 space-y-2 max-w-lg">
                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{t('passwordRules')}</p>
                                <ul className="text-[11px] text-gray-500 dark:text-gray-400 space-y-1">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>{t('ruleMin8')}</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>{t('ruleMix')}</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{saving ? t('saving') : t('updatePasswordBtn')}</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* TAB 3: PREFERENSI (Point 2 - 6) - Auto-Save Realtime */}
                    {activeTab === 'preferences' && (
                        <div className="p-6 sm:p-8 space-y-8">
                            {/* Header dengan Auto-Save Realtime Badge */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                        {t('prefTitle')}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {t('prefDesc')}
                                    </p>
                                </div>

                                {/* Realtime Auto-Save Status Badge */}
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all duration-300 self-start sm:self-center ${
                                    savedNotice
                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 shadow-xs'
                                        : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200/80 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                                }`}>
                                    <span className="relative flex h-2 w-2">
                                        {savedNotice && (
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        )}
                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${savedNotice ? 'bg-emerald-500' : 'bg-emerald-500'}`}></span>
                                    </span>
                                    <span className="text-[11px] font-medium">
                                        {savedNotice ? t('changesSaved') : t('autoSaveActive')}
                                    </span>
                                </div>
                            </div>

                            {/* SECTION 1: Notifikasi & Peringatan (Point 4 & 5) */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 pb-1 border-b border-gray-100 dark:border-gray-800">
                                    <Bell className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                        {t('prefNotifSection')}
                                    </h4>
                                </div>
                                <p className="text-[11px] text-gray-400">
                                    {t('prefNotifSectionDesc')}
                                </p>

                                <div className="space-y-3 pt-1">
                                    {/* 1. Low stock email */}
                                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-200/80 dark:border-gray-700/60 transition hover:bg-gray-50 dark:hover:bg-gray-900/60">
                                        <div>
                                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{t('prefLowStockEmail')}</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">{t('prefLowStockEmailDesc')}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                                            <input 
                                                type="checkbox"
                                                checked={preferences.email_notif_low_stock}
                                                onChange={(e) => handleUpdatePreference('email_notif_low_stock', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                                        </label>
                                    </div>

                                    {/* 2. Login alert email */}
                                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-200/80 dark:border-gray-700/60 transition hover:bg-gray-50 dark:hover:bg-gray-900/60">
                                        <div>
                                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{t('prefNewDeviceEmail')}</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">{t('prefNewDeviceEmailDesc')}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                                            <input 
                                                type="checkbox"
                                                checked={preferences.email_notif_login}
                                                onChange={(e) => handleUpdatePreference('email_notif_login', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                                        </label>
                                    </div>

                                    {/* 3. Daily Digest Email (POINT 4) */}
                                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-200/80 dark:border-gray-700/60 transition hover:bg-gray-50 dark:hover:bg-gray-900/60">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{t('prefDailyDigest')}</p>
                                                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">Auto EOD</span>
                                            </div>
                                            <p className="text-[11px] text-gray-400 mt-0.5">{t('prefDailyDigestDesc')}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                                            <input 
                                                type="checkbox"
                                                checked={preferences.email_daily_digest}
                                                onChange={(e) => handleUpdatePreference('email_daily_digest', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                                        </label>
                                    </div>

                                    {/* 4. Sound Alert Feedback (POINT 5) */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-200/80 dark:border-gray-700/60 gap-3 transition hover:bg-gray-50 dark:hover:bg-gray-900/60">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{t('prefSoundAlert')}</p>
                                                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">Web Audio</span>
                                            </div>
                                            <p className="text-[11px] text-gray-400 mt-0.5">{t('prefSoundAlertDesc')}</p>
                                        </div>
                                        <div className="flex items-center gap-3 self-end sm:self-center">
                                            <button
                                                type="button"
                                                onClick={handleTestSound}
                                                disabled={isPlayingSound}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                                                    isPlayingSound 
                                                        ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
                                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                title="Tes Suara Notifikasi"
                                            >
                                                <Volume2 className="w-3.5 h-3.5" />
                                                <span>{isPlayingSound ? t('soundTesting') : t('testSoundBtn')}</span>
                                            </button>

                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox"
                                                    checked={preferences.sound_alert}
                                                    onChange={(e) => handleUpdatePreference('sound_alert', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: Alur Konfirmasi Transaksi Stok (POINT 2) */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 pb-1 border-b border-gray-100 dark:border-gray-800">
                                    <ShieldCheck className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                        {t('prefTxSection')}
                                    </h4>
                                </div>
                                <p className="text-[11px] text-gray-400">
                                    {t('prefTxSectionDesc')}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                                    {/* Mode Aman */}
                                    <div 
                                        onClick={() => handleUpdatePreference('confirm_transaction', true)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            preferences.confirm_transaction === true
                                                ? 'border-red-600 bg-red-50/40 dark:bg-red-950/20 shadow-sm'
                                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`p-2 rounded-lg ${preferences.confirm_transaction === true ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                                    <ShieldCheck className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                                                        {t('prefConfirmTxSafe')}
                                                    </p>
                                                    <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                        Paling Aman
                                                    </span>
                                                </div>
                                            </div>
                                            <input
                                                type="radio"
                                                name="confirm_transaction"
                                                checked={preferences.confirm_transaction === true}
                                                onChange={() => handleUpdatePreference('confirm_transaction', true)}
                                                className="mt-1 w-4 h-4 accent-red-600 cursor-pointer"
                                            />
                                        </div>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2.5 leading-relaxed">
                                            {t('prefConfirmTxSafeDesc')}
                                        </p>
                                    </div>

                                    {/* Mode Cepat */}
                                    <div 
                                        onClick={() => handleUpdatePreference('confirm_transaction', false)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            preferences.confirm_transaction === false
                                                ? 'border-red-600 bg-red-50/40 dark:bg-red-950/20 shadow-sm'
                                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`p-2 rounded-lg ${preferences.confirm_transaction === false ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                                    <Zap className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                                                        {t('prefConfirmTxQuick')}
                                                    </p>
                                                    <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                                        Kecepatan Tinggi
                                                    </span>
                                                </div>
                                            </div>
                                            <input
                                                type="radio"
                                                name="confirm_transaction"
                                                checked={preferences.confirm_transaction === false}
                                                onChange={() => handleUpdatePreference('confirm_transaction', false)}
                                                className="mt-1 w-4 h-4 accent-red-600 cursor-pointer"
                                            />
                                        </div>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2.5 leading-relaxed">
                                            {t('prefConfirmTxQuickDesc')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: Format Waktu & Tampilan Tanggal (POINT 3) */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 pb-1 border-b border-gray-100 dark:border-gray-800">
                                    <Calendar className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                        {t('prefTimeSection')}
                                    </h4>
                                </div>
                                <p className="text-[11px] text-gray-400">
                                    {t('prefTimeSectionDesc')}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                    {/* Format Tanggal */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                            {t('prefDateFormat')}
                                        </label>
                                        <select
                                            value={preferences.date_format}
                                            onChange={(e) => handleUpdatePreference('date_format', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition cursor-pointer"
                                        >
                                            <option value="DD/MM/YYYY">{t('prefDateFormatId')}</option>
                                            <option value="YYYY-MM-DD">{t('prefDateFormatIso')}</option>
                                            <option value="DD MMMM YYYY">{t('prefDateFormatLong')}</option>
                                        </select>

                                        {/* Live Preview Box */}
                                        <div className="mt-2.5 p-2.5 rounded-lg bg-gray-100/70 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 flex items-center justify-between text-[11px]">
                                            <span className="text-gray-500 dark:text-gray-400 font-medium">{t('previewDateLabel')}</span>
                                            <span className="font-mono font-bold text-red-700 dark:text-red-400">
                                                {formatDateByPreference(new Date(), preferences.date_format)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Zona Waktu */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                            {t('prefTimezone')}
                                        </label>
                                        <select
                                            value={preferences.timezone}
                                            onChange={(e) => handleUpdatePreference('timezone', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition cursor-pointer"
                                        >
                                            <option value="WIB">WIB (Waktu Indonesia Barat - UTC+7)</option>
                                            <option value="WITA">WITA (Waktu Indonesia Tengah - UTC+8)</option>
                                            <option value="WIT">WIT (Waktu Indonesia Timur - UTC+9)</option>
                                        </select>
                                        <p className="text-[11px] text-gray-400 mt-2">
                                            Waktu sistem operasional saat ini disinkronkan dengan server gudang pusat.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* FOOTER NOTE: Real-time Auto-save Info (Menggantikan tombol simpan manual) */}
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-[11px] text-gray-400">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>{t('autoSavedNote')}</span>
                                </span>
                                <span className="text-[10px] text-gray-400 hidden sm:inline font-mono">
                                    Sinkronisasi instan real-time
                                </span>
                            </div>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}
