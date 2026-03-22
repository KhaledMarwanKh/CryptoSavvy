import { BINANCE_BASE } from "../data/constants";
import { formatAxisTime } from "../utils/formattor";

export async function getBinanceMarketData(symbol = "BTCUSDT") {
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
export async function getBinanceOHLC(symbol = "BTCUSDT", interval = "1h", limit = 120) {
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

export async function getMarketSentiment() {
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
