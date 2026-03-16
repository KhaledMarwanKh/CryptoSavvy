import React, { useEffect, useRef, useState } from "react";
import {
    Menu,
    Plus,
    Send,
    Paperclip,
    Mic,
    Square,
    Bot,
    User,
    Trash2,
    X,
    Loader2,
    BarChart3,
    FileText,
    Image as ImageIcon,
    Volume2,
    Sparkles,
} from "lucide-react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    RSI,
    EMA,
    SMA,
    MACD,
    BollingerBands,
} from "technicalindicators";

const STORAGE_KEY = "crypto-market-chat-history-v1";
const DEFAULT_MODEL = "gpt-4o-mini"; // change if your Puter account uses another model
const BINANCE_BASE = "https://data-api.binance.vision/api/v3";
const INTERVALS = ["15m", "1h", "4h", "1d", "1w"];

const SYMBOL_MAP = {
    bitcoin: "BTCUSDT",
    btc: "BTCUSDT",
    ethereum: "ETHUSDT",
    eth: "ETHUSDT",
    solana: "SOLUSDT",
    sol: "SOLUSDT",
    binance: "BNBUSDT",
    bnb: "BNBUSDT",
    ripple: "XRPUSDT",
    xrp: "XRPUSDT",
    cardano: "ADAUSDT",
    ada: "ADAUSDT",
    dogecoin: "DOGEUSDT",
    doge: "DOGEUSDT",
    chainlink: "LINKUSDT",
    link: "LINKUSDT",
    avalanche: "AVAXUSDT",
    avax: "AVAXUSDT",
    sui: "SUIUSDT",
    ton: "TONUSDT",
};

const SUGGESTIONS = [
    "What is the current BTC price?",
    "Analyze ETHUSDT on the 4h timeframe.",
    "Explain RSI, MACD, and Bollinger Bands in crypto trading.",
    "Give me a crypto market overview today.",
];

const SYSTEM_PROMPT = `
You are CryptoPilot, a professional crypto-market assistant.

Rules:
- Answer ONLY crypto-related questions:
  crypto prices, market analysis, technical analysis, indicators, tokenomics, blockchain terms, DeFi, sentiment, portfolio risk, crypto investing education, and crypto-related uploaded files/images.
- If the user asks about something unrelated to crypto, politely refuse and redirect them to crypto topics.
- Use the provided live market data and indicator data when available.
- Never promise profits or certainty.
- Give practical, risk-aware, educational investment guidance.
- When asked for price or market analysis, explain:
  1) current trend
  2) momentum
  3) support/resistance
  4) risks
  5) possible bullish/bearish scenarios
- If files/images are uploaded, analyze only what is available and mention limitations if needed.

Formatting:
- Use clean markdown
- Use short headings
- Use bullets where useful
- Highlight important numbers in bold
`;

const cn = (...classes) => classes.filter(Boolean).join(" ");

const uid = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const round = (n, p = 4) =>
    n == null || Number.isNaN(Number(n)) ? null : Number(Number(n).toFixed(p));

function formatCurrency(value) {
    if (value == null || Number.isNaN(Number(value))) return "—";
    const n = Number(value);
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: n < 1 ? 6 : n < 100 ? 4 : 2,
    }).format(n);
}

function formatNumber(value, digits = 2) {
    if (value == null || Number.isNaN(Number(value))) return "—";
    return new Intl.NumberFormat("en-US", {
        notation: Math.abs(Number(value)) >= 1000000 ? "compact" : "standard",
        maximumFractionDigits: digits,
    }).format(Number(value));
}

function formatPercent(value) {
    if (value == null || Number.isNaN(Number(value))) return "—";
    const n = Number(value);
    return `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function formatMessageTime(ts) {
    return new Date(ts).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatAxisTime(ts, interval) {
    const d = new Date(ts);
    if (interval === "1d" || interval === "1w") {
        return d.toLocaleDateString([], { month: "short", day: "numeric" });
    }
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function stripMarkdown(text = "") {
    return text.replace(/[#>*`_[\]\(\)-]/g, "").replace(/\n+/g, " ").trim();
}

function clampText(text = "", max = 12000) {
    return text.length > max ? `${text.slice(0, max)}...` : text;
}

function getIntervalLimit(interval) {
    if (interval === "1w") return 52;
    if (interval === "1d") return 90;
    return 120;
}

function extractSymbolFromText(text = "") {
    const lower = text.toLowerCase();

    for (const [key, symbol] of Object.entries(SYMBOL_MAP)) {
        if (lower.includes(key)) return symbol;
    }

    const compactPair = text.toUpperCase().match(/\b([A-Z]{2,10})(USDT|BUSD|BTC|ETH)\b/);
    if (compactPair) return `${compactPair[1]}${compactPair[2]}`;

    const slashPair = text.toUpperCase().match(/\b([A-Z]{2,10})\/(USDT|BUSD|BTC|ETH)\b/);
    if (slashPair) return `${slashPair[1]}${slashPair[2]}`;

    const dollarSymbol = text.toUpperCase().match(/\$([A-Z]{2,10})\b/);
    if (dollarSymbol) return `${dollarSymbol[1]}USDT`;

    return null;
}

