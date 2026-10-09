import React, { createContext, useState, useEffect, useContext } from 'react';

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
    // Cek preferensi tema: 'light' | 'dark' | 'navy' | 'warm'
    const getInitialThemeMode = () => {
        const saved = localStorage.getItem('themeMode');
        if (saved && ['light', 'dark', 'navy', 'warm'].includes(saved)) return saved;
        // Migrasi jika sebelumnya ada 'system'
        if (saved === 'system') return 'light';
        const savedDark = localStorage.getItem('darkMode');
        if (savedDark !== null) {
            return savedDark === 'true' ? 'dark' : 'light';
        }
        return 'light';
    };

    const [themeMode, setThemeModeState] = useState(getInitialThemeMode);
    
    // Hitung apakah dark mode aktif (untuk dark dan navy)
    const evaluateIsDark = (mode) => {
        return mode === 'dark' || mode === 'navy';
    };

    const [darkMode, setDarkMode] = useState(() => evaluateIsDark(getInitialThemeMode()));

    useEffect(() => {
        const isDark = evaluateIsDark(themeMode);
        setDarkMode(isDark);
        localStorage.setItem('themeMode', themeMode);
        localStorage.setItem('darkMode', String(isDark));

        const root = document.documentElement;
        root.setAttribute('data-theme', themeMode);

        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        if (themeMode === 'navy') {
            root.classList.add('theme-navy');
            root.classList.remove('theme-warm');
        } else if (themeMode === 'warm') {
            root.classList.add('theme-warm');
            root.classList.remove('theme-navy');
        } else {
            root.classList.remove('theme-navy', 'theme-warm');
        }
    }, [themeMode]);

    const setThemeMode = (mode) => {
        setThemeModeState(mode);
    };

    // Tombol saklar di header: bergantian melalui 4 tema (light -> dark -> navy -> warm -> light)
    const toggleDarkMode = () => {
        const cycle = {
            light: 'dark',
            dark: 'navy',
            navy: 'warm',
            warm: 'light'
        };
        const nextMode = cycle[themeMode] || (darkMode ? 'light' : 'dark');
        setThemeMode(nextMode);
    };

    return (
        <DarkModeContext.Provider value={{ darkMode, toggleDarkMode, setDarkMode, themeMode, setThemeMode }}>
            {children}
        </DarkModeContext.Provider>
    );
}

export function gunakanDarkMode() {
    const context = useContext(DarkModeContext);
    if (!context) {
        throw new Error('gunakanDarkMode harus digunakan bersamaan dengan DarkModeProvider');
    }
    return context;
}