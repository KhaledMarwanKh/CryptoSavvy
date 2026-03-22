import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    createChart,
    ColorType,
    CandlestickSeries,
    HistogramSeries,
} from "lightweight-charts";
import { INTERVALS } from "../../data/constants"

const BINANCE_REST = "https://api.binance.com";

const ui = {
    card: "rounded-2xl border border-slate-700/50 bg-slate-900/70 backdrop-blur-xl shadow-md",
    softPanel: "rounded-xl border border-slate-700/50 bg-slate-950/60",
    inputWrap: "rounded-xl focus-within:ring-2 focus-within:ring-blue-500",
    input: "w-full rounded-xl border border-slate-700 bg-white px-4 py-3 text-gray-700 outline-none",
    activeButton: "border border-transparent bg-blue-600 text-white hover:bg-blue-700",
    inactiveButton:
        "border border-slate-700 bg-slate-950/60 text-slate-300 hover:bg-slate-800",
    successBox: "border border-emerald-500/30 bg-emerald-500/10",
    errorBox: "border border-red-500/30 bg-red-500/10",
};

localStorage.setItem("watchlist", JSON.stringify({
    list: [
        {
            baseSymbol: "BTC",
            symbol: "BTCUSDT"
        }
    ]
}))

function normalizeWatchlist(raw) {
    const list = Array.isArray(raw?.list) ? raw.list : [];
    const unique = new Map();

    list.forEach((item) => {
        const symbol = String(item?.symbol || "").trim().toUpperCase();
        const baseSymbol = String(item?.baseSymbol || "").trim().toUpperCase();

        if (symbol && baseSymbol && !unique.has(symbol)) {
            unique.set(symbol, { symbol, baseSymbol });
        }
    });

    return Array.from(unique.values());
}

function formatPrice(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return "--";

    if (num >= 1000) {
        return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
    }

    if (num >= 1) {
        return num.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
        });
    }

    return num.toLocaleString("en-US", {
        maximumFractionDigits: 8,
    });
}

function formatPercent(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return "--";
    return `${num > 0 ? "+" : ""}${num.toFixed(2)}%`;
}

