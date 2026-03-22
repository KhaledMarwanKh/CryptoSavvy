import { cn } from "../../utils/concators";

export default function IndicatorChip({ title, value, hint }) {
    return (
        <div
            className={cn(
                "flex items-center justify-between gap-3 rounded-xl px-3 py-2",
                "bg-slate-900/70 border border-slate-700/50 shadow-md",
                "min-w-[160px]"
            )}
            title={hint || ""}
        >
            <div className="text-slate-300 text-xs">{title}</div>
            <div className="text-slate-100 text-sm font-semibold tabular-nums">{value}</div>
        </div>
    );
}