function shouldShowMarketChart(text = "") {
    const hasSymbol = !!extractSymbolFromText(text);
    const priceIntent = /(price|chart|analy[sz]e|analysis|trend|support|resistance|ohlc|candles?|technical|market overview|market today)/i.test(
        text
    );
    const genericMarket = /(crypto market|market overview|market today|analy[sz]e the market|overall market)/i.test(
        text
    );
    return (priceIntent && hasSymbol) || genericMarket;
}

function createWelcomeMessage() {
    return {
        id: uid(),
        role: "assistant",
        createdAt: Date.now(),
        content: `
## Welcome to CryptoPilot

Ask me about:

- **Live crypto prices**
- **Market analysis**
- **OHLC / chart review**
- **RSI, MACD, EMA, SMA, Bollinger Bands**
- **Crypto terms and concepts**
- **Risk-aware investment guidance**
- **Uploaded crypto chart screenshots, CSV, JSON, or text files**

> I only answer questions related to the **crypto market**.
    `.trim(),
    };
}

function createNewChatObject() {
    return {
        id: uid(),
        title: "New chat",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [createWelcomeMessage()],
    };
}

function loadChatsFromStorage() {
    if (typeof window === "undefined") return [createNewChatObject()];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [createNewChatObject()];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || !parsed.length) return [createNewChatObject()];
        return parsed;
    } catch {
        return [createNewChatObject()];
    }
}

function sanitizeAttachmentForStorage(att) {
    return {
        id: att.id,
        kind: att.kind,
        name: att.name,
        mime: att.mime,
        size: att.size,
        createdAt: att.createdAt,
        preview:
            typeof att.preview === "string" && att.preview.length < 180000
                ? att.preview
                : null,
        textContent: att.textContent ? clampText(att.textContent, 6000) : null,
    };
}

function sanitizeChatsForStorage(chats) {
    return chats.map((chat) => ({
        ...chat,
        messages: chat.messages.map((msg) => ({
            ...msg,
            attachments: (msg.attachments || []).map(sanitizeAttachmentForStorage),
            chart: msg.chart
                ? {
                    ...msg.chart,
                    series: (msg.chart.series || []).slice(-60),
                }
                : null,
        })),
    }));
}

function summarizeAttachments(attachments = []) {
    if (!attachments.length) return "No attachments.";
    return attachments
        .map((a, i) => {
            if (a.kind === "document") {
                return `${i + 1}. Document: ${a.name}\n${clampText(a.textContent || "", 5000)}`;
            }
            if (a.kind === "image") {
                return `${i + 1}. Image attached: ${a.name}`;
            }
            if (a.kind === "audio") {
                return `${i + 1}. Audio attached: ${a.name}`;
            }
            return `${i + 1}. File attached: ${a.name}`;
        })
        .join("\n\n");
}

function buildPrompt({ recentMessages, userText, marketContext, attachments }) {
    const recentChat = recentMessages
        .filter((m) => !m.pending)
        .slice(-8)
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${stripMarkdown(m.content || "").slice(0, 700)}`)
        .join("\n");

    const marketBlock = marketContext
        ? JSON.stringify(
            {
                symbol: marketContext.symbol,
                interval: marketContext.interval,
                market: marketContext.market,
                indicators: marketContext.indicators,
                levels: marketContext.levels,
                sentiment: marketContext.sentiment,
                recentCloses: (marketContext.series || []).slice(-12).map((c) => ({
                    time: c.label,
                    close: c.close,
                    high: c.high,
                    low: c.low,
                    volume: c.volume,
                })),
            },
            null,
            2
        )
        : "No live market data injected for this turn.";

    return `
${SYSTEM_PROMPT}

LIVE MARKET CONTEXT:
${marketBlock}

ATTACHMENTS:
${summarizeAttachments(attachments)}

RECENT CHAT:
${recentChat || "No prior context."}

USER REQUEST:
${userText || "Please analyze the uploaded crypto-related attachment."}

Respond with professional, concise markdown.
  `.trim();
}

function extractPuterText(result) {
    if (typeof result === "string") return result;
    if (typeof result?.text === "string") return result.text;
    if (result?.message?.content) return result.message.content;
    if (Array.isArray(result?.choices)) {
        return (
            result.choices[0]?.message?.content ||
            result.choices[0]?.text ||
            "No response received."
        );
    }
    if (Array.isArray(result?.content)) {
        return result.content.map((item) => item?.text || "").join("\n");
    }
    return "No response received.";
}

/* ================================
   Required tool functions
================================ */

/** 1) Binance market data */
async function getBinanceMarketData(symbol = "BTCUSDT") {
    const res = await fetch(`${BINANCE_BASE}/ticker/24hr?symbol=${symbol}`);
    if (!res.ok) throw new Error("Failed to fetch Binance market data.");
    const data = await res.json();

    return {
        symbol: data.symbol,
        price: Number(data.lastPrice),
        priceChangePercent: Number(data.priceChangePercent),
        high: Number(data.highPrice),
        low: Number(data.lowPrice),
        open: Number(data.openPrice),
        prevClose: Number(data.prevClosePrice),
        bid: Number(data.bidPrice),
        ask: Number(data.askPrice),
        volume: Number(data.volume),
        quoteVolume: Number(data.quoteVolume),
    };
}

/** 2) Binance OHLC */
async function getBinanceOHLC(symbol = "BTCUSDT", interval = "1h", limit = 120) {
    const res = await fetch(
        `${BINANCE_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    );
    if (!res.ok) throw new Error("Failed to fetch Binance OHLC data.");
    const data = await res.json();

    return data.map((item) => ({
        openTime: item[0],
        open: Number(item[1]),
        high: Number(item[2]),
        low: Number(item[3]),
        close: Number(item[4]),
        volume: Number(item[5]),
        closeTime: item[6],
        label: formatAxisTime(item[0], interval),
    }));
}

