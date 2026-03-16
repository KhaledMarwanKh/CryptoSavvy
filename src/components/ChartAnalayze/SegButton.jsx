function cn(...xs) {
    return xs.filter(Boolean).join(" ");
}

export default function SegButton({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition",
                "border border-slate-700/50",
                active
                    ? "bg-blue-600 text-white"
                    : "bg-slate-950/60 text-slate-300 hover:bg-slate-900/60"
            )}
        >
            {children}
        </button>
    );
}