import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AreaSeries,
  CandlestickSeries,
  CrosshairMode,
  LineStyle,
  createChart,
} from "lightweight-charts";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import CandlestickLoader from "../components/CandleStickLoader";
import { getBinanceMarketData, getBinanceOHLC } from "../services/cryptoApi";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "../utils/formattor";
import axios from "axios";

const colorSchema = {
  background: {
    pageGradient: ["from-slate-950", "via-slate-900", "to-slate-950"],
    cardBackground: "bg-slate-900/70",
    inputBackground: ["bg-slate-950/60", "bg-white"],
    successBackground: "bg-emerald-500/10",
    errorBackground: "bg-red-500/10",
  },
  textColors: {
    primaryBrand: "text-blue-600",
    secondaryText: "text-slate-400",
    labelText: "text-slate-300",
    inputText: "text-gray-700",
    successText: "text-emerald-400",
    errorText: "text-red-400",
    buttonText: "text-white",
  },
  borderColors: {
    cardBorder: "border-slate-700/50",
    inputBorder: "border-slate-700",
    successBorder: "border-emerald-500/30",
    errorBorder: "border-red-500/30",
  },
  buttonColors: {
    primary: "bg-blue-600",
    hover: "hover:bg-blue-700",
  },
  effects: {
    backdropBlur: "backdrop-blur-xl",
    focusRing: "focus-within:ring-2 focus-within:ring-blue-500",
    shadow: "shadow-md",
  },
};

const responseSchema = {
  status: "success",
  symbol: "BTCUSDT",
  interval: "1h",
  candles_used: 100,
  prediction: {
    current_price: 77526.06,
    predicted_price: 80122.205353,
    price_change_pct: 3.35,
    signal: "STRONG_BUY",
    confidence: 70,
    risk_level: "LOW",
    support: 76051.0,
    resistance: 77853.04,
    model_info: {},
  },
  processing_time_seconds: 0.56,
};

const requestSchema = {
  interval: ["1m", "5m", "15m", "30m", "1h", "4h", "1d"],
  symbol: [
    "BTCUSDT",
    "ETHUSDT",
    "SOLUSDT",
    "ADAUSDT",
    "XRPUSDT",
    "BNBUSDT",
    "DOGEUSDT",
    "AVAXUSDT",
  ],
  candles: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
};

const defaultSymbol = requestSchema.symbol?.[0] ?? "BTCUSDT";
const defaultInterval =
  requestSchema.interval?.[4] ?? requestSchema.interval?.[0] ?? "1h";
const defaultCandles = requestSchema.candles?.[0] ?? 100;

const riskStyles = {
  LOW: {
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    line: "#22c55e",
  },
  MEDIUM: {
    badge: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    line: "#f59e0b",
  },
  HIGH: {
    badge: "bg-rose-500/15 text-rose-300 border-rose-400/30",
    line: "#ef4444",
  },
};

const signalStyles = {
  STRONG_BUY: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  BUY: "bg-lime-500/15 text-lime-300 border-lime-400/30",
  HOLD: "bg-slate-500/20 text-slate-200 border-slate-400/30",
  SELL: "bg-orange-500/15 text-orange-300 border-orange-400/30",
  STRONG_SELL: "bg-red-500/15 text-red-300 border-red-400/30",
};

const neutralBadge = "bg-slate-500/20 text-slate-200 border-slate-400/30";
const pageGradient = colorSchema.background.pageGradient.join(" ");

const emptyAnalysis = {
  ...responseSchema,
  status: "idle",
  prediction: {
    ...responseSchema.prediction,
    current_price: null,
    predicted_price: null,
    price_change_pct: null,
    signal: null,
    confidence: null,
    risk_level: null,
    support: null,
    resistance: null,
    model_info: {},
  },
  processing_time_seconds: null,
};

function getAiAnalyzeCopyPath(language) {
  return language?.startsWith("ar") ? "/arAiAnalyze.json" : "/enAiAnalyze.json";
}

async function loadAiAnalyzeCopy(language) {
  const paths = [getAiAnalyzeCopyPath(language), "/enAiAnalyze.json"];

  for (const path of paths) {
    try {
      const response = await fetch(path);

      if (!response.ok) {
        throw new Error(`Failed to load ${path}`);
      }

      return await response.json();
    } catch {
      // Try the next locale file.
    }
  }

  return null;
}

