import React, { createContext, useState, useEffect, useContext } from 'react';

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
    // Cek preferensi dari localStorage atau sistem
    const getInitialTheme = () => {
        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme !== null) {
            return savedTheme === 'true';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };

    const [darkMode, setDarkMode] = useState(getInitialTheme);

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const toggleDarkMode = () => setDarkMode(!darkMode);

    return (
        <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
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