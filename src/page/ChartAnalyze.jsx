import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AreaSeries, CandlestickSeries, createChart, CrosshairMode } from "lightweight-charts";
import { useParams } from "react-router";
import { createLineToolsPlugin } from 'lightweight-charts-line-tools-core';
import {
    LineToolTrendLine,
    LineToolRay,
    LineToolArrow,
    LineToolExtendedLine,
    LineToolHorizontalLine,
    LineToolHorizontalRay,
    LineToolVerticalLine,
    LineToolCrossLine,
    LineToolCallout
} from 'lightweight-charts-line-tools-lines';
import { LineToolBrush, LineToolHighlighter } from 'lightweight-charts-line-tools-freehand';
import { LineToolRectangle } from 'lightweight-charts-line-tools-rectangle';
import { LineToolCircle } from 'lightweight-charts-line-tools-circle';
import { LineToolTriangle } from 'lightweight-charts-line-tools-triangle';
import { LineToolPath } from 'lightweight-charts-line-tools-path';
import { LineToolParallelChannel } from 'lightweight-charts-line-tools-parallel-channel';
import { LineToolFibRetracement } from 'lightweight-charts-line-tools-fib-retracement';
import { LineToolPriceRange } from 'lightweight-charts-line-tools-price-range';
import { LineToolLongShortPosition } from 'lightweight-charts-line-tools-long-short-position';
import { LineToolText } from 'lightweight-charts-line-tools-text';
import { LineToolMarketDepth } from 'lightweight-charts-line-tools-market-depth';
import { drawingTools, handleDownloadChartImage } from "../assets/assets";
import { BiDownload } from "react-icons/bi";
import socket from "../libs/socket"
import chartHandler from "../libs/ChartDataHandler"
import { INTERVALS } from "../data/constants";
import SegButton from "../components/ChartAnalayze/SegButton";
import { cn } from "../utils/concators";
import { useTranslation } from "react-i18next";

const BINANCE_REST = "https://api.binance.com";
const BINANCE_WS = "wss://stream.binance.com:9443/ws";