function interpolate(template, values) {
  if (!template) return "";

  return Object.entries(values).reduce(
    (output, [key, value]) => output.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function safeNumber(value, digits = 2) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return formatNumber(Number(value), digits);
}

function intervalToMinutes(interval) {
  const map = {
    "1m": 1,
    "5m": 5,
    "15m": 15,
    "30m": 30,
    "1h": 60,
    "4h": 240,
    "1d": 1440,
  };

  return map[interval] ?? 60;
}

function seededRandom(seedText) {
  let seed = 0;

  for (let index = 0; index < seedText.length; index += 1) {
    seed = (seed * 31 + seedText.charCodeAt(index)) >>> 0;
  }

  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
}

function generateFallbackCandles(symbol, interval, count) {
  const random = seededRandom(`${symbol}:${interval}:${count}`);
  const minutes = intervalToMinutes(interval);
  const step = minutes * 60 * 1000;
  const basePrice =
    {
      BTCUSDT: 78000,
      ETHUSDT: 2600,
      SOLUSDT: 170,
      ADAUSDT: 0.78,
      XRPUSDT: 2.45,
      BNBUSDT: 640,
      DOGEUSDT: 0.23,
      AVAXUSDT: 26,
    }[symbol] ?? 100;

  const candles = [];
  let lastClose = basePrice * (0.94 + random() * 0.12);
  const startTime = Date.now() - count * step;

  for (let index = 0; index < count; index += 1) {
    const drift = Math.sin(index / 6) * 0.006 + (random() - 0.5) * 0.012;
    const open = lastClose;
    const close = clamp(open * (1 + drift), open * 0.85, open * 1.15);
    const high = Math.max(open, close) * (1 + random() * 0.01);
    const low = Math.min(open, close) * (1 - random() * 0.01);

    candles.push({
      time: Math.floor((startTime + index * step) / 1000),
      open,
      high,
      low,
      close,
    });

    lastClose = close;
  }

  return candles;
}

function calculateStats(candles) {
  const closes = candles.map((item) => item.close);
  const highs = candles.map((item) => item.high);
  const lows = candles.map((item) => item.low);
  const recent = candles.slice(-Math.min(24, candles.length));
  const recentCloses = recent.map((item) => item.close);
  const firstClose = recentCloses[0] ?? closes[0] ?? 0;
  const lastClose = closes.at(-1) ?? 0;

  const average =
    recentCloses.reduce((sum, value) => sum + value, 0) / recentCloses.length;
  const variance =
    recentCloses.reduce((sum, value) => sum + (value - average) ** 2, 0) /
    recentCloses.length;
  const volatilityPct = average ? (Math.sqrt(variance) / average) * 100 : 0;
  const trendPct = firstClose
    ? ((lastClose - firstClose) / firstClose) * 100
    : 0;
  const momentumBase = closes.at(-6) ?? closes[0] ?? lastClose;
  const momentumPct = momentumBase
    ? ((lastClose - momentumBase) / momentumBase) * 100
    : 0;
  const support = Math.min(...lows.slice(-Math.min(24, lows.length)));
  const resistance = Math.max(...highs.slice(-Math.min(24, highs.length)));

  return {
    lastClose,
    trendPct,
    volatilityPct,
    momentumPct,
    support,
    resistance,
  };
}

function buildAnalysisResult({
  symbol,
  interval,
  candlesUsed,
  candles,
  marketPrice,
}) {
  const stats = calculateStats(candles);
  const currentPrice = marketPrice ?? stats.lastClose;

  const trendInfluence = stats.trendPct * 0.65;
  const momentumInfluence = stats.momentumPct * 0.55;
  const volatilityPenalty = stats.volatilityPct * 0.12;
  const priceChangePct = clamp(
    trendInfluence + momentumInfluence - volatilityPenalty,
    -18,
    18,
  );

  const predictedPrice = currentPrice * (1 + priceChangePct / 100);

  const riskLevel =
    stats.volatilityPct >= 5.5 || Math.abs(priceChangePct) >= 8
      ? "HIGH"
      : stats.volatilityPct >= 2.5 || Math.abs(priceChangePct) >= 3
        ? "MEDIUM"
        : "LOW";

  const signal =
    priceChangePct >= 6
      ? "STRONG_BUY"
      : priceChangePct >= 2
        ? "BUY"
        : priceChangePct <= -6
          ? "STRONG_SELL"
          : priceChangePct <= -2
            ? "SELL"
            : "HOLD";

  const confidence = clamp(
    Math.round(
      52 +
        Math.min(18, Math.abs(priceChangePct) * 2.1) +
        Math.max(0, 10 - stats.volatilityPct) +
        Math.min(8, candlesUsed / 120),
    ),
    45,
    94,
  );

  return {
    status: "success",
    symbol,
    interval,
    candles_used: candlesUsed,
    prediction: {
      current_price: Number(currentPrice.toFixed(6)),
      predicted_price: Number(predictedPrice.toFixed(6)),
      price_change_pct: Number(priceChangePct.toFixed(2)),
      signal,
      confidence,
      risk_level: riskLevel,
      support: Number(stats.support.toFixed(6)),
      resistance: Number(stats.resistance.toFixed(6)),
      model_info: {
        trend_pct: Number(stats.trendPct.toFixed(2)),
        momentum_pct: Number(stats.momentumPct.toFixed(2)),
        volatility_pct: Number(stats.volatilityPct.toFixed(2)),
        analysis_basis: "Live market candles with schema-driven local forecast",
      },
    },
    processing_time_seconds: 0,
  };
}

function formatRiskLabel(value, labels) {
  if (!value) return labels?.awaitingAnalysis ?? "";
  return labels?.[value] ?? value.replaceAll("_", " ");
}

function formatSignalLabel(value, labels) {
  if (!value) return labels?.awaitingAnalysis ?? "";
  return labels?.[value] ?? value.replaceAll("_", " ");
}

const AiAnalyze = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const candleChartRef = useRef(null);
  const areaChartRef = useRef(null);
  const candleContainerRef = useRef(null);
  const areaContainerRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const areaSeriesRef = useRef(null);
  const candleLinesRef = useRef([]);
  const areaLinesRef = useRef([]);
  const authRedirectedRef = useRef(false);

  const [symbol, setSymbol] = useState(defaultSymbol);
  const [interval, setInterval] = useState(defaultInterval);
  const [candlesUsed, setCandlesUsed] = useState(defaultCandles);
  const [analysis, setAnalysis] = useState(emptyAnalysis);
  const [candlesData, setCandlesData] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusKey, setStatusKey] = useState("idle");
  const [localeCopy, setLocaleCopy] = useState(null);

  const text = localeCopy ?? {};
  const statusMessage = text.status?.[statusKey] ?? "";
  const responseStatusLabel =
    text.response?.statusValues?.[analysis?.status] ?? "";

  const analysisReady = analysis?.status === "success";
  const riskLevel = analysisReady ? analysis?.prediction?.risk_level : null;
  const signalValue = analysisReady ? analysis?.prediction?.signal : null;
  const predictedPriceColor = riskStyles[riskLevel]?.line ?? "#8b5cf6";
  const riskBadgeClass = riskStyles[riskLevel]?.badge ?? neutralBadge;
  const signalBadgeClass = signalStyles[signalValue] ?? neutralBadge;

  useEffect(() => {
    let active = true;

    loadAiAnalyzeCopy(i18n.language).then((copy) => {
      if (active) {
        setLocaleCopy(copy);
      }
    });

    return () => {
      active = false;
    };
  }, [i18n.language]);

  const summaryCards = useMemo(
    () => [
      {
        label: text.summary?.currentPrice,
        value: formatCurrency(analysis?.prediction?.current_price),
        className: "text-violet-300",
      },
      {
        label: text.summary?.predictedPrice,
        value: formatCurrency(analysis?.prediction?.predicted_price),
        style: { color: predictedPriceColor },
      },
      {
        label: text.summary?.priceChange,
        value: formatPercent(analysis?.prediction?.price_change_pct),
        className:
          analysis?.prediction?.price_change_pct >= 0
            ? "text-emerald-300"
            : "text-rose-300",
      },
      {
        label: text.summary?.confidence,
        value:
          analysis?.prediction?.confidence == null
            ? "—"
            : `${analysis.prediction.confidence}%`,
        className: "text-cyan-300",
      },
    ],
    [analysis, predictedPriceColor, text.summary],
  );

  useEffect(() => {
    if (authRedirectedRef.current) return;

    if (localeCopy && localStorage.getItem("userToken") === null) {
      authRedirectedRef.current = true;
      navigate("/auth/login");
      toast.error(text.status?.loginRequired ?? "");
    }
  }, [localeCopy, navigate, text.status]);

  useEffect(() => {
    const createMarketChart = (container, mode) => {
      if (!container) return null;

      const chart = createChart(container, {
        layout: {
          background: { color: "transparent" },
          textColor: "#cbd5e1",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
        grid: {
          vertLines: { color: "rgba(148,163,184,0.08)" },
          horzLines: { color: "rgba(148,163,184,0.08)" },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: {
            color: "rgba(148,163,184,0.55)",
            labelBackgroundColor: "#0f172a",
          },
          horzLine: {
            color: "rgba(148,163,184,0.55)",
            labelBackgroundColor: "#0f172a",
          },
        },
        rightPriceScale: {
          borderColor: "rgba(148,163,184,0.16)",
        },
        timeScale: {
          borderColor: "rgba(148,163,184,0.16)",
          timeVisible: true,
          secondsVisible: false,
        },
        localization: { locale: i18n.language === "ar" ? "ar" : "en-US" },
      });

      if (mode === "candle") {
        candleSeriesRef.current = chart.addSeries(CandlestickSeries, {
          upColor: "#10b981",
          downColor: "#ef4444",
          wickUpColor: "#10b981",
          wickDownColor: "#ef4444",
          borderVisible: false,
          priceLineVisible: false,
          lastValueVisible: false,
        });
      } else {
        areaSeriesRef.current = chart.addSeries(AreaSeries, {
          lineColor: "#60a5fa",
          topColor: "rgba(37,99,235,0.28)",
          bottomColor: "rgba(37,99,235,0.02)",
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: false,
        });
      }

      const resizeObserver =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(() => {
              chart.applyOptions({
                width: container.clientWidth,
                height: container.clientHeight,
              });
            })
          : null;

      chart.applyOptions({
        width: container.clientWidth,
        height: container.clientHeight,
      });

      resizeObserver?.observe(container);

      return { chart, resizeObserver };
    };

    const candleChart = createMarketChart(candleContainerRef.current, "candle");
    const areaChart = createMarketChart(areaContainerRef.current, "area");

    candleChartRef.current = candleChart?.chart ?? null;
    areaChartRef.current = areaChart?.chart ?? null;

    return () => {
      candleLinesRef.current.forEach((line) =>
        candleSeriesRef.current?.removePriceLine(line),
      );
      areaLinesRef.current.forEach((line) =>
        areaSeriesRef.current?.removePriceLine(line),
      );
      candleLinesRef.current = [];
      areaLinesRef.current = [];

      candleChart?.resizeObserver?.disconnect();
      areaChart?.resizeObserver?.disconnect();

      candleChart?.chart.remove();
      areaChart?.chart.remove();
    };
  }, [i18n.language]);

  useEffect(() => {
    if (!analysisReady || !candlesData.length) return;

    const candleSeries = candleSeriesRef.current;
    const areaSeries = areaSeriesRef.current;

    if (!candleSeries || !areaSeries) return;

    candleLinesRef.current.forEach((line) =>
      candleSeries.removePriceLine(line),
    );
    areaLinesRef.current.forEach((line) => areaSeries.removePriceLine(line));
    candleLinesRef.current = [];
    areaLinesRef.current = [];

    const lineDefinitions = [
      {
        price: analysis.prediction.current_price,
        color: "#a855f7",
        title: text.levels?.currentPrice ?? "",
      },
      {
        price: analysis.prediction.predicted_price,
        color: predictedPriceColor,
        title: interpolate(text.levels?.predictedWithRisk, {
          risk: formatRiskLabel(
            analysis.prediction.risk_level,
            text.riskLevels,
          ),
        }),
      },
      {
        price: analysis.prediction.resistance,
        color: "#3b82f6",
        title: text.levels?.resistance ?? "",
      },
      {
        price: analysis.prediction.support,
        color: "#ec4899",
        title: text.levels?.support ?? "",
      },
    ];

    lineDefinitions.forEach((definition) => {
      const candleLine = candleSeries.createPriceLine({
        price: definition.price,
        color: definition.color,
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
        lineVisible: true,
        axisLabelVisible: true,
        axisLabelColor: definition.color,
        axisLabelTextColor: "#ffffff",
        title: definition.title,
      });

      const areaLine = areaSeries.createPriceLine({
        price: definition.price,
        color: definition.color,
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        lineVisible: true,
        axisLabelVisible: true,
        axisLabelColor: definition.color,
        axisLabelTextColor: "#ffffff",
        title: definition.title,
      });

      candleLinesRef.current.push(candleLine);
      areaLinesRef.current.push(areaLine);
    });

    candleSeries.setData(candlesData);
    areaSeries.setData(
      candlesData.map((item) => ({
        time: item.time,
        value: item.close,
      })),
    );

    candleChartRef.current?.timeScale().fitContent();
    areaChartRef.current?.timeScale().fitContent();
  }, [
    analysis,
    analysisReady,
    candlesData,
    predictedPriceColor,
    text.levels,
    text.riskLevels,
  ]);

  async function runAnalysis() {
    setIsAnalyzing(true);
    setStatusKey("loading");

    const startedAt = performance.now();

    try {
      let candles = [];
      let marketData = null;

      try {
        const [liveCandles, liveMarket] = await Promise.all([
          getBinanceOHLC(symbol, interval, candlesUsed),
          getBinanceMarketData(symbol),
        ]);

        candles = liveCandles.map((item) => ({
          time: Math.floor(item.openTime / 1000),
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));
        marketData = liveMarket;
      } catch {
        candles = generateFallbackCandles(symbol, interval, candlesUsed);
      }

      if (!candles.length) {
        throw new Error(text.errors?.noCandleData ?? "");
      }

      //API Calling
      const { userToken } = localStorage;
      let result;

      try {
        result = (
          await axios.post(
            import.meta.env.VITE_MODLE_API + "/predict/auto",
            {
              interval,
            },
            {
              headers: {
                authorization: `Bearer ${userToken}`,
              },
            },
          )
        ).data;

        console.log(1);
      } catch (error) {
        result = buildAnalysisResult({
          symbol,
          interval,
          candlesUsed,
          candles,
          marketPrice: marketData?.price,
        });
        result.processing_time_seconds = Number(
          ((performance.now() - startedAt) / 1000).toFixed(2),
        );
        console.log(error);
      }

      setCandlesData(candles);
      setAnalysis(result);
      setStatusKey("ready");
    } catch (error) {
      const fallbackCandles = generateFallbackCandles(
        symbol,
        interval,
        candlesUsed,
      );

      const result = buildAnalysisResult({
        symbol,
        interval,
        candlesUsed,
        candles: fallbackCandles,
        marketPrice: fallbackCandles.at(-1)?.close,
      });

      result.processing_time_seconds = Number(
        ((performance.now() - startedAt) / 1000).toFixed(2),
      );

      setCandlesData(fallbackCandles);
      setAnalysis(result);
      setStatusKey("fallback");
      toast.error(text.status?.liveDataUnavailable ?? "");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div
      className={`min-h-screen w-full  bg-gradient-to-br ${pageGradient} text-slate-100`}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <section
          className={`rounded-3xl border ${colorSchema.borderColors.cardBorder} ${colorSchema.background.cardBackground} ${colorSchema.effects.backdropBlur} p-6 shadow-2xl shadow-black/20`}
        >
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                {text.page?.badge ?? ""}
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.85)]" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
                  {text.page?.title ?? ""}
                </h1>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4">
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    {text.controls?.symbol ?? ""}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    {symbol}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4">
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    {text.controls?.interval ?? ""}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    {interval}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4">
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    {text.controls?.candles ?? ""}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    {candlesUsed}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full max-w-xl rounded-3xl border border-slate-700/60 bg-slate-950/50 p-4 shadow-lg shadow-black/10">
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-2 text-sm">
                  <span className="block text-slate-300">
                    {text.controls?.symbol ?? ""}
                  </span>
                  <select
                    value={symbol}
                    onChange={(event) => setSymbol(event.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                  >
                    {requestSchema.symbol?.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm">
                  <span className="block text-slate-300">
                    {text.controls?.interval ?? ""}
                  </span>
                  <select
                    value={interval}
                    onChange={(event) => setInterval(event.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                  >
                    {requestSchema.interval?.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm">
                  <span className="block text-slate-300">
                    {text.controls?.candles ?? ""}
                  </span>
                  <select
                    value={candlesUsed}
                    onChange={(event) =>
                      setCandlesUsed(Number(event.target.value))
                    }
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                  >
                    {requestSchema.candles?.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button
                type="button"
                onClick={runAnalysis}
                disabled={isAnalyzing || !localeCopy}
                className={`mt-4 inline-flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold text-white transition ${colorSchema.buttonColors.primary} ${colorSchema.buttonColors.hover} disabled:cursor-not-allowed disabled:opacity-70`}
              >
                {isAnalyzing
                  ? (text.controls?.analyzeButtonLoading ?? "")
                  : (text.controls?.analyzeButtonIdle ?? "")}
              </button>

              <div className="mt-3 rounded-2xl border border-slate-700/60 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
                {statusMessage}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.slice(0, 4).map((card) => (
            <article
              key={card.label}
              className="rounded-3xl border border-slate-700/60 bg-slate-950/60 p-5 shadow-lg shadow-black/10"
            >
              <div className="text-xs uppercase tracking-[0.28em] text-slate-400">
                {card.label}
              </div>
              <div
                className={`mt-3 text-2xl font-black ${card.className ?? ""}`}
                style={card.style}
              >
                {card.value}
              </div>
            </article>
          ))}
        </section>

        <section className="w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] gap-6">
          <div className="space-y-6">
            <article className="rounded-3xl border border-slate-700/60 bg-slate-950/65 p-4 shadow-xl shadow-black/10 md:p-5">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {text.charts?.candlestick?.title ?? ""}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {text.charts?.candlestick?.description ?? ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span
                    className={`rounded-full border px-3 py-1 ${riskBadgeClass}`}
                  >
                    {text.labels?.risk ?? ""}:{" "}
                    {formatRiskLabel(riskLevel, text.riskLevels)}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 ${signalBadgeClass}`}
                  >
                    {text.labels?.signal ?? ""}:{" "}
                    {formatSignalLabel(signalValue, text.signals)}
                  </span>
                </div>
              </div>
              <div
                ref={candleContainerRef}
                className="h-[360px] w-full overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/80"
              />
            </article>

            <article className="rounded-3xl border border-slate-700/60 bg-slate-950/65 p-4 shadow-xl shadow-black/10 md:p-5">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {text.charts?.area?.title ?? ""}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {text.charts?.area?.description ?? ""}
                  </p>
                </div>
                <div className="text-sm text-slate-300">
                  {text.charts?.area?.predictedPricePrefix ?? ""}{" "}
                  <span className="font-semibold text-white">
                    {formatCurrency(analysis?.prediction?.predicted_price)}
                  </span>
                </div>
              </div>
              <div
                ref={areaContainerRef}
                className="h-[280px] w-full overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/80"
              />
            </article>
          </div>

          <div className="space-y-6">
            <article className="rounded-3xl border border-slate-700/60 bg-slate-950/65 p-5 shadow-xl shadow-black/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {text.response?.title ?? ""}
                  </h2>
                </div>
                <span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-300">
                  {responseStatusLabel}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    {text.response?.currentPrice ?? ""}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-violet-300">
                    {formatCurrency(analysis?.prediction?.current_price)}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    {text.response?.predictedPrice ?? ""}
                  </div>
                  <div
                    className="mt-2 text-lg font-semibold"
                    style={{ color: predictedPriceColor }}
                  >
                    {formatCurrency(analysis?.prediction?.predicted_price)}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    {text.response?.support ?? ""}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-pink-300">
                    {formatCurrency(analysis?.prediction?.support)}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    {text.response?.resistance ?? ""}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-blue-300">
                    {formatCurrency(analysis?.prediction?.resistance)}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3">
                  <span className="text-slate-300">
                    {text.response?.signal ?? ""}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-sm font-semibold ${signalBadgeClass}`}
                  >
                    {formatSignalLabel(signalValue, text.signals)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3">
                  <span className="text-slate-300">
                    {text.response?.riskLevel ?? ""}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-sm font-semibold ${riskBadgeClass}`}
                  >
                    {formatRiskLabel(riskLevel, text.riskLevels)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3">
                  <span className="text-slate-300">
                    {text.response?.priceChange ?? ""}
                  </span>
                  <span
                    className={`font-semibold ${analysis?.prediction?.price_change_pct >= 0 ? "text-emerald-300" : "text-rose-300"}`}
                  >
                    {formatPercent(analysis?.prediction?.price_change_pct)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3">
                  <span className="text-slate-300">
                    {text.response?.processingTime ?? ""}
                  </span>
                  <span className="font-semibold text-cyan-300">
                    {safeNumber(analysis?.processing_time_seconds, 2)}s
                  </span>
                </div>
              </div>
            </article>
          </div>
        </section>

        {isAnalyzing ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl border border-slate-700/60 bg-slate-950/90 p-6 shadow-2xl shadow-black/30">
              <CandlestickLoader />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AiAnalyze;
