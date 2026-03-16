import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    ArrowRightLeft,
    AlertTriangle,
    Table2,
} from "lucide-react";
import SypCurrency from "../components/Currency Page/SYPServices";
import axiosInst from "../libs/axiosInst";
import { formatCompactNumber, formatDateISO } from "../utils/formattor";
import CurrencySelect from "../components/Currency Page/CurrencySelect";
import CustomTooltip from "../components/Currency Page/CustomTooltip";
import { CURRENCIES } from "../data/data";

function CurrencyConverterAndRates() {
    const [currentMode, setMode] = useState("Global Services");
    const [base, setBase] = useState("USD");
    const [target, setTarget] = useState("EUR");

    const [amount, setAmount] = useState("100");
    const [timeseries, setTimeseries] = useState([]); // [{date, rate}]
    const [latestRates, setLatestRates] = useState([]); // [{currency, rate}]
    const [latestTargetRate, setLatestTargetRate] = useState(null);

    const [loadingChart, setLoadingChart] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [error, setError] = useState("");

    const abortRef = useRef({ chart: null, table: null });

    const intervalDays = 30;

    const converted = useMemo(() => {
        const n = Number(amount);
        if (!Number.isFinite(n) || latestTargetRate == null) return null;
        return n * latestTargetRate?.toFixed(2);
    }, [amount, latestTargetRate]);

    const currentRate = useMemo(() => {
        if (!timeseries?.length) return null;
        return timeseries[timeseries.length - 1]?.rate ?? null;
    }, [timeseries]);

    const startRate = useMemo(() => (timeseries?.length ? timeseries[0]?.rate : null), [timeseries]);

    const changePct = useMemo(() => {
        if (startRate == null || currentRate == null || startRate === 0) return null;
        return ((currentRate - startRate) / startRate) * 100;
    }, [startRate, currentRate]);

    const fetchTimeseries = async () => {
        if (base === target) {
            setTimeseries([]);
            setLatestTargetRate(1);
            setError("Base and target currencies are the same. Choose different currencies to view a chart.");
            return;
        }

        setError("");
        setLoadingChart(true);

        abortRef.current.chart?.abort?.();
        const controller = new AbortController();
        abortRef.current.chart = controller;

        try {
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - intervalDays);

            const startISO = formatDateISO(start);
            const endISO = formatDateISO(end);

            // Frankfurter time series: /YYYY-MM-DD..YYYY-MM-DD?from=USD&to=EUR
            const url = `https://api.frankfurter.app/${startISO}..${endISO}?from=${encodeURIComponent(
                base
            )}&to=${encodeURIComponent(target)}`;

            const res = await fetch(url, { signal: controller.signal });
            if (!res.ok) throw new Error(`Chart request failed (${res.status})`);
            const data = await res.json();

            const ratesObj = data?.rates ?? {};
            const rows = Object.keys(ratesObj)
                .sort()
                .map((date) => ({
                    date,
                    rate: ratesObj[date]?.[target] ?? null,
                }))
                .filter((r) => r.rate != null);

            setTimeseries(rows);
            setLatestTargetRate(rows.length ? rows[rows.length - 1].rate : null);
        } catch (e) {
            if (e?.name !== "AbortError") {
                setError(e?.message || "Failed to load chart data.");
                setTimeseries([]);
                setLatestTargetRate(null);
            }
        } finally {
            setLoadingChart(false);
        }
    };

    const fetchLatestTable = async () => {
        setLoadingTable(true);

        abortRef.current.table?.abort?.();
        const controller = new AbortController();
        abortRef.current.table = controller;

        try {
            // Latest rates for base: /latest?from=USD
            const url = `https://api.frankfurter.app/latest?from=${encodeURIComponent(base)}`;
            const res = await fetch(url, { signal: controller.signal });
            if (!res.ok) throw new Error(`Table request failed (${res.status})`);
            const data = await res.json();

            const rates = data?.rates ?? {};
            const rows = Object.entries(rates)
                .map(([currency, rate]) => ({ currency, rate }))
                .sort((a, b) => a.currency.localeCompare(b.currency));

            setLatestRates(rows);

            // Keep converter in sync even if chart is empty (e.g., API hiccup)
            const tRate = rates?.[target];
            if (typeof tRate === "number") setLatestTargetRate(tRate);
        } catch (e) {
            if (e?.name !== "AbortError") {
                setError(e?.message || "Failed to load latest rates.");
                setLatestRates([]);
            }
        } finally {
            setLoadingTable(false);
        }
    };

    const covert = async () => {
        const apiURL = "/api/currency/convert";

        const response = (await axiosInst.get(apiURL, {
            params: {
                from: base,
                to: target,
                amount: Number.parseFloat(amount)
            }
        })).data

        console.log(response);

    }

    useEffect(() => {
        fetchTimeseries();
        covert();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [base, target]);

    useEffect(() => {
        fetchLatestTable();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [base]);

    const onSwap = () => {
        setBase(target);
        setTarget(base);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-8 text-slate-100">
            <div className="flex items-center justify-center gap-5 mb-6">
                {
                    ["Global Services", "SYP Services"].map(mode => (
                        <button onClick={() => setMode(mode)} className={`px-3 py-2 rounded-lg ${mode === currentMode ? "bg-blue-600 font-semibold" : "bg-slate-700"} transition-all duration-500`} >
                            {mode}
                        </button>
                    ))
                }
            </div>

            {
                currentMode === "Global Services" && (
                    <>
                        <div className="mx-auto w-full max-w-6xl">
                            {/* Error */}
                            {error ? (
                                <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-400 backdrop-blur-xl">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="mt-0.5 h-5 w-5" />
                                        <div className="text-sm">{error}</div>
                                    </div>
                                </div>
                            ) : null}

                            {/* Top card: chart + converter */}
                            <div
                                className={[
                                    "rounded-2xl border border-slate-700/50 bg-slate-900/70 p-4 md:p-6",
                                    "shadow-md backdrop-blur-xl",
                                ].join(" ")}
                            >
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                    {/* Chart */}
                                    <div className="lg:col-span-2">
                                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-sm text-slate-400">Trend</div>
                                                <div className="text-lg font-semibold">
                                                    1 {base} → {target}
                                                </div>
                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                                                    <span className="text-slate-400">Current:</span>
                                                    <span className="font-semibold">
                                                        {currentRate == null ? "—" : formatCompactNumber(currentRate?.toFixed(2))}
                                                    </span>
                                                    <span className="text-slate-400">·</span>
                                                    <span className="text-slate-400">Change:</span>
                                                    {changePct == null ? (
                                                        <span className="text-slate-400">—</span>
                                                    ) : (
                                                        <span
                                                            className={[
                                                                "rounded-full border px-2 py-0.5",
                                                                changePct >= 0
                                                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                                                    : "border-red-500/30 bg-red-500/10 text-red-400",
                                                            ].join(" ")}
                                                        >
                                                            {changePct >= 0 ? "+" : ""}
                                                            {changePct.toFixed(2)}%
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                            <CurrencySelect
                                                label="Base currency"
                                                value={base}
                                                onChange={setBase}
                                                options={CURRENCIES}
                                            />
                                            <CurrencySelect
                                                label="Target currency"
                                                value={target}
                                                onChange={setTarget}
                                                options={CURRENCIES}
                                            />
                                        </div>

                                        <div className="mt-4 h-64 w-full overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-950/60">
                                            {loadingChart ? (
                                                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                                                    Loading chart…
                                                </div>
                                            ) : timeseries?.length ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={timeseries} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
                                                        <defs>
                                                            <linearGradient id="rateFill" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                                                                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.05} />
                                                            </linearGradient>
                                                        </defs>

                                                        <CartesianGrid stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />
                                                        <XAxis
                                                            dataKey="date"
                                                            tick={{ fill: "rgba(148,163,184,0.9)", fontSize: 12 }}
                                                            tickFormatter={(d) => d.slice(5)}
                                                            axisLine={{ stroke: "rgba(148,163,184,0.25)" }}
                                                            tickLine={{ stroke: "rgba(148,163,184,0.25)" }}
                                                        />
                                                        <YAxis
                                                            tick={{ fill: "rgba(148,163,184,0.9)", fontSize: 12 }}
                                                            tickFormatter={(v) => formatCompactNumber(v)}
                                                            axisLine={{ stroke: "rgba(148,163,184,0.25)" }}
                                                            tickLine={{ stroke: "rgba(148,163,184,0.25)" }}
                                                            width={56}
                                                            domain={["auto", "auto"]}
                                                        />
                                                        <Tooltip content={<CustomTooltip base={base} target={target} />} />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="rate"
                                                            stroke="#2563eb"
                                                            strokeWidth={2}
                                                            fill="url(#rateFill)"
                                                            dot={false}
                                                            activeDot={{ r: 4, fill: "#2563eb", stroke: "#0b1220", strokeWidth: 2 }}
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                                                    No chart data available.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Converter */}
                                    <div className="lg:col-span-1">
                                        <div className="rounded-2xl border border-slate-700/50 bg-slate-950/60 p-4">
                                            <div className="mb-1 text-sm text-slate-400">Converter</div>
                                            <div className="text-lg font-semibold">Convert {base} → {target}</div>

                                            <div className="mt-4 space-y-3">
                                                <label className="block">
                                                    <div className="mb-2 text-sm font-medium text-slate-300">Amount ({base})</div>
                                                    <div className="relative">
                                                        <input
                                                            value={amount}
                                                            onChange={(e) => setAmount(e.target.value)}
                                                            inputMode="decimal"
                                                            placeholder="0.00"
                                                            className="w-full p-2 text-gray-400 bg-slate-950/60 border border-slate-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-left"
                                                        />
                                                    </div>
                                                </label>

                                                <button
                                                    onClick={onSwap}
                                                    className={[
                                                        "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/50",
                                                        "bg-blue-600 text-white font-bold px-3 py-2 hover:text-slate-200 transition hover:bg-slate-900",
                                                    ].join(" ")}
                                                    title="Swap currencies"
                                                >
                                                    <ArrowRightLeft className="h-4 w-4 text-slate-300" />
                                                    Swap
                                                </button>

                                                <div
                                                    className={[
                                                        "rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4",
                                                    ].join(" ")}
                                                >
                                                    <div className="text-sm text-slate-300">You receive</div>
                                                    <div className="mt-1 text-2xl font-semibold text-emerald-400">
                                                        {converted == null ? "—" : `${formatCompactNumber(converted)} ${target}`}
                                                    </div>
                                                    <div className="mt-2 text-xs text-slate-400">
                                                        Rate:{" "}
                                                        <span className="text-slate-200">
                                                            1 {base} = {latestTargetRate == null ? "—" : formatCompactNumber(latestTargetRate?.toFixed(2))} {target}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Table section */}
                            <div
                                className={[
                                    "mt-6 rounded-2xl border border-slate-700/50 bg-slate-900/70 p-4 md:p-6",
                                    "shadow-md backdrop-blur-xl",
                                ].join(" ")}
                            >
                                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-2">
                                        <Table2 className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <div className="text-lg font-semibold">Latest rates</div>
                                            <div className="text-sm text-slate-400">
                                                1 {base} against other currencies
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-sm text-slate-400">
                                        {loadingTable ? "Loading…" : `${latestRates.length} currencies`}
                                    </div>
                                </div>

                                {/* Mobile: stacked cards */}
                                <div className="grid grid-cols-1 gap-3 md:hidden">
                                    {latestRates.slice(0, 12).map((r) => (
                                        <div
                                            key={r.currency}
                                            className="rounded-2xl border border-slate-700/50 bg-slate-950/60 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-sm text-slate-400">Currency</div>
                                                    <div className="text-lg font-semibold">{r.currency}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-slate-400">Rate</div>
                                                    <div className="text-lg font-semibold">
                                                        {formatCompactNumber(r.rate)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-3 text-xs text-slate-400">
                                                1 {base} ={" "}
                                                <span className="text-slate-200">{formatCompactNumber(r.rate)}</span>{" "}
                                                {r.currency}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop: table */}
                                <div className="hidden md:block">
                                    <div className="overflow-hidden rounded-2xl border border-slate-700/50">
                                        <div className="max-h-[520px] overflow-auto bg-slate-950/60">
                                            <table className="min-w-full">
                                                <thead className="sticky top-0 bg-slate-900/80 backdrop-blur-xl">
                                                    <tr className="text-left text-sm text-slate-300">
                                                        <th className="px-4 py-3 font-medium">Currency</th>
                                                        <th className="px-4 py-3 font-medium">Rate</th>
                                                        <th className="px-4 py-3 font-medium">Meaning</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-700/50">
                                                    {latestRates.map((r) => (
                                                        <tr key={r.currency} className="hover:bg-slate-900/40">
                                                            <td className="px-4 py-3">
                                                                <div className="font-semibold text-slate-100">{r.currency}</div>
                                                            </td>
                                                            <td className="px-4 py-3 font-semibold text-slate-100">
                                                                {formatCompactNumber(r.rate)}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-slate-400">
                                                                1 {base} = {formatCompactNumber(r.rate)} {r.currency}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {!loadingTable && latestRates.length === 0 ? (
                                                        <tr>
                                                            <td className="px-4 py-6 text-center text-sm text-slate-400" colSpan={3}>
                                                                No rates available.
                                                            </td>
                                                        </tr>
                                                    ) : null}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }
            {
                currentMode === "SYP Services" && (
                    <SypCurrency />
                )
            }
        </div>
    );
}
export default CurrencyConverterAndRates