function EmptyState() {
    return (
        <div className={`${ui.card} p-6 sm:p-8`}>
            <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-950/60 px-6 text-center">
                <div>
                    <h3 className="text-lg font-semibold text-blue-600">Watchlist</h3>
                    <p className="mt-2 text-slate-300">No crypto currency add to watch list</p>
                    <p className="mt-1 text-sm text-slate-400">
                        Add items to localStorage key: <span className="font-medium">watchlist</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

function MarketPanel({
    watchlist,
    selectedSymbol,
    setSelectedSymbol,
    interval,
    setInterval,
}) {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const candleSeriesRef = useRef(null);
    const volumeSeriesRef = useRef(null);

    const [chartReady, setChartReady] = useState(false);
    const [loading, setLoading] = useState(true);
    const [ticker, setTicker] = useState({
        lastPrice: null,
        change24h: null,
    });
    const [error, setError] = useState("");

    const selectedCoin = useMemo(
        () => watchlist.find((item) => item.symbol === selectedSymbol),
        [watchlist, selectedSymbol]
    );

    useEffect(() => {
        const container = chartContainerRef.current;
        if (!container) return;

        const chart = createChart(container, {
            width: container.clientWidth,
            height: container.clientHeight,
            layout: {
                background: { type: ColorType.Solid, color: "transparent" },
                textColor: "#94a3b8",
                fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            },
            grid: {
                vertLines: { color: "rgba(51, 65, 85, 0.35)" },
                horzLines: { color: "rgba(51, 65, 85, 0.35)" },
            },
            rightPriceScale: {
                borderColor: "rgba(51, 65, 85, 0.8)",
            },
            timeScale: {
                borderColor: "rgba(51, 65, 85, 0.8)",
                timeVisible: true,
                secondsVisible: false,
            },
            crosshair: {
                vertLine: {
                    color: "#475569",
                    labelBackgroundColor: "#0f172a",
                },
                horzLine: {
                    color: "#475569",
                    labelBackgroundColor: "#0f172a",
                },
            },
        });

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: "#10b981",
            downColor: "#ef4444",
            wickUpColor: "#10b981",
            wickDownColor: "#ef4444",
            borderVisible: false,
            priceLineVisible: false,
        });

        const volumeSeries = chart.addSeries(HistogramSeries, {
            priceFormat: {
                type: "volume",
            },
            priceScaleId: "volume",
            lastValueVisible: false,
            priceLineVisible: false,
        });

        chart.priceScale("right").applyOptions({
            scaleMargins: {
                top: 0.08,
                bottom: 0.25,
            },
        });

        chart.priceScale("volume").applyOptions({
            scaleMargins: {
                top: 0.78,
                bottom: 0,
            },
            visible: false,
        });

        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;
        volumeSeriesRef.current = volumeSeries;
        setChartReady(true);

        const resizeChart = () => {
            if (!chartContainerRef.current || !chartRef.current) return;
            chartRef.current.applyOptions({
                width: chartContainerRef.current.clientWidth,
                height: chartContainerRef.current.clientHeight,
            });
        };

        let resizeObserver;

        if (typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(resizeChart);
            resizeObserver.observe(container);
        } else {
            window.addEventListener("resize", resizeChart);
        }

        return () => {
            setChartReady(false);

            if (resizeObserver) {
                resizeObserver.disconnect();
            } else {
                window.removeEventListener("resize", resizeChart);
            }

            chart.remove();
            chartRef.current = null;
            candleSeriesRef.current = null;
            volumeSeriesRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!chartReady || !selectedSymbol) return;

        let isActive = true;
        let ws;

        const loadMarketData = async () => {
            setLoading(true);
            setError("");

            try {
                const [tickerRes, klinesRes] = await Promise.all([
                    fetch(`${BINANCE_REST}/api/v3/ticker/24hr?symbol=${selectedSymbol}`),
                    fetch(
                        `${BINANCE_REST}/api/v3/klines?symbol=${selectedSymbol}&interval=${interval}&limit=300`
                    ),
                ]);

                if (!tickerRes.ok || !klinesRes.ok) {
                    throw new Error("Failed to load market data from Binance.");
                }

                const tickerData = await tickerRes.json();
                const klinesData = await klinesRes.json();

                if (!isActive) return;

                setTicker({
                    lastPrice: tickerData.lastPrice,
                    change24h: tickerData.priceChangePercent,
                });

                const candles = klinesData.map((item) => ({
                    time: item[0] / 1000,
                    open: Number(item[1]),
                    high: Number(item[2]),
                    low: Number(item[3]),
                    close: Number(item[4]),
                }));

                const volumes = klinesData.map((item) => ({
                    time: item[0] / 1000,
                    value: Number(item[5]),
                    color:
                        Number(item[4]) >= Number(item[1])
                            ? "rgba(16, 185, 129, 0.45)"
                            : "rgba(239, 68, 68, 0.45)",
                }));

                candleSeriesRef.current?.setData(candles);
                volumeSeriesRef.current?.setData(volumes);
                chartRef.current?.timeScale().fitContent();

                const streamSymbol = selectedSymbol.toLowerCase();
                ws = new WebSocket(
                    `wss://stream.binance.com:9443/stream?streams=${streamSymbol}@ticker/${streamSymbol}@kline_${interval}`
                );

                ws.onmessage = (event) => {
                    if (!isActive) return;

                    const payload = JSON.parse(event.data);
                    const data = payload?.data;

                    if (payload?.stream?.endsWith("@ticker")) {
                        setTicker({
                            lastPrice: data.c,
                            change24h: data.P,
                        });
                        return;
                    }

                    if (data?.k) {
                        const k = data.k;

                        candleSeriesRef.current?.update({
                            time: k.t / 1000,
                            open: Number(k.o),
                            high: Number(k.h),
                            low: Number(k.l),
                            close: Number(k.c),
                        });

                        volumeSeriesRef.current?.update({
                            time: k.t / 1000,
                            value: Number(k.v),
                            color:
                                Number(k.c) >= Number(k.o)
                                    ? "rgba(16, 185, 129, 0.45)"
                                    : "rgba(239, 68, 68, 0.45)",
                        });
                    }
                };

                ws.onerror = () => {
                    if (!isActive) return;
                    setError("Live socket connection issue. Showing latest loaded data.");
                };
            } catch (err) {
                if (!isActive) return;

                setError(err.message || "Unable to load market data.");
                setTicker({
                    lastPrice: null,
                    change24h: null,
                });

                candleSeriesRef.current?.setData([]);
                volumeSeriesRef.current?.setData([]);
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        loadMarketData();

        return () => {
            isActive = false;
            if (ws) ws.close();
        };
    }, [chartReady, selectedSymbol, interval]);

    return (
        <div className={`${ui.card} p-4 sm:p-6 my-5`}>
            <div className="mb-6 flex flex-col gap-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                            Crypto currency
                        </label>
                        <div className={ui.inputWrap}>
                            <select
                                value={selectedSymbol}
                                onChange={(e) => setSelectedSymbol(e.target.value)}
                                className={ui.input}
                            >
                                {watchlist.map((item) => (
                                    <option key={item.symbol} value={item.symbol}>
                                        {item.baseSymbol} ({item.symbol})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                    {INTERVALS.map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setInterval(item)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${interval === item ? ui.activeButton : ui.inactiveButton
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative h-[360px] overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-950/60 sm:h-[430px] lg:h-[520px]">
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
                        <div className="flex items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-900/80 px-4 py-3 text-slate-300 shadow-md">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-blue-500" />
                            Loading market data...
                        </div>
                    </div>
                )}

                <div ref={chartContainerRef} className="h-full w-full" />
            </div>
        </div>
    );
}

export default function Chart() {
    const [watchlist, setWatchlist] = useState([]);
    const [selectedSymbol, setSelectedSymbol] = useState("");
    const [interval, setIntervalValue] = useState("1m");

    const loadWatchlist = useCallback(() => {
        try {
            const stored = localStorage.getItem("watchlist");
            const parsed = stored ? JSON.parse(stored) : {};
            const normalized = normalizeWatchlist(parsed);
            setWatchlist(normalized);
        } catch {
            setWatchlist([]);
        }
    }, []);

    useEffect(() => {
        loadWatchlist();

        window.addEventListener("storage", loadWatchlist);
        window.addEventListener("watchlist-updated", loadWatchlist);

        return () => {
            window.removeEventListener("storage", loadWatchlist);
            window.removeEventListener("watchlist-updated", loadWatchlist);
        };
    }, [loadWatchlist]);

    useEffect(() => {
        if (!watchlist.length) {
            setSelectedSymbol("");
            return;
        }

        const exists = watchlist.some((item) => item.symbol === selectedSymbol);
        if (!exists) {
            setSelectedSymbol(watchlist[0].symbol);
        }
    }, [watchlist, selectedSymbol]);

    if (!watchlist.length) {
        return <EmptyState />;
    }

    return (
        <MarketPanel
            watchlist={watchlist}
            selectedSymbol={selectedSymbol || watchlist[0].symbol}
            setSelectedSymbol={setSelectedSymbol}
            interval={interval}
            setInterval={setIntervalValue}
        />
    );
}