/** helper: indicators from OHLC candles */
function calculateIndicatorsFromCandles(candles = []) {
    const closes = candles.map((c) => c.close);

    if (closes.length < 50) return null;

    const rsiValues = RSI.calculate({ values: closes, period: 14 });
    const ema20Values = EMA.calculate({ values: closes, period: 20 });
    const ema50Values = EMA.calculate({ values: closes, period: 50 });
    const sma20Values = SMA.calculate({ values: closes, period: 20 });
    const macdValues = MACD.calculate({
        values: closes,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
    });
    const bbValues = BollingerBands.calculate({
        values: closes,
        period: 20,
        stdDev: 2,
    });

    const lastMACD = macdValues.at(-1);
    const lastBB = bbValues.at(-1);

    const recentSlice = candles.slice(-20);
    const support = Math.min(...recentSlice.map((c) => c.low));
    const resistance = Math.max(...recentSlice.map((c) => c.high));

    return {
        rsi: round(rsiValues.at(-1), 2),
        ema20: round(ema20Values.at(-1), 4),
        ema50: round(ema50Values.at(-1), 4),
        sma20: round(sma20Values.at(-1), 4),
        macd: round(lastMACD?.MACD, 4),
        macdSignal: round(lastMACD?.signal, 4),
        macdHistogram: round(lastMACD?.histogram, 4),
        bbUpper: round(lastBB?.upper, 4),
        bbMiddle: round(lastBB?.middle, 4),
        bbLower: round(lastBB?.lower, 4),
        support: round(support, 4),
        resistance: round(resistance, 4),
    };
}

/** 3) Calculates indicators using Binance OHLC + technicalindicators */
async function calculateIndicators(symbol = "BTCUSDT", interval = "1h") {
    const candles = await getBinanceOHLC(symbol, interval, getIntervalLimit(interval));
    return calculateIndicatorsFromCandles(candles);
}

/** 4) Free sentiment API */
async function getMarketSentiment() {
    const res = await fetch("https://api.alternative.me/fng/?limit=1");
    if (!res.ok) throw new Error("Failed to fetch sentiment.");
    const data = await res.json();
    const item = data?.data?.[0];

    return {
        value: Number(item?.value),
        classification: item?.value_classification || "Unknown",
        timestamp: item?.timestamp,
    };
}

async function getMarketToolPack(symbol = "BTCUSDT", interval = "1h") {
    const [marketRes, ohlcRes, indicatorsRes, sentimentRes] = await Promise.allSettled([
        getBinanceMarketData(symbol),
        getBinanceOHLC(symbol, interval, getIntervalLimit(interval)),
        calculateIndicators(symbol, interval),
        getMarketSentiment(),
    ]);

    const market =
        marketRes.status === "fulfilled" ? marketRes.value : null;
    const series =
        ohlcRes.status === "fulfilled" ? ohlcRes.value : [];
    const indicators =
        indicatorsRes.status === "fulfilled" ? indicatorsRes.value : null;
    const sentiment =
        sentimentRes.status === "fulfilled" ? sentimentRes.value : null;

    if (!market && !series.length) {
        throw new Error("Unable to load live market data right now.");
    }

    return {
        symbol,
        interval,
        market:
            market ||
            {
                symbol,
                price: series.at(-1)?.close,
                priceChangePercent:
                    ((series.at(-1)?.close - series[0]?.open) / series[0]?.open) * 100,
            },
        series,
        indicators,
        sentiment,
        levels: indicators
            ? {
                support: indicators.support,
                resistance: indicators.resistance,
            }
            : null,
    };
}

async function askCryptoAssistant({ prompt, attachments = [], model = DEFAULT_MODEL }) {
    if (!window.puter?.ai?.chat) {
        throw new Error(
            "Puter.js is not loaded. Add <script src='https://js.puter.com/v2/'></script> to index.html"
        );
    }

    const imageAttachments = attachments.filter(
        (a) => a.kind === "image" && a.dataUrl
    );
    const documentContext = attachments
        .filter((a) => a.kind === "document" && a.textContent)
        .map((a) => `Document (${a.name}):\n${clampText(a.textContent, 6000)}`)
        .join("\n\n");

    // Try multimodal first for images if Puter model/build supports it.
    if (imageAttachments.length) {
        try {
            const multimodalPayload = [
                {
                    type: "text",
                    text: `${prompt}\n\n${documentContext ? `DOCUMENT CONTENT:\n${documentContext}` : ""}`,
                },
                ...imageAttachments.map((img) => ({
                    type: "image_url",
                    image_url: img.dataUrl,
                })),
            ];

            const result = await window.puter.ai.chat(multimodalPayload, { model });
            return extractPuterText(result);
        } catch (err) {
            console.warn("Multimodal payload failed, using text fallback.", err);
        }
    }

    const fallbackPrompt = `
${prompt}

${documentContext ? `DOCUMENT CONTENT:\n${documentContext}` : ""}

ATTACHMENT SUMMARY:
${summarizeAttachments(attachments)}
  `.trim();

    const result = await window.puter.ai.chat(fallbackPrompt, { model });
    return extractPuterText(result);
}

