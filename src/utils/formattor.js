export const formatLargeNumbers = (num) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num;
};

export const formatCurrency = (amount) => {
    // Use 'compact' notation for large amounts for better fit in cards
    if (amount > 1e6) {
        return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(amount);
    }
    const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    return formatted;
}

export const formatDateISO = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export const formatCompactNumber = (n) => {
    if (n == null || Number.isNaN(n)) return "—";
    // Keep it readable for both small and large rates
    if (n >= 1000) return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
    if (n >= 1) return new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 }).format(n);
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 }).format(n);
}

export function formatCompactCurrency(value) {
    const number = Number(value)
    if (!Number.isFinite(number)) return '--'

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 2,
    }).format(number)
}

export function formatNumber(value) {
    const number = Number(value)
    if (!Number.isFinite(number)) return '--'
    return new Intl.NumberFormat('en-US').format(number)
}

export function formatPercent(value) {
    const number = Number(value)
    if (!Number.isFinite(number)) return '--'
    const sign = number > 0 ? '+' : ''
    return `${sign}${number.toFixed(1)}%`
}

export function formatPrice(value) {
    const number = Number(value)
    if (!Number.isFinite(number)) return '--'

    if (number >= 1000) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(number)
    }

    if (number >= 1) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 2,
        }).format(number)
    }

    if (number >= 0.01) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 4,
        }).format(number)
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 6,
    }).format(number)
}

export function formatDateLabel(timestamp, range = '1M') {
    const date = new Date(timestamp)

    const options =
        range === '1Y' || range === 'ALL'
            ? { month: 'short', year: '2-digit' }
            : { day: '2-digit', month: 'short' }

    return new Intl.DateTimeFormat('en-US', options).format(date)
}

export function stripHtml(text = '') {
    return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function truncate(text = '', max = 150) {
    if (text.length <= max) return text
    return `${text.slice(0, max).trim()}...`
}