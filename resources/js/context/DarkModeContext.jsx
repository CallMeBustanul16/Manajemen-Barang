import React, { createContext, useState, useEffect, useContext } from 'react';

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
    // Cek preferensi tema: 'light' | 'dark' | 'system'
    const getInitialThemeMode = () => {
        const saved = localStorage.getItem('themeMode');
        if (saved) return saved;
        const savedDark = localStorage.getItem('darkMode');
        if (savedDark !== null) {
            return savedDark === 'true' ? 'dark' : 'light';
        }
        return 'system';
    };

    const [themeMode, setThemeModeState] = useState(getInitialThemeMode);
    
    // Hitung apakah dark aktif berdasarkan themeMode
    const evaluateIsDark = (mode) => {
        if (mode === 'dark') return true;
        if (mode === 'light') return false;
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };

    const [darkMode, setDarkMode] = useState(() => evaluateIsDark(getInitialThemeMode()));

    useEffect(() => {
        const isDark = evaluateIsDark(themeMode);
        setDarkMode(isDark);
        localStorage.setItem('themeMode', themeMode);
        localStorage.setItem('darkMode', isDark);

        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Listener jika mode 'system'
        if (themeMode === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e) => {
                setDarkMode(e.matches);
                if (e.matches) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            };
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [themeMode]);

    const setThemeMode = (mode) => {
        setThemeModeState(mode);
    };

    const toggleDarkMode = () => {
        const nextMode = darkMode ? 'light' : 'dark';
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