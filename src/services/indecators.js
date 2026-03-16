async function analyzeCoinBinance({
    symbol = "BTCUSDT",
    interval = "1h",
    limit = 500,        // 200–1000 is typical; more candles = better indicators
    quoteDepth = 50,    // order book depth levels to sum for liquidity
} = {}) {
    // ---------- helpers ----------
    const BASE = "https://api.binance.com";

    const fetchJSON = async (url) => {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`Binance HTTP ${r.status}: ${await r.text()}`);
        return r.json();
    };

    const sma = (arr, p) => {
        const out = new Array(arr.length).fill(null);
        let sum = 0;
        for (let i = 0; i < arr.length; i++) {
            sum += arr[i];
            if (i >= p) sum -= arr[i - p];
            if (i >= p - 1) out[i] = sum / p;
        }
        return out;
    };

    const ema = (arr, p) => {
        const out = new Array(arr.length).fill(null);
        const k = 2 / (p + 1);
        let prev = null;
        for (let i = 0; i < arr.length; i++) {
            const v = arr[i];
            if (prev === null) {
                // seed with SMA of first p values when possible
                if (i === p - 1) {
                    const seed = arr.slice(0, p).reduce((a, b) => a + b, 0) / p;
                    prev = seed;
                    out[i] = prev;
                }
            } else {
                prev = v * k + prev * (1 - k);
                out[i] = prev;
            }
        }
        return out;
    };

    const stddev = (arr, p) => {
        const out = new Array(arr.length).fill(null);
        for (let i = p - 1; i < arr.length; i++) {
            const w = arr.slice(i - p + 1, i + 1);
            const m = w.reduce((a, b) => a + b, 0) / p;
            const v = w.reduce((a, b) => a + (b - m) ** 2, 0) / p;
            out[i] = Math.sqrt(v);
        }
        return out;
    };

    const rsi = (closes, p = 14) => {
        const out = new Array(closes.length).fill(null);
        let avgGain = 0, avgLoss = 0;

        for (let i = 1; i < closes.length; i++) {
            const ch = closes[i] - closes[i - 1];
            const gain = Math.max(ch, 0);
            const loss = Math.max(-ch, 0);

            if (i <= p) {
                avgGain += gain;
                avgLoss += loss;
                if (i === p) {
                    avgGain /= p;
                    avgLoss /= p;
                    const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
                    out[i] = 100 - 100 / (1 + rs);
                }
            } else {
                avgGain = (avgGain * (p - 1) + gain) / p;
                avgLoss = (avgLoss * (p - 1) + loss) / p;
                const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
                out[i] = 100 - 100 / (1 + rs);
            }
        }
        return out;
    };

    const trueRange = (highs, lows, closes) => {
        const tr = new Array(closes.length).fill(null);
        for (let i = 0; i < closes.length; i++) {
            if (i === 0) {
                tr[i] = highs[i] - lows[i];
            } else {
                const hl = highs[i] - lows[i];
                const hc = Math.abs(highs[i] - closes[i - 1]);
                const lc = Math.abs(lows[i] - closes[i - 1]);
                tr[i] = Math.max(hl, hc, lc);
            }
        }
        return tr;
    };

    const atr = (highs, lows, closes, p = 14) => {
        const tr = trueRange(highs, lows, closes);
        const out = new Array(closes.length).fill(null);
        let prev = null;
        for (let i = 0; i < tr.length; i++) {
            const v = tr[i];
            if (i === p - 1) {
                const seed = tr.slice(0, p).reduce((a, b) => a + b, 0) / p;
                prev = seed;
                out[i] = prev;
            } else if (i >= p) {
                prev = (prev * (p - 1) + v) / p;
                out[i] = prev;
            }
        }
        return out;
    };

    const macd = (closes, fast = 12, slow = 26, signal = 9) => {
        const emaFast = ema(closes, fast);
        const emaSlow = ema(closes, slow);
        const macdLine = closes.map((_, i) =>
            emaFast[i] != null && emaSlow[i] != null ? (emaFast[i] - emaSlow[i]) : null
        );
        const macdClean = macdLine.map(v => v ?? 0);
        const signalLine = ema(macdClean, signal).map((v, i) => (macdLine[i] == null ? null : v));
        const hist = macdLine.map((v, i) =>
            v != null && signalLine[i] != null ? (v - signalLine[i]) : null
        );
        return { macdLine, signalLine, histogram: hist };
    };

    const roc = (closes, p = 12) => {
        const out = new Array(closes.length).fill(null);
        for (let i = p; i < closes.length; i++) {
            out[i] = ((closes[i] - closes[i - p]) / closes[i - p]) * 100;
        }
        return out;
    };

    const williamsR = (highs, lows, closes, p = 14) => {
        const out = new Array(closes.length).fill(null);
        for (let i = p - 1; i < closes.length; i++) {
            const hh = Math.max(...highs.slice(i - p + 1, i + 1));
            const ll = Math.min(...lows.slice(i - p + 1, i + 1));
            out[i] = hh === ll ? 0 : ((hh - closes[i]) / (hh - ll)) * -100;
        }
        return out;
    };

    const stochasticK = (highs, lows, closes, p = 14) => {
        const out = new Array(closes.length).fill(null);
        for (let i = p - 1; i < closes.length; i++) {
            const hh = Math.max(...highs.slice(i - p + 1, i + 1));
            const ll = Math.min(...lows.slice(i - p + 1, i + 1));
            out[i] = hh === ll ? 50 : ((closes[i] - ll) / (hh - ll)) * 100;
        }
        return out;
    };

    const adx = (highs, lows, closes, p = 14) => {
        // Wilder ADX
        const len = closes.length;
        const plusDM = new Array(len).fill(0);
        const minusDM = new Array(len).fill(0);
        const tr = trueRange(highs, lows, closes);

        for (let i = 1; i < len; i++) {
            const upMove = highs[i] - highs[i - 1];
            const downMove = lows[i - 1] - lows[i];
            plusDM[i] = (upMove > downMove && upMove > 0) ? upMove : 0;
            minusDM[i] = (downMove > upMove && downMove > 0) ? downMove : 0;
        }

        const smooth = (arr) => {
            const out = new Array(len).fill(null);
            let sum = 0;
            for (let i = 0; i < len; i++) {
                if (i < p) sum += arr[i];
                if (i === p - 1) out[i] = sum;
                if (i >= p) out[i] = out[i - 1] - (out[i - 1] / p) + arr[i];
            }
            return out;
        };

        const tr14 = smooth(tr);
        const pDM14 = smooth(plusDM);
        const mDM14 = smooth(minusDM);

        const pDI = new Array(len).fill(null);
        const mDI = new Array(len).fill(null);
        const dx = new Array(len).fill(null);

        for (let i = 0; i < len; i++) {
            if (tr14[i] == null || tr14[i] === 0) continue;
            pDI[i] = (pDM14[i] / tr14[i]) * 100;
            mDI[i] = (mDM14[i] / tr14[i]) * 100;
            dx[i] = (Math.abs(pDI[i] - mDI[i]) / (pDI[i] + mDI[i])) * 100;
        }

        // ADX = Wilder smoothing of DX
        const adxOut = new Array(len).fill(null);
        let adxSeedSum = 0;
        let seedCount = 0;
        for (let i = 0; i < len; i++) {
            if (dx[i] == null) continue;
            if (seedCount < p) {
                adxSeedSum += dx[i];
                seedCount++;
                if (seedCount === p) {
                    adxOut[i] = adxSeedSum / p;
                }
            } else {
                const prev = adxOut[i - 1];
                if (prev != null) adxOut[i] = ((prev * (p - 1)) + dx[i]) / p;
            }
        }

        return { adx: adxOut, plusDI: pDI, minusDI: mDI };
    };

    const bbands = (closes, p = 20, mult = 2) => {
        const mid = sma(closes, p);
        const sd = stddev(closes, p);
        const upper = closes.map((_, i) => (mid[i] != null ? mid[i] + mult * sd[i] : null));
        const lower = closes.map((_, i) => (mid[i] != null ? mid[i] - mult * sd[i] : null));
        const width = closes.map((_, i) =>
            upper[i] != null && mid[i] != null && mid[i] !== 0 ? (upper[i] - lower[i]) / mid[i] : null
        );
        const pctB = closes.map((c, i) =>
            upper[i] != null && lower[i] != null && (upper[i] - lower[i]) !== 0
                ? (c - lower[i]) / (upper[i] - lower[i])
                : null
        );
        return { mid, upper, lower, width, pctB };
    };

    const obv = (closes, volumes) => {
        const out = new Array(closes.length).fill(null);
        let v = 0;
        out[0] = 0;
        for (let i = 1; i < closes.length; i++) {
            if (closes[i] > closes[i - 1]) v += volumes[i];
            else if (closes[i] < closes[i - 1]) v -= volumes[i];
            out[i] = v;
        }
        return out;
    };

    const vwap = (highs, lows, closes, volumes) => {
        // Typical price VWAP over entire series (not session-based)
        const out = new Array(closes.length).fill(null);
        let cumPV = 0;
        let cumV = 0;
        for (let i = 0; i < closes.length; i++) {
            const tp = (highs[i] + lows[i] + closes[i]) / 3;
            cumPV += tp * volumes[i];
            cumV += volumes[i];
            out[i] = cumV === 0 ? null : (cumPV / cumV);
        }
        return out;
    };

    const linregSlope = (arr, p = 20) => {
        // slope per candle via least squares
        const out = new Array(arr.length).fill(null);
        const xs = Array.from({ length: p }, (_, i) => i + 1);
        const xMean = xs.reduce((a, b) => a + b, 0) / p;
        const denom = xs.reduce((a, x) => a + (x - xMean) ** 2, 0);

        for (let i = p - 1; i < arr.length; i++) {
            const w = arr.slice(i - p + 1, i + 1);
            const yMean = w.reduce((a, b) => a + b, 0) / p;
            let num = 0;
            for (let j = 0; j < p; j++) num += (xs[j] - xMean) * (w[j] - yMean);
            out[i] = num / denom;
        }
        return out;
    };

    const last = (arr) => {
        for (let i = arr.length - 1; i >= 0; i--) if (arr[i] != null) return arr[i];
        return null;
    };

    const pctChange = (a, b) => (b === 0 ? null : ((a - b) / b) * 100);

    // ---------- fetch data ----------
    const klinesUrl = `${BASE}/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${limit}`;
    const bookUrl = `${BASE}/api/v3/depth?symbol=${encodeURIComponent(symbol)}&limit=${quoteDepth}`;
    const ticker24hUrl = `${BASE}/api/v3/ticker/24hr?symbol=${encodeURIComponent(symbol)}`;

    const [klines, depth, t24] = await Promise.all([
        fetchJSON(klinesUrl),
        fetchJSON(bookUrl),
        fetchJSON(ticker24hUrl),
    ]);

    if (!Array.isArray(klines) || klines.length < 60) {
        throw new Error(`Not enough kline data returned. Got ${klines?.length}`);
    }

    // kline format: [ openTime, open, high, low, close, volume, closeTime, quoteAssetVolume, trades, takerBuyBase, takerBuyQuote, ignore ]
    const opens = klines.map(k => +k[1]);
    const highs = klines.map(k => +k[2]);
    const lows = klines.map(k => +k[3]);
    const closes = klines.map(k => +k[4]);
    const volumes = klines.map(k => +k[5]);
    const quoteVolumes = klines.map(k => +k[7]);
    const openTimes = klines.map(k => +k[0]);
    const closeTimes = klines.map(k => +k[6]);

    // ---------- 20 indicators ----------
    // 1 SMA20, 2 SMA50, 3 EMA20, 4 EMA50
    const SMA20 = sma(closes, 20);
    const SMA50 = sma(closes, 50);
    const EMA20 = ema(closes, 20);
    const EMA50 = ema(closes, 50);

    // 5 RSI14
    const RSI14 = rsi(closes, 14);

    // 6 MACD line, 7 MACD signal, 8 MACD histogram
    const MACD = macd(closes, 12, 26, 9);

    // 9 ATR14
    const ATR14 = atr(highs, lows, closes, 14);

    // 10 Bollinger width, 11 %B (also includes bands)
    const BB = bbands(closes, 20, 2);

    // 12 Stochastic %K (14)
    const STOCHK14 = stochasticK(highs, lows, closes, 14);

    // 13 Williams %R (14)
    const WILLR14 = williamsR(highs, lows, closes, 14);

    // 14 ROC12
    const ROC12 = roc(closes, 12);

    // 15 ADX14 (+DI/-DI included)
    const ADX = adx(highs, lows, closes, 14);

    // 16 OBV
    const OBV = obv(closes, volumes);

    // 17 VWAP (cumulative)
    const VWAP = vwap(highs, lows, closes, volumes);

    // 18 Realized volatility (stdev of log returns, 20)
    const logRets = closes.map((c, i) => (i === 0 ? 0 : Math.log(c / closes[i - 1])));
    const RV20 = stddev(logRets, 20); // per-candle log-return volatility

    // 19 Donchian channel width (20)
    const donchianWidth20 = closes.map((_, i) => {
        const p = 20;
        if (i < p - 1) return null;
        const hh = Math.max(...highs.slice(i - p + 1, i + 1));
        const ll = Math.min(...lows.slice(i - p + 1, i + 1));
        const mid = (hh + ll) / 2;
        return mid === 0 ? null : (hh - ll) / mid;
    });

    // 20 Linear regression slope (20) of close
    const LRSLOPE20 = linregSlope(closes, 20);

    // ---------- liquidity metrics (from order book + 24h) ----------
    const bids = (depth?.bids || []).map(([p, q]) => ({ price: +p, qty: +q }));
    const asks = (depth?.asks || []).map(([p, q]) => ({ price: +p, qty: +q }));

    const bestBid = bids.length ? bids[0].price : null;
    const bestAsk = asks.length ? asks[0].price : null;
    const midPrice = (bestBid != null && bestAsk != null) ? (bestBid + bestAsk) / 2 : closes[closes.length - 1];

    const spreadAbs = (bestBid != null && bestAsk != null) ? (bestAsk - bestBid) : null;
    const spreadPct = (spreadAbs != null && midPrice) ? (spreadAbs / midPrice) * 100 : null;

    const sumNotional = (levels) => levels.reduce((a, l) => a + l.price * l.qty, 0);
    const bidNotional = sumNotional(bids);
    const askNotional = sumNotional(asks);
    const bookImbalance = (bidNotional + askNotional) === 0 ? null : (bidNotional - askNotional) / (bidNotional + askNotional);

    // 24h metrics (Binance ticker24hr)
    const quoteVolume24h = +t24.quoteVolume;  // in quote asset (e.g., USDT)
    const volume24h = +t24.volume;           // in base asset
    const trades24h = +t24.count;

    // ---------- Trend / Volatility / Momentum labels ----------
    const close = closes[closes.length - 1];

    const sma20v = last(SMA20), sma50v = last(SMA50);
    const ema20v = last(EMA20), ema50v = last(EMA50);
    const adxv = last(ADX.adx);

    let trend = "sideways";
    if (ema20v != null && ema50v != null) {
        if (ema20v > ema50v && close > ema20v) trend = "uptrend";
        else if (ema20v < ema50v && close < ema20v) trend = "downtrend";
    }
    // trend strength from ADX
    let trendStrength = "weak";
    if (adxv != null) {
        if (adxv >= 25) trendStrength = "strong";
        else if (adxv >= 20) trendStrength = "moderate";
    }

    const atrv = last(ATR14);
    const atrPct = (atrv != null && close) ? (atrv / close) * 100 : null;

    let volatility = "normal";
    if (atrPct != null) {
        if (atrPct >= 3) volatility = "high";
        else if (atrPct <= 1) volatility = "low";
    }

    const rsiv = last(RSI14);
    const macdHist = last(MACD.histogram);
    const roc12v = last(ROC12);

    let momentum = "neutral";
    if (rsiv != null && macdHist != null) {
        if (rsiv > 55 && macdHist > 0) momentum = "bullish";
        else if (rsiv < 45 && macdHist < 0) momentum = "bearish";
    }

    // liquidity label (simple heuristic)
    let liquidity = "normal";
    if (spreadPct != null) {
        if (spreadPct < 0.02 && quoteVolume24h > 50_000_000) liquidity = "high";
        else if (spreadPct > 0.10 || quoteVolume24h < 2_000_000) liquidity = "low";
    }

    // ---------- build response ----------
    const response = {
        meta: {
            source: "Binance REST API",
            symbol,
            interval,
            limit,
            openTimeStart: new Date(openTimes[0]).toISOString(),
            closeTimeEnd: new Date(closeTimes[closeTimes.length - 1]).toISOString(),
            lastPrice: close,
            midPrice,
        },

        classification: {
            trend,
            trendStrength,     // based on ADX
            volatility,        // based on ATR%
            liquidity,         // based on spread + 24h quote volume
            momentum,          // based on RSI + MACD histogram
        },

        market: {
            spreadAbs,
            spreadPct,
            orderBook: {
                depthLevels: quoteDepth,
                bestBid,
                bestAsk,
                bidNotional,
                askNotional,
                bookImbalance, // -1..+1
            },
            last24h: {
                priceChangePercent: +t24.priceChangePercent,
                quoteVolume: quoteVolume24h,
                baseVolume: volume24h,
                trades: trades24h,
                highPrice: +t24.highPrice,
                lowPrice: +t24.lowPrice,
            },
        },

        indicators: {
            // Moving averages (Trend)
            sma20: sma20v,              // 1
            sma50: sma50v,              // 2
            ema20: ema20v,              // 3
            ema50: ema50v,              // 4

            // Momentum / Oscillators
            rsi14: rsiv,                // 5
            macdLine: last(MACD.macdLine),     // 6
            macdSignal: last(MACD.signalLine), // 7
            macdHistogram: macdHist,           // 8
            stochasticK14: last(STOCHK14),     // 12
            williamsR14: last(WILLR14),        // 13
            roc12: roc12v,                     // 14

            // Volatility
            atr14: atrv,                 // 9
            atr14Pct: atrPct,
            bollingerUpper: last(BB.upper),
            bollingerMid: last(BB.mid),
            bollingerLower: last(BB.lower),
            bollingerWidth: last(BB.width),    // 10
            bollingerPctB: last(BB.pctB),      // 11
            realizedVol20: last(RV20),         // 18

            // Trend strength
            adx14: adxv,                 // 15
            plusDI14: last(ADX.plusDI),
            minusDI14: last(ADX.minusDI),

            // Volume / Flow
            obv: last(OBV),              // 16
            vwap: last(VWAP),            // 17

            // Channels / Regression
            donchianWidth20: last(donchianWidth20), // 19
            linRegSlope20: last(LRSLOPE20),         // 20
        },

        notes: [
            "All indicators are computed from Binance klines (OHLCV).",
            "VWAP here is cumulative over the returned candles, not exchange session VWAP.",
            "Liquidity classification is heuristic; tune thresholds to your needs.",
        ],
    };

    return response;
}

export default analyzeCoinBinance;