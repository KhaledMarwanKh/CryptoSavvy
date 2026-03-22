import { useTranslation } from "react-i18next"
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
    const { i18n, t } = useTranslation();
    const { meta, classification, market, indicators } = data;

    const rsi = indicators?.rsi14;
    const stochK = indicators?.stochasticK14;
    const willR = indicators?.williamsR14;
    const adx = indicators?.adx14;
    const macdHist = indicators?.macdHistogram;
    const slope = indicators?.linRegSlope20;

    const rsiLabel =
        rsi >= 70 ? t("analyzeSection.states.overbought") : rsi <= 30 ? t("analyzeSection.states.oversold") : t("analyzeSection.states.neutral");
    const stochLabel =
        stochK >= 80 ? t("analyzeSection.states.overbought") : stochK <= 20 ? t("analyzeSection.states.oversold") : t("analyzeSection.states.neutral");
    const willLabel =
        willR >= -20 ? t("analyzeSection.states.overbought") : willR <= -80 ? t("analyzeSection.states.oversold") : t("analyzeSection.states.neutral");

    const adxLabel = adx >= 25 ? t("analyzeSection.states.trending") : adx >= 20 ? t("analyzeSection.states.developing") : t("analyzeSection.states.weakTrend");

    const macdLabel =
        macdHist > 0 ? t("analyzeSection.states.bullishMomentum") : macdHist < 0 ? t("analyzeSection.states.bearishMomentum") : t("analyzeSection.states.flat");

    const slopeLabel = slope > 0 ? t("analyzeSection.states.upwardBias") : slope < 0 ? t("analyzeSection.states.downwardBias") : t("analyzeSection.states.flat");

    return (
        <div className="min-h-screen w-full">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Top grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Classification */}
                    <Section title={t("analyzeSection.classification.title")} subtitle={t("analyzeSection.classification.subtitle")}>
                        <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1.5 rounded-full text-sm ${pillTone(scoreToTone(classification?.trend))}`}>
                                {t("analyzeSection.classification.trend")}: <span className="font-semibold">{classification?.trend ?? "—"}</span>
                            </span>
                            <span className={`px-3 py-1.5 rounded-full text-sm ${pillTone(scoreToTone(classification?.trendStrength))}`}>
                                {t("analyzeSection.classification.strength")}: <span className="font-semibold">{classification?.trendStrength ?? "—"}</span>
                            </span>
                            <span className={`px-3 py-1.5 rounded-full text-sm ${pillTone(scoreToTone(classification?.volatility))}`}>
                                {t("analyzeSection.classification.volatility")}: <span className="font-semibold">{classification?.volatility ?? "—"}</span>
                            </span>
                            <span className={`px-3 py-1.5 rounded-full text-sm ${pillTone(scoreToTone(classification?.liquidity))}`}>
                                {t("analyzeSection.classification.liquidity")}: <span className="font-semibold">{classification?.liquidity ?? "—"}</span>
                            </span>
                            <span className={`px-3 py-1.5 rounded-full text-sm ${pillTone("neutral")}`}>
                                {t("analyzeSection.classification.momentum")}: <span className="font-semibold">{classification?.momentum ?? "—"}</span>
                            </span>
                        </div>

                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                <div className="text-slate-300 text-sm">{t("analyzeSection.classification.spread")}</div>
                                <div className="mt-2 flex items-baseline justify-between gap-4">
                                    <div className="text-slate-200 text-xl font-semibold tabular-nums">
                                        {fmtNum(market?.spreadAbs, 2)}
                                    </div>
                                    <div className="text-slate-400 text-sm tabular-nums">
                                        {fmtPctFromRatio(market?.spreadPct, 6)}
                                    </div>
                                </div>
                                <div className="mt-3 text-slate-400 text-xs">
                                    {t("analyzeSection.classification.bestBid")} {fmtMoney(market?.orderBook?.bestBid, 2)} • {t("analyzeSection.classification.bestAsk")}{" "}
                                    {fmtMoney(market?.orderBook?.bestAsk, 2)}
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                <div className="text-slate-300 text-sm">{t("analyzeSection.classification.orderBookImbalance")}</div>
                                <div className="mt-2 flex items-baseline justify-between gap-4">
                                    <div className="text-slate-200 text-xl font-semibold tabular-nums">
                                        {fmtNum(market?.orderBook?.bookImbalance, 3)}
                                    </div>
                                    <div className={`text-sm font-semibold ${market?.orderBook?.bookImbalance >= 0.5 ? "text-emerald-400" : "text-red-400"}`}>
                                        {market?.orderBook?.bookImbalance >= 0.5 ? t("analyzeSection.classification.bidHeavy") : t("analyzeSection.classification.askHeavy")}
                                    </div>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-400">
                                    <div>
                                        {t("analyzeSection.classification.bidNotional")}{" "}
                                        <span className="text-slate-300 tabular-nums">
                                            {fmtMoney(market?.orderBook?.bidNotional, 2)}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        {t("analyzeSection.classification.askNotional")}{" "}
                                        <span className="text-slate-300 tabular-nums">
                                            {fmtMoney(market?.orderBook?.askNotional, 2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* 24h */}
                    <Section title={t("analyzeSection.last24h.title")} subtitle={t("analyzeSection.last24h.subtitle")}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                <div className="text-slate-400 text-xs">{t("analyzeSection.last24h.change")}</div>
                                <div className={`mt-1 text-xl font-semibold tabular-nums ${signColor(market?.last24h?.priceChangePercent)}`}>
                                    {fmtPct(market?.last24h?.priceChangePercent, 3)}
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                <div className="text-slate-400 text-xs">{t("analyzeSection.last24h.trades")}</div>
                                <div className="mt-1 text-xl font-semibold tabular-nums text-slate-200">
                                    {fmtInt(market?.last24h?.trades)}
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                <div className="text-slate-400 text-xs">{t("analyzeSection.last24h.highLow")}</div>
                                <div className="mt-1 text-sm text-slate-200 tabular-nums">
                                    {fmtMoney(market?.last24h?.highPrice, 2)}{" "}
                                    <span className="text-slate-400">/</span>{" "}
                                    {fmtMoney(market?.last24h?.lowPrice, 2)}
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                <div className="text-slate-400 text-xs">{t("analyzeSection.last24h.volume")}</div>
                                <div className="mt-1 text-sm text-slate-200 tabular-nums">
                                    {fmtMoney(market?.last24h?.quoteVolume, 0)}{" "}
                                    <span className="text-slate-400">/</span>{" "}
                                    {fmtMoney(market?.last24h?.baseVolume, 2)}
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* Key takeaways */}
                    <Section title={t("analyzeSection.quickRead.title")} subtitle={t("analyzeSection.quickRead.subtitle")}>
                        <div className="space-y-4">
                            <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-slate-300 text-sm">{t("analyzeSection.quickRead.rsi")}</div>
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
                                <div className="mt-2 text-slate-400 text-xs">{t("analyzeSection.quickRead.rsiHint")}</div>
                            </div>

                            <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-slate-300 text-sm">{t("analyzeSection.quickRead.adx")}</div>
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
                                <div className="mt-2 text-slate-400 text-xs">{t("analyzeSection.quickRead.adxHint")}</div>
                            </div>

                            <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-slate-300 text-sm">{t("analyzeSection.quickRead.macdHistogram")}</div>
                                    <div className={`text-sm font-semibold ${macdHist > 0 ? "text-emerald-400" : macdHist < 0 ? "text-red-400" : "text-slate-300"}`}>
                                        {macdLabel}
                                    </div>
                                </div>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <div className={`text-slate-200 text-xl font-semibold tabular-nums ${signColor(macdHist)}`}>
                                        {fmtNum(macdHist, 4)}
                                    </div>
                                    <div className="text-slate-400 text-xs">
                                        {t("analyzeSection.quickRead.macdLine")} {fmtNum(indicators?.macdLine, 3)} • {t("analyzeSection.quickRead.macdSignal")} {fmtNum(indicators?.macdSignal, 3)}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-slate-300 text-sm">{t("analyzeSection.quickRead.linearReg")}</div>
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
                        title={t("analyzeSection.indicators.title")}
                    >
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            {/* Trend & Averages */}
                            <div>
                                <div className="text-slate-300 font-semibold mb-3">{t("analyzeSection.indicators.trendAverages")}</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <IndicatorTile
                                        name={t("analyzeSection.indicatorTiles.sma20.name")}
                                        hint={t("analyzeSection.indicatorTiles.sma20.hint")}
                                        value={fmtMoney(indicators?.sma20, 3)}
                                        right={indicators?.sma20 > meta?.lastPrice ? t("analyzeSection.states.abovePrice") : t("analyzeSection.states.belowPrice")}
                                        tone={indicators?.sma20 > meta?.lastPrice ? "text-red-400" : "text-emerald-400"}
                                    />
                                    <IndicatorTile
                                        name={t("analyzeSection.indicatorTiles.sma50.name")}
                                        hint={t("analyzeSection.indicatorTiles.sma50.hint")}
                                        value={fmtMoney(indicators?.sma50, 3)}
                                        right={indicators?.sma50 > meta?.lastPrice ? t("analyzeSection.states.abovePrice") : t("analyzeSection.states.belowPrice")}
                                        tone={indicators?.sma50 > meta?.lastPrice ? "text-red-400" : "text-emerald-400"}
                                    />
                                    <IndicatorTile
                                        name={t("analyzeSection.indicatorTiles.ema20.name")}
                                        hint={t("analyzeSection.indicatorTiles.ema20.hint")}
                                        value={fmtMoney(indicators?.ema20, 3)}
                                        right={indicators?.ema20 > meta?.lastPrice ? t("analyzeSection.states.abovePrice") : t("analyzeSection.states.belowPrice")}
                                        tone={indicators?.ema20 > meta?.lastPrice ? "text-red-400" : "text-emerald-400"}
                                    />
                                    <IndicatorTile
                                        name={t("analyzeSection.indicatorTiles.ema50.name")}
                                        hint={t("analyzeSection.indicatorTiles.ema50.hint")}
                                        value={fmtMoney(indicators?.ema50, 3)}
                                        right={indicators?.ema50 > meta?.lastPrice ? t("analyzeSection.states.abovePrice") : t("analyzeSection.states.belowPrice")}
                                        tone={indicators?.ema50 > meta?.lastPrice ? "text-red-400" : "text-emerald-400"}
                                    />

                                    <IndicatorTile
                                        name={t("analyzeSection.indicatorTiles.adx.name")}
                                        hint={t("analyzeSection.indicatorTiles.adx.hint")}
                                        value={fmtNum(indicators?.adx14, 2)}
                                        right={adxLabel}
                                        tone={adx >= 25 ? "text-emerald-400" : "text-slate-300"}
                                    />
                                    <IndicatorTile
                                        name={t("analyzeSection.indicatorTiles.di.name")}
                                        hint={t("analyzeSection.indicatorTiles.di.hint")}
                                        value={`${fmtNum(indicators?.plusDI14, 2)} / ${fmtNum(indicators?.minusDI14, 2)}`}
                                        right={
                                            indicators?.plusDI14 > indicators?.minusDI14 ? t("analyzeSection.states.bullish") : t("analyzeSection.states.bearish")
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
                                <div className="text-slate-300 font-semibold mb-3">{t("analyzeSection.indicators.momentum")}</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4 sm:col-span-2">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="text-slate-300 text-sm">{t("analyzeSection.indicatorTiles.rsi.name")}</div>
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
                                                <div className="text-slate-300 text-sm">{t("analyzeSection.indicatorTiles.stochastic.name")}</div>
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
                                                <div className="text-slate-300 text-sm">{t("analyzeSection.indicatorTiles.williamsR.name")}</div>
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
                                        name={t("analyzeSection.indicatorTiles.roc.name")}
                                        hint={t("analyzeSection.indicatorTiles.roc.hint")}
                                        value={fmtNum(indicators?.roc12, 4)}
                                        right={indicators?.roc12 > 0 ? t("analyzeSection.states.positive") : indicators?.roc12 < 0 ? t("analyzeSection.states.negative") : t("analyzeSection.states.flat")}
                                        tone={signColor(indicators?.roc12)}
                                    />

                                    <IndicatorTile
                                        name={t("analyzeSection.indicatorTiles.macd.name")}
                                        hint={t("analyzeSection.indicatorTiles.macd.hint")}
                                        value={`${fmtNum(indicators?.macdLine, 3)} / ${fmtNum(indicators?.macdSignal, 3)} / ${fmtNum(indicators?.macdHistogram, 3)}`}
                                        right={macdLabel}
                                        tone={macdHist > 0 ? "text-emerald-400" : macdHist < 0 ? "text-red-400" : "text-slate-300"}
                                    />
                                </div>
                            </div>

                            {/* Volatility */}
                            <div>
                                <div className="text-slate-300 font-semibold mb-3">{t("analyzeSection.indicators.volatility")}</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <IndicatorTile
                                        name={t("analyzeSection.indicatorTiles.atr.name")}
                                        hint={t("analyzeSection.indicatorTiles.atr.hint")}
                                        value={fmtNum(indicators?.atr14, 2)}
                                        right={`${fmtNum(indicators?.atr14Pct, 4)}%`}
                                        tone="text-slate-300"
                                    />
                                    <IndicatorTile
                                        name={t("analyzeSection.indicatorTiles.realizedVol.name")}
                                        hint={t("analyzeSection.indicatorTiles.realizedVol.hint")}
                                        value={fmtNum(indicators?.realizedVol20, 6)}
                                        right={classification?.volatility ?? "—"}
                                        tone={classification?.volatility === "low" ? "text-emerald-400" : "text-slate-300"}
                                    />
                                    <IndicatorTile
                                        name={t("analyzeSection.indicatorTiles.donchian.name")}
                                        hint={t("analyzeSection.indicatorTiles.donchian.hint")}
                                        value={fmtNum(indicators?.donchianWidth20, 6)}
                                    />
                                    <IndicatorTile
                                        name={t("analyzeSection.indicatorTiles.vwap.name")}
                                        hint={t("analyzeSection.indicatorTiles.vwap.hint")}
                                        value={fmtMoney(indicators?.vwap, 3)}
                                        right={
                                            meta?.lastPrice > indicators?.vwap ? t("analyzeSection.states.aboveVWAP") : t("analyzeSection.states.belowVWAP")
                                        }
                                        tone={meta?.lastPrice > indicators?.vwap ? "text-emerald-400" : "text-red-400"}
                                    />
                                </div>
                            </div>

                            {/* Bands & Volume */}
                            <div>
                                <div className="text-slate-300 font-semibold mb-3">{t("analyzeSection.indicators.bandsVolume")}</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <IndicatorTile
                                        name={t("analyzeSection.indicatorTiles.bollingerUpper.name")}
                                        hint={t("analyzeSection.indicatorTiles.bollingerUpper.hint")}
                                        value={fmtMoney(indicators?.bollingerUpper, 3)}
                                    />
                                    <IndicatorTile
                                        name={t("analyzeSection.indicatorTiles.bollingerLower.name")}
                                        hint={t("analyzeSection.indicatorTiles.bollingerLower.hint")}
                                        value={fmtMoney(indicators?.bollingerLower, 3)}
                                    />
                                    <IndicatorTile
                                        name={t("analyzeSection.indicatorTiles.bollingerWidth.name")}
                                        hint={t("analyzeSection.indicatorTiles.bollingerWidth.hint")}
                                        value={fmtNum(indicators?.bollingerWidth, 6)}
                                        right={classification?.volatility ?? "—"}
                                        tone={classification?.volatility === "low" ? "text-emerald-400" : "text-slate-300"}
                                    />
                                    <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-slate-300 text-sm">{t("analyzeSection.indicatorTiles.bollingerPctB.name")}</div>
                                                <div className="text-slate-400 text-xs mt-0.5">{t("analyzeSection.indicatorTiles.bollingerPctB.hint")}</div>
                                            </div>
                                            <div className="text-slate-200 font-semibold tabular-nums">
                                                {fmtNum(indicators?.bollingerPctB, 3)}
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <Progress value={(indicators?.bollingerPctB ?? 0) * 100} min={0} max={100} goodAbove={50} />
                                            <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                                                <span>{t("analyzeSection.scale.lower")}</span>
                                                <span>{t("analyzeSection.scale.mid")}</span>
                                                <span>{t("analyzeSection.scale.upper")}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <IndicatorTile
                                        name={t("analyzeSection.indicatorTiles.obv.name")}
                                        hint={t("analyzeSection.indicatorTiles.obv.hint")}
                                        value={fmtNum(indicators?.obv, 2)}
                                        right={indicators?.obv > 0 ? t("analyzeSection.states.accumulation") : indicators?.obv < 0 ? t("analyzeSection.states.distribution") : t("analyzeSection.states.flat")}
                                        tone={signColor(indicators?.obv)}
                                    />
                                    <IndicatorTile
                                        name={t("analyzeSection.indicatorTiles.bollingerMid.name")}
                                        hint={t("analyzeSection.indicatorTiles.bollingerMid.hint")}
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