function MarkdownMessage({ content }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                h1: ({ ...props }) => (
                    <h1 className="mb-3 text-xl font-semibold text-white" {...props} />
                ),
                h2: ({ ...props }) => (
                    <h2 className="mb-3 mt-4 text-lg font-semibold text-white" {...props} />
                ),
                h3: ({ ...props }) => (
                    <h3 className="mb-2 mt-4 text-base font-semibold text-white" {...props} />
                ),
                p: ({ ...props }) => (
                    <p className="mb-3 leading-7 text-slate-100 last:mb-0" {...props} />
                ),
                ul: ({ ...props }) => (
                    <ul className="mb-3 list-disc space-y-1 pl-5 text-slate-100" {...props} />
                ),
                ol: ({ ...props }) => (
                    <ol className="mb-3 list-decimal space-y-1 pl-5 text-slate-100" {...props} />
                ),
                li: ({ ...props }) => <li className="leading-7" {...props} />,
                strong: ({ ...props }) => (
                    <strong className="font-semibold text-white" {...props} />
                ),
                blockquote: ({ ...props }) => (
                    <blockquote
                        className="my-3 rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-3 text-slate-300"
                        {...props}
                    />
                ),
                code: ({ inline, children, ...props }) =>
                    inline ? (
                        <code
                            className="rounded bg-slate-800 px-1.5 py-0.5 text-blue-300"
                            {...props}
                        >
                            {children}
                        </code>
                    ) : (
                        <pre className="my-3 overflow-x-auto rounded-2xl bg-slate-950/80 p-4 text-sm text-slate-100">
                            <code {...props}>{children}</code>
                        </pre>
                    ),
                a: ({ ...props }) => (
                    <a
                        className="text-blue-400 underline hover:text-blue-300"
                        target="_blank"
                        rel="noreferrer"
                        {...props}
                    />
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
}

function LoadingBubble() {
    return (
        <div className="flex items-center gap-2 text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
            <span className="text-sm">Analyzing crypto market data...</span>
        </div>
    );
}

function AttachmentCard({ attachment }) {
    const iconMap = {
        document: FileText,
        image: ImageIcon,
        audio: Volume2,
        file: FileText,
    };
    const Icon = iconMap[attachment.kind] || FileText;

    if (attachment.kind === "image" && (attachment.preview || attachment.dataUrl)) {
        return (
            <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-950/40">
                <img
                    src={attachment.preview || attachment.dataUrl}
                    alt={attachment.name}
                    className="max-h-72 w-full object-cover"
                />
                <div className="border-t border-slate-700/50 px-3 py-2 text-xs text-slate-300">
                    {attachment.name}
                </div>
            </div>
        );
    }

    if (attachment.kind === "audio" && attachment.objectUrl) {
        return (
            <div className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-200">
                    <Volume2 className="h-4 w-4 text-blue-400" />
                    <span>{attachment.name}</span>
                </div>
                <audio controls src={attachment.objectUrl} className="w-full" />
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-200">
                <Icon className="h-4 w-4 text-blue-400" />
                <span className="truncate">{attachment.name}</span>
            </div>
            {attachment.textContent && (
                <div className="whitespace-pre-wrap text-xs text-slate-400">
                    {clampText(attachment.textContent, 350)}
                </div>
            )}
            {!attachment.textContent && (
                <div className="text-xs text-slate-400">
                    {formatNumber((attachment.size || 0) / 1024, 1)} KB
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, tone = "default" }) {
    return (
        <div
            className={cn(
                "rounded-2xl border px-3 py-3",
                tone === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : tone === "error"
                        ? "border-red-500/30 bg-red-500/10"
                        : "border-slate-700/50 bg-slate-950/40"
            )}
        >
            <div className="text-xs text-slate-400">{label}</div>
            <div className="mt-1 text-sm font-medium text-white">{value}</div>
        </div>
    );
}

function MarketChartCard({ messageId, chart, onChangeInterval }) {
    const positive = Number(chart?.market?.priceChangePercent || 0) >= 0;
    const stroke = positive ? "#34d399" : "#f87171";
    const fill = positive ? "rgba(52, 211, 153, 0.18)" : "rgba(248, 113, 113, 0.18)";
    const gradientId = `area-gradient-${messageId}`;

    return (
        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-700/50 bg-slate-900/70 shadow-md backdrop-blur-xl">
            <div className="border-b border-slate-700/50 px-4 py-4 md:px-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <BarChart3 className="h-4 w-4 text-blue-400" />
                            <span>
                                {chart.symbol} · {chart.interval}
                            </span>
                        </div>
                        <div className="mt-2 text-2xl font-semibold text-white">
                            {formatCurrency(chart.market?.price)}
                        </div>
                        <div
                            className={cn(
                                "text-sm font-medium",
                                positive ? "text-emerald-400" : "text-red-400"
                            )}
                        >
                            {formatPercent(chart.market?.priceChangePercent)} (24h)
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {INTERVALS.map((interval) => (
                            <button
                                key={interval}
                                onClick={() => onChangeInterval(messageId, interval)}
                                className={cn(
                                    "rounded-full border px-3 py-1.5 text-xs transition",
                                    chart.interval === interval
                                        ? "border-blue-500 bg-blue-600 text-white"
                                        : "border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
                                )}
                            >
                                {interval}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 px-4 py-4 md:grid-cols-4 md:px-5">
                <StatCard label="24h High" value={formatCurrency(chart.market?.high)} />
                <StatCard label="24h Low" value={formatCurrency(chart.market?.low)} />
                <StatCard
                    label="RSI"
                    value={chart.indicators?.rsi ?? "—"}
                    tone={
                        chart.indicators?.rsi > 70
                            ? "error"
                            : chart.indicators?.rsi < 30
                                ? "success"
                                : "default"
                    }
                />
                <StatCard
                    label="Fear & Greed"
                    value={
                        chart.sentiment
                            ? `${chart.sentiment.value} · ${chart.sentiment.classification}`
                            : "—"
                    }
                />
                <StatCard label="EMA 20" value={formatCurrency(chart.indicators?.ema20)} />
                <StatCard label="EMA 50" value={formatCurrency(chart.indicators?.ema50)} />
                <StatCard
                    label="Support"
                    value={formatCurrency(chart.levels?.support)}
                />
                <StatCard
                    label="Resistance"
                    value={formatCurrency(chart.levels?.resistance)}
                />
            </div>

            <div className="h-72 w-full px-2 pb-4 md:px-4">
                {chart.loading ? (
                    <div className="flex h-full items-center justify-center text-slate-300">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-400" />
                        Updating chart...
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chart.series || []}>
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={stroke} stopOpacity={0.5} />
                                    <stop offset="95%" stopColor={stroke} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="label"
                                stroke="#94a3b8"
                                tick={{ fill: "#94a3b8", fontSize: 12 }}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fill: "#94a3b8", fontSize: 12 }}
                                tickFormatter={(v) => formatNumber(v, 2)}
                                width={80}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: "#020617",
                                    border: "1px solid rgba(51,65,85,0.8)",
                                    borderRadius: "16px",
                                    color: "#fff",
                                }}
                                formatter={(value) => [formatCurrency(value), "Price"]}
                                labelStyle={{ color: "#cbd5e1" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="close"
                                stroke={stroke}
                                fill={`url(#${gradientId})`}
                                strokeWidth={2.4}
                                dot={false}
                                activeDot={{ r: 4, fill: stroke }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {chart.error && (
                <div className="mx-4 mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    {chart.error}
                </div>
            )}
        </div>
    );
}

export default function CryptoChatPage() {
    const [chats, setChats] = useState(() => loadChatsFromStorage());
    const [activeChatId, setActiveChatId] = useState(() => loadChatsFromStorage()[0]?.id);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [input, setInput] = useState("");
    const [composerAttachments, setComposerAttachments] = useState([]);
    const [composerError, setComposerError] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const mediaStreamRef = useRef(null);
    const speechRecognitionRef = useRef(null);

    const activeChat =
        chats.find((chat) => chat.id === activeChatId) || chats[0];

    useEffect(() => {
        if (!activeChatId && chats[0]?.id) setActiveChatId(chats[0].id);
    }, [activeChatId, chats]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(sanitizeChatsForStorage(chats))
            );
        } catch (err) {
            console.warn("Failed to save chats to localStorage", err);
        }
    }, [chats]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeChat?.messages?.length, isSending]);

    useEffect(() => {
        return () => {
            mediaRecorderRef.current?.stop?.();
            mediaStreamRef.current?.getTracks?.().forEach((t) => t.stop());
            speechRecognitionRef.current?.stop?.();
        };
    }, []);

    const updateChat = (chatId, producer) => {
        setChats((prev) => {
            const next = prev
                .map((chat) => (chat.id === chatId ? producer(chat) : chat))
                .sort((a, b) => b.updatedAt - a.updatedAt);
            return next;
        });
    };

    const createNewChat = () => {
        const newChat = createNewChatObject();
        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.id);
        setSidebarOpen(false);
        setInput("");
        setComposerAttachments([]);
        setComposerError("");
    };

    const deleteChat = (chatId) => {
        const ok = window.confirm("Delete this chat?");
        if (!ok) return;

        const next = chats.filter((chat) => chat.id !== chatId);
        if (!next.length) {
            const fresh = createNewChatObject();
            setChats([fresh]);
            setActiveChatId(fresh.id);
            return;
        }
        setChats(next);
        if (activeChatId === chatId) {
            setActiveChatId(next[0].id);
        }
    };

    const addMessagesToChat = (chatId, newMessages, firstUserText = "") => {
        updateChat(chatId, (chat) => ({
            ...chat,
            updatedAt: Date.now(),
            title:
                chat.title === "New chat" && firstUserText
                    ? `${firstUserText.slice(0, 34)}${firstUserText.length > 34 ? "…" : ""}`
                    : chat.title,
            messages: [...chat.messages, ...newMessages],
        }));
    };

    const replaceMessageInChat = (chatId, messageId, nextMessage) => {
        updateChat(chatId, (chat) => ({
            ...chat,
            updatedAt: Date.now(),
            messages: chat.messages.map((m) => (m.id === messageId ? nextMessage : m)),
        }));
    };

    const patchMessageInChat = (chatId, messageId, patch) => {
        updateChat(chatId, (chat) => ({
            ...chat,
            updatedAt: Date.now(),
            messages: chat.messages.map((m) =>
                m.id === messageId
                    ? typeof patch === "function"
                        ? patch(m)
                        : { ...m, ...patch }
                    : m
            ),
        }));
    };

    const readFileAsText = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = reject;
            reader.readAsText(file);
        });

    const readFileAsDataURL = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    const prepareAttachment = async (file) => {
        const base = {
            id: uid(),
            name: file.name,
            mime: file.type || "application/octet-stream",
            size: file.size,
            createdAt: Date.now(),
        };

        if (file.type.startsWith("image/")) {
            const dataUrl = await readFileAsDataURL(file);
            return {
                ...base,
                kind: "image",
                preview: dataUrl,
                dataUrl,
            };
        }

        if (
            file.type.startsWith("text/") ||
            /\.(csv|json|txt|md)$/i.test(file.name)
        ) {
            const text = await readFileAsText(file);
            return {
                ...base,
                kind: "document",
                textContent: clampText(text, 15000),
                preview: clampText(text, 500),
            };
        }

        if (file.type.startsWith("audio/")) {
            return {
                ...base,
                kind: "audio",
                objectUrl: URL.createObjectURL(file),
            };
        }

        return {
            ...base,
            kind: "file",
            preview: `${file.name} • ${formatNumber(file.size / 1024, 1)} KB`,
        };
    };

    const handleFiles = async (fileList) => {
        setComposerError("");
        try {
            const files = Array.from(fileList || []);
            if (!files.length) return;
            const prepared = await Promise.all(files.map(prepareAttachment));
            setComposerAttachments((prev) => [...prev, ...prepared]);
        } catch (err) {
            setComposerError("Failed to read uploaded file(s).");
        }
    };

    const removeComposerAttachment = (id) => {
        setComposerAttachments((prev) => {
            const target = prev.find((a) => a.id === id);
            if (target?.objectUrl) URL.revokeObjectURL(target.objectUrl);
            return prev.filter((a) => a.id !== id);
        });
    };

    const startOptionalSpeechRecognition = () => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.onresult = (event) => {
            let transcript = "";
            for (let i = event.resultIndex; i < event.results.length; i += 1) {
                transcript += event.results[i][0].transcript;
            }
            if (transcript.trim()) {
                setInput((prev) => {
                    const merged = `${prev} ${transcript}`.trim();
                    return merged;
                });
            }
        };

        recognition.onerror = () => { };
        recognition.onend = () => {
            speechRecognitionRef.current = null;
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
    };

    const toggleRecording = async () => {
        setComposerError("");

        if (isRecording) {
            mediaRecorderRef.current?.stop();
            speechRecognitionRef.current?.stop?.();
            setIsRecording(false);
            return;
        }

        if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
            setComposerError("Audio recording is not supported in this browser.");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            const recorder = new MediaRecorder(stream);
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, {
                    type: recorder.mimeType || "audio/webm",
                });

                if (blob.size > 0) {
                    const audioAttachment = {
                        id: uid(),
                        kind: "audio",
                        name: `voice-note-${Date.now()}.webm`,
                        mime: blob.type,
                        size: blob.size,
                        createdAt: Date.now(),
                        objectUrl: URL.createObjectURL(blob),
                    };
                    setComposerAttachments((prev) => [...prev, audioAttachment]);
                }

                mediaStreamRef.current?.getTracks()?.forEach((t) => t.stop());
                mediaStreamRef.current = null;
                mediaRecorderRef.current = null;
                audioChunksRef.current = [];
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
            startOptionalSpeechRecognition();
        } catch (err) {
            setComposerError("Microphone access denied or unavailable.");
        }
    };

    const handleSend = async (quickText = null) => {
        const text = (quickText ?? input).trim();
        if ((!text && !composerAttachments.length) || !activeChat) return;

        setIsSending(true);
        setComposerError("");

        const chatId = activeChat.id;
        const attachmentsToSend = [...composerAttachments];

        const userMessage = {
            id: uid(),
            role: "user",
            createdAt: Date.now(),
            content: text || "*Uploaded a crypto-related attachment for analysis.*",
            attachments: attachmentsToSend,
        };

        const pendingId = uid();
        const pendingAssistant = {
            id: pendingId,
            role: "assistant",
            createdAt: Date.now(),
            content: "",
            pending: true,
        };

        addMessagesToChat(chatId, [userMessage, pendingAssistant], text);

        setInput("");
        setComposerAttachments([]);

        try {
            const shouldChart = shouldShowMarketChart(text);
            const symbol = extractSymbolFromText(text) || "BTCUSDT";

            let marketContext = null;
            if (shouldChart) {
                try {
                    marketContext = await getMarketToolPack(symbol, "1h");
                } catch (err) {
                    console.warn("Market tool pack failed", err);
                }
            }

            const prompt = buildPrompt({
                recentMessages: [...(activeChat.messages || []), userMessage],
                userText: text,
                marketContext,
                attachments: attachmentsToSend,
            });

            const answer = await askCryptoAssistant({
                prompt,
                attachments: attachmentsToSend,
            });

            replaceMessageInChat(chatId, pendingId, {
                id: pendingId,
                role: "assistant",
                createdAt: Date.now(),
                content: answer,
                chart: marketContext
                    ? {
                        ...marketContext,
                        loading: false,
                        error: "",
                    }
                    : null,
            });
        } catch (err) {
            replaceMessageInChat(chatId, pendingId, {
                id: pendingId,
                role: "assistant",
                createdAt: Date.now(),
                content: `**Error:** ${err.message || "Something went wrong."}`,
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleChartIntervalChange = async (messageId, interval) => {
        if (!activeChat) return;
        const message = activeChat.messages.find((m) => m.id === messageId);
        if (!message?.chart?.symbol) return;

        const { symbol } = message.chart;

        patchMessageInChat(activeChat.id, messageId, (msg) => ({
            ...msg,
            chart: {
                ...msg.chart,
                interval,
                loading: true,
                error: "",
            },
        }));

        try {
            const nextChart = await getMarketToolPack(symbol, interval);
            patchMessageInChat(activeChat.id, messageId, (msg) => ({
                ...msg,
                chart: {
                    ...nextChart,
                    loading: false,
                    error: "",
                },
            }));
        } catch (err) {
            patchMessageInChat(activeChat.id, messageId, (msg) => ({
                ...msg,
                chart: {
                    ...msg.chart,
                    loading: false,
                    error: err.message || "Failed to update chart.",
                },
            }));
        }
    };

    const handleTextareaKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
            <div className="flex h-screen">
                {/* Mobile backdrop */}
                {sidebarOpen && (
                    <button
                        className="fixed inset-0 z-30 bg-black/50 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed inset-y-0 left-0 z-40 w-[300px] border-r border-slate-700/50 bg-slate-900/70 backdrop-blur-xl transition-transform md:static md:translate-x-0",
                        sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <div className="flex h-full flex-col">
                        <div className="border-b border-slate-700/50 p-4">
                            <button
                                onClick={createNewChat}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4" />
                                New Chat
                            </button>
                        </div>

                        <div className="flex-1 space-y-2 overflow-y-auto p-3">
                            {chats.map((chat) => {
                                const lastMessage = chat.messages?.[chat.messages.length - 1];
                                const active = chat.id === activeChat?.id;

                                return (
                                    <div
                                        key={chat.id}
                                        className={cn(
                                            "group flex items-start gap-2 rounded-2xl border p-3 transition",
                                            active
                                                ? "border-blue-500/40 bg-blue-500/10"
                                                : "border-slate-700/50 bg-slate-950/30 hover:bg-slate-800/70"
                                        )}
                                    >
                                        <button
                                            className="flex-1 text-left"
                                            onClick={() => {
                                                setActiveChatId(chat.id);
                                                setSidebarOpen(false);
                                            }}
                                        >
                                            <div className="truncate text-sm font-medium text-slate-100">
                                                {chat.title}
                                            </div>
                                            <div className="mt-1 truncate text-xs text-slate-400">
                                                {stripMarkdown(lastMessage?.content || "No messages")}
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => deleteChat(chat.id)}
                                            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="border-t border-slate-700/50 p-4">
                            <div className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-3">
                                <div className="flex items-center gap-2 text-sm text-slate-200">
                                    <Sparkles className="h-4 w-4 text-blue-400" />
                                    <span>Crypto-only mode</span>
                                </div>
                                <p className="mt-2 text-xs leading-6 text-slate-400">
                                    Powered by Puter.js + Binance + technical indicators + Fear & Greed.
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main */}
                <main className="flex min-w-0 flex-1 flex-col">
                    {/* Header */}
                    <div className="sticky top-0 z-20 border-b border-slate-700/50 bg-slate-950/60 backdrop-blur-xl">
                        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
                            <div className="flex items-center gap-3">
                                <button
                                    className="rounded-xl border border-slate-700/50 bg-slate-900/70 p-2 text-slate-200 md:hidden"
                                    onClick={() => setSidebarOpen(true)}
                                >
                                    <Menu className="h-5 w-5" />
                                </button>

                                <div>
                                    <div className="text-sm font-semibold text-slate-100">
                                        Crypto Market Assistant
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        Live market data · charting · indicators · sentiment
                                    </div>
                                </div>
                            </div>

                            <div className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 sm:block">
                                Live tools enabled
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
                            <div className="space-y-6">
                                {(activeChat?.messages || []).map((message) => {
                                    const isUser = message.role === "user";

                                    return (
                                        <div key={message.id} className="w-full">
                                            <div
                                                className={cn(
                                                    "flex w-full",
                                                    isUser ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                <div className="flex w-full max-w-4xl gap-3">
                                                    {!isUser && (
                                                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-900/70">
                                                            <Bot className="h-5 w-5 text-blue-400" />
                                                        </div>
                                                    )}

                                                    <div className={cn("min-w-0 flex-1", isUser && "flex justify-end")}>
                                                        <div
                                                            className={cn(
                                                                "rounded-3xl border px-4 py-4 shadow-md",
                                                                isUser
                                                                    ? "max-w-3xl border-blue-500/20 bg-blue-600/10"
                                                                    : "border-slate-700/50 bg-slate-900/70 backdrop-blur-xl"
                                                            )}
                                                        >
                                                            <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                                                                {isUser ? (
                                                                    <>
                                                                        <User className="h-3.5 w-3.5" />
                                                                        You
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Bot className="h-3.5 w-3.5" />
                                                                        CryptoPilot
                                                                    </>
                                                                )}
                                                                <span>•</span>
                                                                <span>{formatMessageTime(message.createdAt)}</span>
                                                            </div>

                                                            {message.pending ? (
                                                                <LoadingBubble />
                                                            ) : (
                                                                <MarkdownMessage content={message.content} />
                                                            )}

                                                            {!!message.attachments?.length && (
                                                                <div className="mt-4 grid gap-3 md:grid-cols-2">
                                                                    {message.attachments.map((att) => (
                                                                        <AttachmentCard key={att.id} attachment={att} />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {!!message.chart && (
                                                            <MarketChartCard
                                                                messageId={message.id}
                                                                chart={message.chart}
                                                                onChangeInterval={handleChartIntervalChange}
                                                            />
                                                        )}
                                                    </div>

                                                    {isUser && (
                                                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-600/10">
                                                            <User className="h-5 w-5 text-blue-300" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {activeChat?.messages?.length <= 1 && (
                                    <div className="mx-auto mt-6 max-w-4xl">
                                        <div className="mb-4 text-center">
                                            <h2 className="text-2xl font-semibold text-white">
                                                Ask anything about the crypto market
                                            </h2>
                                            <p className="mt-2 text-sm text-slate-400">
                                                Prices, trend analysis, indicators, crypto terms, sentiment, or file/image analysis.
                                            </p>
                                        </div>

                                        <div className="grid gap-3 md:grid-cols-2">
                                            {SUGGESTIONS.map((item) => (
                                                <button
                                                    key={item}
                                                    onClick={() => handleSend(item)}
                                                    className="rounded-2xl border border-slate-700/50 bg-slate-900/70 p-4 text-left transition hover:border-blue-500/40 hover:bg-slate-800"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <Sparkles className="mt-0.5 h-4 w-4 text-blue-400" />
                                                        <span className="text-sm text-slate-200">{item}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                    </div>

                    {/* Composer */}
                    <div className="sticky bottom-0 z-20 border-t border-slate-700/50 bg-slate-950/70 backdrop-blur-xl">
                        <div className="mx-auto w-full max-w-5xl px-4 py-4 md:px-6">
                            {!!composerAttachments.length && (
                                <div className="mb-3 flex flex-wrap gap-2">
                                    {composerAttachments.map((att) => (
                                        <div
                                            key={att.id}
                                            className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-200"
                                        >
                                            {att.kind === "image" ? (
                                                <ImageIcon className="h-3.5 w-3.5 text-blue-400" />
                                            ) : att.kind === "audio" ? (
                                                <Volume2 className="h-3.5 w-3.5 text-blue-400" />
                                            ) : (
                                                <FileText className="h-3.5 w-3.5 text-blue-400" />
                                            )}
                                            <span className="max-w-[180px] truncate">{att.name}</span>
                                            <button
                                                onClick={() => removeComposerAttachment(att.id)}
                                                className="rounded-full p-0.5 text-slate-400 hover:bg-slate-800 hover:text-red-400"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {composerError && (
                                <div className="mb-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                                    {composerError}
                                </div>
                            )}

                            {isRecording && (
                                <div className="mb-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                                    Recording voice... click the stop button when finished.
                                </div>
                            )}

                            <div className="rounded-[28px] border border-slate-700 bg-slate-950/60 shadow-md focus-within:ring-2 focus-within:ring-blue-500">
                                <textarea
                                    ref={textareaRef}
                                    rows={3}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleTextareaKeyDown}
                                    placeholder="Ask about BTC price, analyze ETH market, explain RSI, or upload a crypto chart..."
                                    className="w-full resize-none bg-transparent px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500"
                                />

                                <div className="flex items-center justify-between px-3 pb-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            className="hidden"
                                            accept="image/*,.csv,.json,.txt,.md,audio/*,.pdf"
                                            onChange={(e) => {
                                                handleFiles(e.target.files);
                                                e.target.value = "";
                                            }}
                                        />

                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="rounded-xl border border-slate-700 bg-slate-900/70 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                                            title="Upload file"
                                        >
                                            <Paperclip className="h-4 w-4" />
                                        </button>

                                        <button
                                            onClick={toggleRecording}
                                            className={cn(
                                                "rounded-xl border p-2 transition",
                                                isRecording
                                                    ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                                    : "border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800 hover:text-white"
                                            )}
                                            title={isRecording ? "Stop recording" : "Record voice"}
                                        >
                                            {isRecording ? (
                                                <Square className="h-4 w-4" />
                                            ) : (
                                                <Mic className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => handleSend()}
                                        disabled={isSending || isRecording || (!input.trim() && !composerAttachments.length)}
                                        className={cn(
                                            "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition",
                                            isSending || isRecording || (!input.trim() && !composerAttachments.length)
                                                ? "cursor-not-allowed bg-slate-700/60"
                                                : "bg-blue-600 hover:bg-blue-700"
                                        )}
                                    >
                                        {isSending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                        Send
                                    </button>
                                </div>
                            </div>

                            <p className="mt-2 text-center text-xs text-slate-500">
                                Crypto-only assistant • Live Binance data • Educational guidance, not guaranteed financial outcomes
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}