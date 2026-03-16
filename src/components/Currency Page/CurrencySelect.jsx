export default function CurrencySelect({ label, value, onChange, options }) {
    return (
        <label className="block">
            <div className="mb-2 text-sm font-medium text-slate-300">{label}</div>
            <div className="group relative">
                <select
                    className="w-full p-2 text-gray-400 bg-slate-950/60 border border-slate-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-left"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                >
                    {options.map((c) => (
                        <option key={c.code} value={c.code}>
                            {c.code} — {c.name}
                        </option>
                    ))}
                </select>
            </div>
        </label>
    );
}