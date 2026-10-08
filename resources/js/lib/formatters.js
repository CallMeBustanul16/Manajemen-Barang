/**
 * Formatter utilities for dates and preferences
 */

export function formatDateByPreference(dateInput, explicitFormat = null, includeTime = false) {
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
            const appSettings = JSON.parse(localStorage.getItem('appSettings') || '{}');
            const prefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
            format = appSettings.date_format || prefs.date_format || 'DD/MM/YYYY';
        } catch (e) {
            format = 'DD/MM/YYYY';
        }
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    let formattedDate = `${day}/${month}/${year}`;

    if (format === 'YYYY-MM-DD') {
        formattedDate = `${year}-${month}-${day}`;
    } else if (format === 'DD MMMM YYYY') {
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        formattedDate = `${day} ${months[date.getMonth()]} ${year}`;
    } else {
        formattedDate = `${day}/${month}/${year}`;
    }

    if (includeTime) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${formattedDate} ${hours}:${minutes}`;
    }

    return formattedDate;
}
