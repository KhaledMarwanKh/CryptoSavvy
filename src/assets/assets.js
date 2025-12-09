export const dashboardIcons = [
    // --- Navigation & Core Features ---
    { name: 'LayoutDashboard', usage: 'Main Dashboard or Home link in the sidebar.' },
    { name: 'Wallet', usage: 'Wallet or Portfolio balance section.' },
    { name: 'ArrowUpDown', usage: 'Exchange or Trading functionality.' },
    { name: 'BarChart3', usage: 'Detailed Market Analysis or Chart view.' },
    { name: 'Bell', usage: 'Notifications icon in the header.' },

    // --- Data & Metrics ---
    { name: 'TrendingUp', usage: 'Indicator for overall positive market movement.' },
    { name: 'TrendingDown', usage: 'Indicator for overall negative market movement.' },
    { name: 'Search', usage: 'Search bar input icon.' },
    { name: 'Clock', usage: 'Time period selector (e.g., 24h, 7d, 1m).' },
    { name: 'CreditCard', usage: 'Payment or Deposit/Withdrawal features.' },

    // --- User & Settings ---
    { name: 'Settings', usage: 'User settings or preferences link.' },
    { name: 'User', usage: 'User profile or account avatar.' },

    // --- Specific Crypto Symbols ---
    { name: 'Bitcoin', usage: 'Specific coin icon (if using a library that includes them).' },
    { name: 'DollarSign', usage: 'General currency symbol for fiat values.' },

    // The data/chart icon used in the CryptoSavvy logo itself
    { name: 'BarChart2', usage: 'Stylized logo icon (as an alternative to the inline SVG).' }
];


export const range = (start, end = 0, step = 1) => {
    const result = [];

    if (end < start) {
        [end, start] = [start, end];
    }

    for (let i = start; i < end; i += step) {
        result.push(i);
    }

    return result;
}

export const colorPellets = [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Crimson", hex: "#DC143C" },
    { name: "Deep SkyBlue", hex: "#00BFFF" },
    { name: "Lime Green", hex: "#32CD32" },
    { name: "Gold enrod", hex: "#DAA520" },
    { name: "Medium Orchid", hex: "#BA55D3" },
    { name: "Coral", hex: "#FF7F50" },
    { name: "Teal", hex: "#008080" },
    { name: "Tomato", hex: "#FF6347" },
    { name: "Slate Blue", hex: "#6A5ACD" },
    { name: "Forest Green", hex: "#228B22" },
    { name: "Hot Pink", hex: "#FF69B4" },
    { name: "Dodger Blue", hex: "#1E90FF" },
    { name: "Dark Orange", hex: "#FF8C00" },
    { name: "Sea Green", hex: "#2E8B57" },
    { name: "Orchid", hex: "#DA70D6" },
    { name: "Fire Brick", hex: "#B22222" },
    { name: "Royal Blue", hex: "#4169E1" },
    { name: "Sienna", hex: "#A0522D" },
    { name: "Steel Blue", hex: "#4682B4" },
    { name: "Medium Violet Red", hex: "#C71585" },
    { name: "Dark Cyan", hex: "#008B8B" },
    { name: "Peru", hex: "#CD853F" },
    { name: "Turquoise", hex: "#40E0D0" },
    { name: "Plum", hex: "#DDA0DD" },
    { name: "Olive Drab", hex: "#6B8E23" },
    { name: "Chocolate", hex: "#D2691E" },
    { name: "Indian Red", hex: "#CD5C5C" },
    { name: "Medium Sea Green", hex: "#3CB371" }
];