function num(n, digits = 2) {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
    const v = Number(n);
    return v.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function mapKlinesToCandles(klines) {
    return klines.map((k) => ({
        time: Math.floor(k[0] / 1000),
        open: Number(k[1]),
        high: Number(k[2]),
        low: Number(k[3]),
        close: Number(k[4]),
    }));
}

function mapCandlesToArea(candles) {
    return candles.map((c) => ({ time: c.time, value: c.close }));
}

export default function ChartAnalyze() {
    const { i18n, t } = useTranslation();
    const { coinId } = useParams();

    const [interval, setInterval] = useState("1m");
    const [chartType, setChartType] = useState("candles"); // 'candles' | 'area'
    const [activeTool, setActiveTool] = useState("");
    const [ticker, setTicker] = useState({ last: null, changePct: null });

    const containerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const resizeObsRef = useRef(null);

    const wsRef = useRef(null);
    const lastBarRef = useRef(null);
    const toolsRef = useRef(null);

    const priceText = useMemo(() => {
        if (ticker.last == null) return "—";
        return `$${num(ticker.last, 2)}`;
    }, [ticker.last]);
    const changeText = useMemo(() => {
        if (ticker.changePct == null) return null;
        const v = ticker.changePct;
        const cls = v >= 0 ? "text-emerald-400" : "text-red-400";
        const sign = v >= 0 ? "+" : "";
        return <span className={cn("text-sm font-semibold", cls)}>{`${sign}${num(v, 2)}%`}</span>;
    }, [ticker.changePct]);

    const handleToolChange = useCallback(async () => {
        if (!toolsRef.current) { return }

        if (activeTool === "Eraser") {
            setActiveTool("Cursor");
            toolsRef.current.removeAllLineTools();
            registerDrawingTools();
            return;
        }

        if (activeTool === "Cursor") {
            return;
        }

        toolsRef.current.addLineTool(activeTool);
    }, [activeTool])

    async function fetchTicker24h() {
        try {
            const res = await fetch(`${BINANCE_REST}/api/v3/ticker/24hr?symbol=${coinId}`);
            if (!res.ok) return;
            const data = await res.json();
            setTicker({
                last: Number(data.lastPrice),
                changePct: Number(data.priceChangePercent),
            });
        } catch {
            // ignore
        }
    }

    async function fetchKlines(intv) {
        const url = `${BINANCE_REST}/api/v3/klines?symbol=${coinId}&interval=${intv}&limit=1000`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch klines");
        const klines = await res.json();
        const candles = mapKlinesToCandles(klines);
        return candles;
    }

    function ensureChart() {
        if (!containerRef.current) return;

        if (!chartRef.current) {
            const chart = createChart(containerRef.current, {
                layout: {
                    background: { color: "transparent" },
                    textColor: "#cbd5e1",
                    fontFamily:
                        'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
                },
                grid: {
                    vertLines: { color: "rgba(148,163,184,0.08)" },
                    horzLines: { color: "rgba(148,163,184,0.08)" },
                },
                rightPriceScale: {
                    borderColor: "rgba(148,163,184,0.18)",
                },
                timeScale: {
                    borderColor: "rgba(148,163,184,0.18)",
                    timeVisible: true,
                    secondsVisible: interval === "1m",
                },
                crosshair: { mode: CrosshairMode.Normal },
                localization: { locale: "en-US" },
            });

            chartRef.current = chart;

            // ResizeObserver for responsive chart sizing
            if (typeof ResizeObserver !== "undefined") {
                resizeObsRef.current = new ResizeObserver(() => {
                    if (!containerRef.current || !chartRef.current) return;
                    chartRef.current.applyOptions({
                        width: containerRef.current.clientWidth,
                        height: containerRef.current.clientHeight,
                    });
                });
                resizeObsRef.current.observe(containerRef.current);
            }
        }

        // ensure series exists for current type
        ensureSeries(chartType);
    }


    function registerDrawingTools() {
        if (!chartRef.current || !seriesRef.current)
            return;

        const lineTools = createLineToolsPlugin(chartRef.current, seriesRef.current);

        lineTools.registerLineTool('TrendLine', LineToolTrendLine);
        lineTools.registerLineTool('Ray', LineToolRay);
        lineTools.registerLineTool('Arrow', LineToolArrow);
        lineTools.registerLineTool('ExtendedLine', LineToolExtendedLine);
        lineTools.registerLineTool('HorizontalLine', LineToolHorizontalLine);
        lineTools.registerLineTool('HorizontalRay', LineToolHorizontalRay);
        lineTools.registerLineTool('VerticalLine', LineToolVerticalLine);
        lineTools.registerLineTool('CrossLine', LineToolCrossLine);
        lineTools.registerLineTool('Callout', LineToolCallout);
        lineTools.registerLineTool('Brush', LineToolBrush);
        lineTools.registerLineTool('Highlighter', LineToolHighlighter);
        lineTools.registerLineTool('Rectangle', LineToolRectangle);
        lineTools.registerLineTool('Circle', LineToolCircle);
        lineTools.registerLineTool('Triangle', LineToolTriangle);
        lineTools.registerLineTool('Path', LineToolPath);
        lineTools.registerLineTool('ParallelChannel', LineToolParallelChannel);
        lineTools.registerLineTool('FibRetracement', LineToolFibRetracement);
        lineTools.registerLineTool('PriceRange', LineToolPriceRange);
        lineTools.registerLineTool('LongShortPosition', LineToolLongShortPosition);
        lineTools.registerLineTool('MarketDepth', LineToolMarketDepth);
        lineTools.registerLineTool('Text', LineToolText);

        toolsRef.current = lineTools;
    }

    function ensureSeries(type) {
        const chart = chartRef.current;
        if (!chart) return;

        if (seriesRef.current) {
            chart.removeSeries(seriesRef.current);
            seriesRef.current = null;
        }

        let series = null;

        if (type === "candles") {
            series = chart.addSeries(CandlestickSeries, {
                upColor: "#22c55e",
                downColor: "#ef4444",
                wickUpColor: "#22c55e",
                wickDownColor: "#ef4444",
                borderUpColor: "#22c55e",
                borderDownColor: "#ef4444",
            });
        } else {
            series = chart.addSeries(AreaSeries, {
                lineColor: "rgba(37,99,235,1)",
                topColor: "rgba(37,99,235,0.35)",
                bottomColor: "rgba(37,99,235,0.02)",
                lineWidth: 2,
            });
        }

        seriesRef.current = series;

        registerDrawingTools();

    }

    function updateSeriesWithHistorical(candles) {
        const series = seriesRef.current;
        const chart = chartRef.current;
        if (!series || !chart) return;

        if (chartType === "candles") series.setData(candles);
        else series.setData(mapCandlesToArea(candles));

        lastBarRef.current = candles[candles.length - 1] || null;
        chart.timeScale().fitContent();
    }

    function startWs(intv) {
        stopWs();

        const stream = `${coinId.toLowerCase()}@kline_${intv}`;
        const ws = new WebSocket(`${BINANCE_WS}/${stream}`);
        wsRef.current = ws;

        ws.onmessage = (evt) => {
            try {
                const msg = JSON.parse(evt.data);
                const k = msg.k;
                if (!k) return;

                const bar = {
                    time: Math.floor(k.t / 1000),
                    open: Number(k.o),
                    high: Number(k.h),
                    low: Number(k.l),
                    close: Number(k.c),
                };

                // keep a quick ticker snapshot too
                setTicker((prev) => ({ ...prev, last: bar.close }));

                const series = seriesRef.current;
                if (!series) return;

                if (chartType === "candles") {
                    series.update(bar);
                } else {
                    series.update({ time: bar.time, value: bar.close });
                }

                lastBarRef.current = bar;
            } catch {
                // ignore malformed
            }
        };

        ws.onerror = () => {
            // ignore
        };
    }

    function stopWs() {
        if (wsRef.current) {
            try {
                wsRef.current.close();
            } catch {
                // ignore
            }
            wsRef.current = null;
        }
    }

    useEffect(() => {
        let alive = true;

        handleToolChange(alive);

        return () => {
            alive = false;
        }
    }, [activeTool, handleToolChange])

    const onConnect = () => {
        console.log("Connected");
    }

    const onData = (data) => {
        console.log(data);
    }

    const onDisconnect = () => {
        console.log("disconnected")
    }

    useEffect(() => {
        socket.on("connect", onConnect);
        socket.on("cryptoData", onData);
        socket.on("disconnect", onDisconnect);
        chartHandler.setInterval(interval);
        chartHandler.setSymbol(coinId);
        chartHandler.getChartData().then((res) => {
            console.log(res?.candles);
        });
        return () => {
            socket.off("connect", onConnect);
            socket.off("cryptoData", onData);
            socket.off("disconnect", onDisconnect);
        }
    }, [])

    // Init chart once
    useEffect(() => {
        ensureChart();
        fetchTicker24h();

        return () => {
            stopWs();

            if (resizeObsRef.current && containerRef.current) {
                try {
                    resizeObsRef.current.unobserve(containerRef.current);
                } catch {
                    // ignore
                }
            }
            resizeObsRef.current = null;

            if (chartRef.current) {
                try {
                    chartRef.current.remove();
                } catch {
                    // ignore
                }
                chartRef.current = null;
            }
            seriesRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // When interval changes: fetch historical + ws + indicators
    useEffect(() => {
        let alive = true;

        setActiveTool("Cursor");

        (async () => {
            try {
                ensureChart();

                if (chartRef.current) {
                    chartRef.current.applyOptions({
                        timeScale: { secondsVisible: interval === "1m", timeVisible: true },
                    });
                }

                const candles = await fetchKlines(interval);
                if (!alive) return;

                updateSeriesWithHistorical(candles);
                startWs(interval);

            } catch {
                // ignore
            }
        })();

        return () => {
            alive = false;
            stopWs();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interval]);

    // When chart type changes: recreate series + re-set historical data (from last fetched via REST again)
    useEffect(() => {
        let alive = true;

        setActiveTool("Cursor");

        (async () => {
            try {
                ensureChart();
                ensureSeries(chartType);

                const candles = await fetchKlines(interval);
                if (!alive) return;

                updateSeriesWithHistorical(candles);

                // Restart WS so updates match current chart type
                startWs(interval);
            } catch {
                // ignore
            }
        })();

        return () => {
            alive = false;
            stopWs();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chartType]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">

                {/* Main layout: responsive toolbar + chart */}
                <div className="mt-4 grid grid-cols-1 gap-3">

                    {/* Controls + Chart */}
                    <div className="flex flex-col gap-3">
                        {/* Intervals + chart type */}
                        <div
                            className={cn(
                                "rounded-2xl border border-slate-700/50 bg-slate-900/70 shadow-md backdrop-blur-xl",
                                "p-3 sm:p-4"
                            )}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className={`flex flex-wrap ${i18n.language === "ar" ? "flex-row-reverse" : ""} gap-2`}>
                                    {INTERVALS.map((i) => (
                                        <SegButton key={i} active={interval === i} onClick={() => setInterval(i)}>
                                            {i}
                                        </SegButton>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <SegButton active={chartType === "candles"} onClick={() => setChartType("candles")}>
                                        Candles
                                    </SegButton>
                                    <SegButton active={chartType === "area"} onClick={() => setChartType("area")}>
                                        Area
                                    </SegButton>
                                </div>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div
                            className={cn(
                                "rounded-2xl border border-slate-700/50 bg-slate-900/70 shadow-md backdrop-blur-xl",
                                "p-2"
                            )}
                        >
                            {/* Small screens: horizontal scroll. Large: vertical column */}
                            <div className="flex items-center gap-2 overflow-x-auto lg:overflow-y-auto">
                                {
                                    drawingTools.map(tool => (
                                        <button className={`p-2 rounded-lg ${tool.name === activeTool ? "bg-blue-600 text-white font-semibold" : "text-slate-200 bg-slate-600"}`} aria-label={tool.description} title={tool.name + " : " + tool.description} key={tool.name} onClick={() => setActiveTool(tool.name)} >
                                            <tool.icon className="w-4 h-4" />
                                        </button>
                                    ))
                                }
                                <button className={`p-2 rounded-lg bg-slate-600 text-slate-200 cursor-pointer active:bg-blue-600 `} aria-label="Download as Image" title={"Download" + " : " + "Download the chart as image"} key={"Download"} onClick={() => handleDownloadChartImage(containerRef)} >
                                    <BiDownload className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Chart */}
                        <div
                            className={cn(
                                "rounded-2xl border border-slate-700/50 bg-slate-900/70 shadow-md backdrop-blur-xl",
                                "p-2 sm:p-3"
                            )}
                        >
                            <div className="px-2 pb-2 flex items-center justify-between">
                                <div className="text-slate-300 text-sm">
                                    {coinId} <span className="text-slate-500">•</span>{" "}
                                    <span className="text-slate-400">{chartType === "candles" ? "Candlestick" : "Area"}</span>
                                </div>
                                <button
                                    type="button"
                                    className={cn(
                                        "text-white text-sm font-medium px-3 py-2 rounded-lg",
                                        "bg-blue-600 hover:bg-blue-700 transition"
                                    )}
                                    onClick={() => {
                                        fetchTicker24h();
                                    }}
                                >
                                    Refresh
                                </button>
                            </div>

                            <div
                                ref={containerRef}
                                className={cn(
                                    "w-full",
                                    "h-[420px] sm:h-[520px] lg:h-[640px]",
                                    "rounded-xl overflow-hidden",
                                    "bg-slate-950/60 border border-slate-700/50"
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}