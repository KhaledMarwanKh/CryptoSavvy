const fmtNum = (v, d = 2) =>
    v === null || v === undefined || Number.isNaN(v) ? "—" : Number(v).toFixed(d);

const fmtInt = (v) =>
    v === null || v === undefined || Number.isNaN(v) ? "—" : Number(v).toLocaleString();

const fmtMoney = (v, d = 2) =>
    v === null || v === undefined || Number.isNaN(v)
        ? "—"
        : Number(v).toLocaleString(undefined, {
            minimumFractionDigits: d,
            maximumFractionDigits: d,
        });

const fmtPct = (v, d = 2) =>
    v === null || v === undefined || Number.isNaN(v) ? "—" : `${Number(v).toFixed(d)}%`;

const fmtPctFromRatio = (v, d = 4) =>
    v === null || v === undefined || Number.isNaN(v) ? "—" : `${(Number(v) * 100).toFixed(d)}%`;

const signColor = (v) => {
    if (v === null || v === undefined || Number.isNaN(v)) return "text-slate-300";
    if (v > 0) return "text-emerald-400";
    if (v < 0) return "text-red-400";
    return "text-slate-300";
};

const pillTone = (kind) => {
    if (kind === "good")
        return "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400";
    if (kind === "bad")
        return "bg-red-500/10 border border-red-500/30 text-red-400";
    return "bg-slate-950/60 border border-slate-700 text-slate-300";
};

const scoreToTone = (label) => {
    // Minimal mapping based on provided strings
    const v = (label || "").toLowerCase();
    if (["high", "strong", "uptrend"].includes(v)) return "good";
    if (["low", "weak", "downtrend"].includes(v)) return "bad";
    return "neutral";
};

const Progress = ({ value, min = 0, max = 100, goodAbove = 50 }) => {
    const clamped = Math.min(max, Math.max(min, value ?? min));
    const pct = ((clamped - min) / (max - min)) * 100;
    const tone = value >= goodAbove ? "bg-emerald-500/60" : "bg-red-500/60";
    return (
        <div className="w-full h-2 rounded-full bg-slate-950/60 border border-slate-700/50 overflow-hidden">
            <div className={`h-full ${tone}`} style={{ width: `${pct}%` }} />
        </div>
    );
};

const IndicatorTile = ({ name, value, hint, right, tone = "neutral" }) => (
    <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
        <div className="flex items-start justify-between gap-3">
            <div>
                <div className="text-slate-300 text-sm">{name}</div>
                {hint ? <div className="text-slate-400 text-xs mt-0.5">{hint}</div> : null}
            </div>
            {right ? (
                <div className="text-right">
                    <div className={`text-sm font-semibold ${tone}`}>{right}</div>
                </div>
            ) : null}
        </div>
        <div className="mt-3 flex items-end justify-between gap-3">
            <div className="text-slate-200 text-xl font-semibold tabular-nums">{value}</div>
        </div>
    </div>
);

const Section = ({ title, subtitle, children }) => (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 shadow-md backdrop-blur-xl">
        <div className="p-5 sm:p-6 border-b border-slate-700/50">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-slate-200 font-semibold">{title}</h2>
                    {subtitle ? <p className="text-slate-400 text-sm mt-1">{subtitle}</p> : null}
                </div>
            </div>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
    </div>
);

