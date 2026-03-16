import React, { useState, useMemo, useEffect } from "react";
import { ArrowRightLeft, DollarSignIcon, Table2, TrendingDown, TrendingUp } from "lucide-react";
import axiosInst from "../../libs/axiosInst";

function formatCompactNumber(n) {
    if (n == null || Number.isNaN(n)) return "—";
    // Keep it readable for both small and large rates
    if (n >= 1000) return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
    if (n >= 1) return new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 }).format(n);
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 }).format(n);
}

export default function SypCurrency() {
    const [loadingTable, setLoadingTable] = useState(false);
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState("USD");
    const [mode, setMode] = useState("SYP_TO");
    const [currencyData, setCurrencyData] = useState([]);

    const selected = useMemo(
        () => currencyData?.find(c => c.currency === currency),
        [currency, currencyData]
    );

    const result = useMemo(() => {
        if (!amount || !selected) return "";

        const value = parseFloat(amount);
        const rate = parseFloat(selected.sell);

        if (mode === "SYP_TO") {
            return (value / rate).toFixed(2);
        } else {
            return (value * rate).toLocaleString();
        }
    }, [amount, selected, mode]);

    const swapMode = () => {
        setMode(prev => (prev === "SYP_TO" ? "TO_SYP" : "SYP_TO"));
        setAmount("");
    };

    const getSYPServicesData = async () => {
        try {
            const apiURL = "/api/currency/syp";

            const response = (await axiosInst.get(apiURL)).data;

            console.log(response)

            setCurrencyData(response.price.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingTable(false);
        }
    }

    useEffect(() => {
        getSYPServicesData();
    }, [])

    return (
        <>
            {/* Converter */}
            <div className="bg-slate-900/70 border border-slate-700/50 backdrop-blur-xl rounded-xl p-6 shadow-md mb-6">

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Currency Converter</h2>

                    <button
                        onClick={swapMode}
                        className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700"
                    >
                        <ArrowRightLeft className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-4">

                    {/* Amount */}
                    <div>
                        <label className="text-slate-300 text-sm">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="w-full mt-1 bg-slate-950/60 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Currency */}
                    <div>
                        <label className="text-slate-300 text-sm">Currency</label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full mt-1 bg-slate-950/60 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {currencyData?.map((c) => (
                                <option key={c.currency} value={c.currency}>
                                    {c.currency} — {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Result */}
                    <div>
                        <label className="text-slate-300 text-sm">Result</label>
                        <div className="mt-1 bg-slate-950/60 border border-slate-700 rounded-lg p-2.5 font-semibold">
                            {result || "--"}
                            <span className="ml-2 text-slate-400 text-sm">
                                {mode === "SYP_TO" ? currency : "SYP"}
                            </span>
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
                        </div>
                    </div>
                    <div className="text-sm text-slate-400">
                        {loadingTable ? "Loading…" : `${currencyData?.length} currencies`}
                    </div>
                </div>

                {/* Mobile: stacked cards */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
                    {currencyData?.slice(0, 12).map((r) => (
                        <div
                            key={r.currency}
                            className="rounded-2xl border border-slate-700/50 bg-slate-950/60 p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-sm text-slate-400">{r.name}</div>
                                    <div className="text-lg font-semibold">{r.currency}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-semibold">
                                        {
                                            <div className={`text-sm flex items-center gap-2 ${r.change[0] === "▲" ? "text-emerald-400" : "text-red-400"} `}>
                                                {
                                                    r.change[0] === "▲" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
                                                }
                                                {r.change.slice(1)}
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-slate-400">
                                <p>
                                    <span className="text-sm text-slate-200">Buy : </span> {r.buy} SYP
                                </p>
                                <p>
                                    <span className="text-sm text-slate-200">Sell : </span> {r.sell} SYP
                                </p>
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
                                        <th className="px-4 py-3 font-medium">Name</th>
                                        <th className="px-4 py-3 font-medium">Buy (SYP)</th>
                                        <th className="px-4 py-3 font-medium">Sell (SYP)</th>
                                        <th className="px-4 py-3 font-medium">Change</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {currencyData?.map((r) => (
                                        <tr key={r.currency} className="hover:bg-slate-900/40">
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-slate-100">{r.currency}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-slate-100">{r.name}</div>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-slate-100">
                                                {formatCompactNumber(r.buy)}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-slate-100">
                                                {formatCompactNumber(r.sell)}
                                            </td>
                                            <td className={`px-4 py-3 text-sm flex items-center gap-2 ${r.change[0] === "▲" ? "text-emerald-400" : "text-red-400"} `}>
                                                {
                                                    r.change[0] === "▲" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
                                                }
                                                {r.change.slice(1)}
                                            </td>
                                        </tr>
                                    ))}
                                    {!loadingTable && currencyData?.length === 0 ? (
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
        </>
    );
}