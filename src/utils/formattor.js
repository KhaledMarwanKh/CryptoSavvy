export const formatLargeNumbers = (num) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num;
};

export function formatCurrency(value) {
    if (value == null || Number.isNaN(Number(value))) return "—";
    const n = Number(value);
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: n < 1 ? 6 : n < 100 ? 4 : 2,
    }).format(n);
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

export function formatNumber(value, digits = 2) {
    if (value == null || Number.isNaN(Number(value))) return "—";
    return new Intl.NumberFormat("en-US", {
        notation: Math.abs(Number(value)) >= 1000000 ? "compact" : "standard",
        maximumFractionDigits: digits,
    }).format(Number(value));
}

export function formatPercent(value) {
    if (value == null || Number.isNaN(Number(value))) return "—";
    const n = Number(value);
    return `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export function formatMessageTime(ts) {
    return new Date(ts).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatAxisTime(ts, interval) {
    const d = new Date(ts);
    if (interval === "1d" || interval === "1w") {
        return d.toLocaleDateString([], { month: "short", day: "numeric" });
    }
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}