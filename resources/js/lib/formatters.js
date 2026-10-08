/**
 * Formatter utilities for dates and preferences
 */

export function formatDateByPreference(dateInput, explicitFormat = null) {
    if (!dateInput) return '-';
    
    let date;
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        const [y, m, d] = dateInput.split('-').map(Number);
        date = new Date(y, m - 1, d);
    } else {
        date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) return String(dateInput);

    let format = explicitFormat;
    if (!format) {
        try {
            const prefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
            format = prefs.date_format || 'DD/MM/YYYY';
        } catch (e) {
            format = 'DD/MM/YYYY';
        }
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    if (format === 'YYYY-MM-DD') {
        return `${year}-${month}-${day}`;
    }

    if (format === 'DD MMMM YYYY') {
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return `${day} ${months[date.getMonth()]} ${year}`;
    }

    // Default 'DD/MM/YYYY'
    return `${day}/${month}/${year}`;
}
