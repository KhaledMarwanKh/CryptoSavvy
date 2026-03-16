import { formatCompactNumber } from "../../utils/formattor";

export default function CustomTooltip({ active, payload, label, base, target }) {
    if (!active || !payload?.length) return null;
    const v = payload[0]?.value;
    return (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/90 p-3 text-sm text-slate-200 shadow-md backdrop-blur-xl">
            <div className="mb-1 text-slate-400">{label}</div>
            <div className="font-semibold">
                1 {base} = {formatCompactNumber(v)} {target}
            </div>
        </div>
    );
}