export default function MarketCard({ data }) {
    const { meta, classification, market, indicators } = data;

    const rsi = indicators?.rsi14;
    const stochK = indicators?.stochasticK14;
    const willR = indicators?.williamsR14;
    const adx = indicators?.adx14;
    const macdHist = indicators?.macdHistogram;
    const slope = indicators?.linRegSlope20;

    const rsiLabel =
        rsi >= 70 ? "Overbought" : rsi <= 30 ? "Oversold" : "Neutral";
    const stochLabel =
        stochK >= 80 ? "Overbought" : stochK <= 20 ? "Oversold" : "Neutral";
    const willLabel =
        willR >= -20 ? "Overbought" : willR <= -80 ? "Oversold" : "Neutral";

    const adxLabel = adx >= 25 ? "Trending" : adx >= 20 ? "Developing" : "Weak trend";

    const macdLabel =
        macdHist > 0 ? "Bullish momentum" : macdHist < 0 ? "Bearish momentum" : "Flat";

    const slopeLabel = slope > 0 ? "Upward bias" : slope < 0 ? "Downward bias" : "Flat";

    return (
        <div className="min-h-screen w-full">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Top grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Classification */}
                    <Section title="Classification" subtitle="High-level state (readable signals)">
                        <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1.5 rounded-full text-sm ${pillTone(scoreToTone(classification?.trend))}`}>
                                Trend: <span className="font-semibold">{classification?.trend ?? "—"}</span>
                            </span>
                            <span className={`px-3 py-1.5 rounded-full text-sm ${pillTone(scoreToTone(classification?.trendStrength))}`}>
                                Strength: <span className="font-semibold">{classification?.trendStrength ?? "—"}</span>
                            </span>
                            <span className={`px-3 py-1.5 rounded-full text-sm ${pillTone(scoreToTone(classification?.volatility))}`}>
                                Volatility: <span className="font-semibold">{classification?.volatility ?? "—"}</span>
                            </span>
                            <span className={`px-3 py-1.5 rounded-full text-sm ${pillTone(scoreToTone(classification?.liquidity))}`}>
                                Liquidity: <span className="font-semibold">{classification?.liquidity ?? "—"}</span>
                            </span>
                            <span className={`px-3 py-1.5 rounded-full text-sm ${pillTone("neutral")}`}>
                                Momentum: <span className="font-semibold">{classification?.momentum ?? "—"}</span>
                            </span>
                        </div>

                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                <div className="text-slate-300 text-sm">Spread</div>
                                <div className="mt-2 flex items-baseline justify-between gap-4">
                                    <div className="text-slate-200 text-xl font-semibold tabular-nums">
                                        {fmtNum(market?.spreadAbs, 2)}
                                    </div>
                                    <div className="text-slate-400 text-sm tabular-nums">
                                        {fmtPctFromRatio(market?.spreadPct, 6)}
                                    </div>
                                </div>
                                <div className="mt-3 text-slate-400 text-xs">
                                    Best bid {fmtMoney(market?.orderBook?.bestBid, 2)} • Best ask{" "}
                                    {fmtMoney(market?.orderBook?.bestAsk, 2)}
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                <div className="text-slate-300 text-sm">Order Book Imbalance</div>
                                <div className="mt-2 flex items-baseline justify-between gap-4">
                                    <div className="text-slate-200 text-xl font-semibold tabular-nums">
                                        {fmtNum(market?.orderBook?.bookImbalance, 3)}
                                    </div>
                                    <div className={`text-sm font-semibold ${market?.orderBook?.bookImbalance >= 0.5 ? "text-emerald-400" : "text-red-400"}`}>
                                        {market?.orderBook?.bookImbalance >= 0.5 ? "Bid-heavy" : "Ask-heavy"}
                                    </div>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-400">
                                    <div>
                                        Bid notional{" "}
                                        <span className="text-slate-300 tabular-nums">
                                            {fmtMoney(market?.orderBook?.bidNotional, 2)}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        Ask notional{" "}
                                        <span className="text-slate-300 tabular-nums">
                                            {fmtMoney(market?.orderBook?.askNotional, 2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* 24h */}
                    <Section title="Last 24h" subtitle="Liquidity & range context">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                <div className="text-slate-400 text-xs">Change</div>
                                <div className={`mt-1 text-xl font-semibold tabular-nums ${signColor(market?.last24h?.priceChangePercent)}`}>
                                    {fmtPct(market?.last24h?.priceChangePercent, 3)}
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                <div className="text-slate-400 text-xs">Trades</div>
                                <div className="mt-1 text-xl font-semibold tabular-nums text-slate-200">
                                    {fmtInt(market?.last24h?.trades)}
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                <div className="text-slate-400 text-xs">High / Low</div>
                                <div className="mt-1 text-sm text-slate-200 tabular-nums">
                                    {fmtMoney(market?.last24h?.highPrice, 2)}{" "}
                                    <span className="text-slate-400">/</span>{" "}
                                    {fmtMoney(market?.last24h?.lowPrice, 2)}
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                <div className="text-slate-400 text-xs">Volume (Quote / Base)</div>
                                <div className="mt-1 text-sm text-slate-200 tabular-nums">
                                    {fmtMoney(market?.last24h?.quoteVolume, 0)}{" "}
                                    <span className="text-slate-400">/</span>{" "}
                                    {fmtMoney(market?.last24h?.baseVolume, 2)}
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* Key takeaways */}
                    <Section title="Quick read" subtitle="Interpretation of the most important indicators">
                        <div className="space-y-4">
                            <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-slate-300 text-sm">RSI (14)</div>
                                    <div className={`text-sm font-semibold ${rsi >= 70 ? "text-red-400" : rsi <= 30 ? "text-emerald-400" : "text-slate-300"}`}>
                                        {rsiLabel}
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center gap-3">
                                    <div className="text-slate-200 font-semibold tabular-nums w-14">
                                        {fmtNum(rsi, 2)}
                                    </div>
                                    <Progress value={rsi} min={0} max={100} goodAbove={50} />
                                </div>
                                <div className="mt-2 text-slate-400 text-xs">0–100: below 30 oversold, above 70 overbought.</div>
                            </div>

                            <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-slate-300 text-sm">ADX (14)</div>
                                    <div className={`text-sm font-semibold ${adx >= 25 ? "text-emerald-400" : "text-slate-300"}`}>
                                        {adxLabel}
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center gap-3">
                                    <div className="text-slate-200 font-semibold tabular-nums w-14">
                                        {fmtNum(adx, 2)}
                                    </div>
                                    <Progress value={adx} min={0} max={50} goodAbove={25} />
                                </div>
                                <div className="mt-2 text-slate-400 text-xs">Trend strength measure (not direction): 25+ often indicates trend.</div>
                            </div>

                            <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-slate-300 text-sm">MACD Histogram</div>
                                    <div className={`text-sm font-semibold ${macdHist > 0 ? "text-emerald-400" : macdHist < 0 ? "text-red-400" : "text-slate-300"}`}>
                                        {macdLabel}
                                    </div>
                                </div>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <div className={`text-slate-200 text-xl font-semibold tabular-nums ${signColor(macdHist)}`}>
                                        {fmtNum(macdHist, 4)}
                                    </div>
                                    <div className="text-slate-400 text-xs">
                                        line {fmtNum(indicators?.macdLine, 3)} • signal {fmtNum(indicators?.macdSignal, 3)}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-slate-300 text-sm">Linear Reg Slope (20)</div>
                                    <div className={`text-sm font-semibold ${slope > 0 ? "text-emerald-400" : slope < 0 ? "text-red-400" : "text-slate-300"}`}>
                                        {slopeLabel}
                                    </div>
                                </div>
                                <div className={`mt-2 text-slate-200 text-xl font-semibold tabular-nums ${signColor(slope)}`}>
                                    {fmtNum(slope, 3)}
                                </div>
                            </div>
                        </div>
                    </Section>
                </div>

                {/* Indicators grid */}
                <div className="mt-6">
                    <Section
                        title="Indicators"
                    >
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            {/* Trend & Averages */}
                            <div>
                                <div className="text-slate-300 font-semibold mb-3">Trend & Averages</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <IndicatorTile
                                        name="SMA 20"
                                        hint="Short-term average"
                                        value={fmtMoney(indicators?.sma20, 3)}
                                        right={indicators?.sma20 > meta?.lastPrice ? "Above price" : "Below price"}
                                        tone={indicators?.sma20 > meta?.lastPrice ? "text-red-400" : "text-emerald-400"}
                                    />
                                    <IndicatorTile
                                        name="SMA 50"
                                        hint="Medium-term average"
                                        value={fmtMoney(indicators?.sma50, 3)}
                                        right={indicators?.sma50 > meta?.lastPrice ? "Above price" : "Below price"}
                                        tone={indicators?.sma50 > meta?.lastPrice ? "text-red-400" : "text-emerald-400"}
                                    />
                                    <IndicatorTile
                                        name="EMA 20"
                                        hint="Faster average (more weight to recent)"
                                        value={fmtMoney(indicators?.ema20, 3)}
                                        right={indicators?.ema20 > meta?.lastPrice ? "Above price" : "Below price"}
                                        tone={indicators?.ema20 > meta?.lastPrice ? "text-red-400" : "text-emerald-400"}
                                    />
                                    <IndicatorTile
                                        name="EMA 50"
                                        hint="Smoother medium average"
                                        value={fmtMoney(indicators?.ema50, 3)}
                                        right={indicators?.ema50 > meta?.lastPrice ? "Above price" : "Below price"}
                                        tone={indicators?.ema50 > meta?.lastPrice ? "text-red-400" : "text-emerald-400"}
                                    />

                                    <IndicatorTile
                                        name="ADX 14"
                                        hint="Trend strength (0–50+)"
                                        value={fmtNum(indicators?.adx14, 2)}
                                        right={adxLabel}
                                        tone={adx >= 25 ? "text-emerald-400" : "text-slate-300"}
                                    />
                                    <IndicatorTile
                                        name="+DI / -DI (14)"
                                        hint="Directional movement"
                                        value={`${fmtNum(indicators?.plusDI14, 2)} / ${fmtNum(indicators?.minusDI14, 2)}`}
                                        right={
                                            indicators?.plusDI14 > indicators?.minusDI14 ? "Bullish" : "Bearish"
                                        }
                                        tone={
                                            indicators?.plusDI14 > indicators?.minusDI14
                                                ? "text-emerald-400"
                                                : "text-red-400"
                                        }
                                    />
                                </div>
                            </div>

                            {/* Momentum */}
                            <div>
                                <div className="text-slate-300 font-semibold mb-3">Momentum</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4 sm:col-span-2">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="text-slate-300 text-sm">RSI 14</div>
                                                <div className="text-slate-400 text-xs mt-0.5">{rsiLabel}</div>
                                            </div>
                                            <div className="text-slate-200 font-semibold tabular-nums">{fmtNum(rsi, 2)}</div>
                                        </div>
                                        <div className="mt-3">
                                            <Progress value={rsi} min={0} max={100} goodAbove={50} />
                                            <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                                                <span>0</span>
                                                <span>30</span>
                                                <span>50</span>
                                                <span>70</span>
                                                <span>100</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-slate-300 text-sm">Stochastic %K (14)</div>
                                                <div className="text-slate-400 text-xs mt-0.5">{stochLabel}</div>
                                            </div>
                                            <div className="text-slate-200 font-semibold tabular-nums">{fmtNum(stochK, 2)}</div>
                                        </div>
                                        <div className="mt-3">
                                            <Progress value={stochK} min={0} max={100} goodAbove={50} />
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-slate-300 text-sm">Williams %R (14)</div>
                                                <div className="text-slate-400 text-xs mt-0.5">{willLabel}</div>
                                            </div>
                                            <div className="text-slate-200 font-semibold tabular-nums">{fmtNum(willR, 2)}</div>
                                        </div>
                                        <div className="mt-3">
                                            {/* Williams %R is -100 to 0 */}
                                            <Progress value={willR} min={-100} max={0} goodAbove={-50} />
                                        </div>
                                    </div>

                                    <IndicatorTile
                                        name="ROC (12)"
                                        hint="Rate of change"
                                        value={fmtNum(indicators?.roc12, 4)}
                                        right={indicators?.roc12 > 0 ? "Positive" : indicators?.roc12 < 0 ? "Negative" : "Flat"}
                                        tone={signColor(indicators?.roc12)}
                                    />

                                    <IndicatorTile
                                        name="MACD (Line / Signal / Hist)"
                                        hint="Momentum + crossovers"
                                        value={`${fmtNum(indicators?.macdLine, 3)} / ${fmtNum(indicators?.macdSignal, 3)} / ${fmtNum(indicators?.macdHistogram, 3)}`}
                                        right={macdLabel}
                                        tone={macdHist > 0 ? "text-emerald-400" : macdHist < 0 ? "text-red-400" : "text-slate-300"}
                                    />
                                </div>
                            </div>

                            {/* Volatility */}
                            <div>
                                <div className="text-slate-300 font-semibold mb-3">Volatility</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <IndicatorTile
                                        name="ATR (14)"
                                        hint="Average True Range"
                                        value={fmtNum(indicators?.atr14, 2)}
                                        right={`${fmtNum(indicators?.atr14Pct, 4)}%`}
                                        tone="text-slate-300"
                                    />
                                    <IndicatorTile
                                        name="Realized Vol (20)"
                                        hint="20-period realized volatility"
                                        value={fmtNum(indicators?.realizedVol20, 6)}
                                        right={classification?.volatility ?? "—"}
                                        tone={classification?.volatility === "low" ? "text-emerald-400" : "text-slate-300"}
                                    />
                                    <IndicatorTile
                                        name="Donchian Width (20)"
                                        hint="Breakout range width"
                                        value={fmtNum(indicators?.donchianWidth20, 6)}
                                    />
                                    <IndicatorTile
                                        name="VWAP"
                                        hint="Volume-weighted average price"
                                        value={fmtMoney(indicators?.vwap, 3)}
                                        right={
                                            meta?.lastPrice > indicators?.vwap ? "Above VWAP" : "Below VWAP"
                                        }
                                        tone={meta?.lastPrice > indicators?.vwap ? "text-emerald-400" : "text-red-400"}
                                    />
                                </div>
                            </div>

                            {/* Bands & Volume */}
                            <div>
                                <div className="text-slate-300 font-semibold mb-3">Bands & Volume</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <IndicatorTile
                                        name="Bollinger Upper"
                                        hint="Upper band (20, 2σ)"
                                        value={fmtMoney(indicators?.bollingerUpper, 3)}
                                    />
                                    <IndicatorTile
                                        name="Bollinger Lower"
                                        hint="Lower band (20, 2σ)"
                                        value={fmtMoney(indicators?.bollingerLower, 3)}
                                    />
                                    <IndicatorTile
                                        name="Bollinger Width"
                                        hint="Band width (relative)"
                                        value={fmtNum(indicators?.bollingerWidth, 6)}
                                        right={classification?.volatility ?? "—"}
                                        tone={classification?.volatility === "low" ? "text-emerald-400" : "text-slate-300"}
                                    />
                                    <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-slate-300 text-sm">Bollinger %B</div>
                                                <div className="text-slate-400 text-xs mt-0.5">Where price sits within bands</div>
                                            </div>
                                            <div className="text-slate-200 font-semibold tabular-nums">
                                                {fmtNum(indicators?.bollingerPctB, 3)}
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <Progress value={(indicators?.bollingerPctB ?? 0) * 100} min={0} max={100} goodAbove={50} />
                                            <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                                                <span>Lower</span>
                                                <span>Mid</span>
                                                <span>Upper</span>
                                            </div>
                                        </div>
                                    </div>

                                    <IndicatorTile
                                        name="OBV"
                                        hint="On-balance volume"
                                        value={fmtNum(indicators?.obv, 2)}
                                        right={indicators?.obv > 0 ? "Accumulation" : indicators?.obv < 0 ? "Distribution" : "Flat"}
                                        tone={signColor(indicators?.obv)}
                                    />
                                    <IndicatorTile
                                        name="Bollinger Mid (SMA20)"
                                        hint="Middle band"
                                        value={fmtMoney(indicators?.bollingerMid, 3)}
                                    />
                                </div>
                            </div>
                        </div>
                    </Section>
                </div>
            </div>
        </div>
    );
}