const axios = require("axios");

// ==================== CONSTANTS ====================
const BROADCAST_INTERVAL_MS = 500;
const PRICE_UPDATE_INTERVAL = 2000; // Binance REST
const MARKET_CAP_UPDATE_INTERVAL = 5 * 60 * 1000;

const CRYPTO_SYMBOLS = [
  "btcusdt","ethusdt","solusdt","adausdt","xrpusdt",
  "bnbusdt","dogeusdt","avaxusdt","linkusdt","maticusdt","dotusdt",
];

const COINGECKO_MAP = {
  BTCUSDT: "bitcoin",
  ETHUSDT: "ethereum",
  SOLUSDT: "solana",
  ADAUSDT: "cardano",
  XRPUSDT: "ripple",
  BNBUSDT: "binancecoin",
  DOGEUSDT: "dogecoin",
  AVAXUSDT: "avalanche-2",
  LINKUSDT: "chainlink",
  MATICUSDT: "matic-network",
  DOTUSDT: "polkadot",
};

// ==================== MAIN ====================
async function startCryptoSocket(io, userSubscriptions) {
  const marketData = {};
  const changedSymbols = new Set();
  let lastBroadcast = 0;

  // ==================== BINANCE REST ====================
  async function updatePrices() {
    try {
      const res = await axios.get(
        "https://api.binance.com/api/v3/ticker/24hr",
        { timeout: 10000 }
      );

      res.data
        .filter(d => CRYPTO_SYMBOLS.includes(d.symbol.toLowerCase()))
        .forEach(d => {
          const symbol = d.symbol.toUpperCase();
          const prev = marketData[symbol]?.price;

          marketData[symbol] = {
            ...(marketData[symbol] || {}),
            symbol,
            price: +d.lastPrice,
            high24h: +d.highPrice,
            low24h: +d.lowPrice,
            volume: +d.volume,
            changePercent: +d.priceChangePercent,
            lastTickerUpdate: new Date().toISOString(),
          };

          if (prev !== marketData[symbol].price) {
            changedSymbols.add(symbol);
          }
        });
    } catch (err) {
      console.error("⚠️ Binance REST error:", err.message);
    }
  }

  // ==================== COINGECKO ====================
  async function updateMarketCap() {
    try {
      const ids = Object.values(COINGECKO_MAP).join(",");
      const res = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets",
        {
          params: { vs_currency: "usd", ids },
          timeout: 10000,
        }
      );

      res.data.forEach(item => {
        const entry = Object.entries(COINGECKO_MAP)
          .find(([_, id]) => id === item.id);
        if (!entry) return;

        const [symbol] = entry;
        marketData[symbol] = {
          ...(marketData[symbol] || {}),
          marketCap: item.market_cap ?? null,
          circulatingSupply: item.circulating_supply ?? null,
          totalSupply: item.total_supply ?? null,
          cg_last_updated: item.last_updated ?? null,
        };

        changedSymbols.add(symbol);
      });

      console.log("✅ Market cap updated");
    } catch (err) {
      console.error("⚠️ CoinGecko error:", err.message);
    }
  }

  // ==================== INIT ====================
  await updatePrices();
  await updateMarketCap();

  const priceTimer = setInterval(updatePrices, PRICE_UPDATE_INTERVAL);
  const capTimer = setInterval(updateMarketCap, MARKET_CAP_UPDATE_INTERVAL);

  // ==================== BROADCAST ====================
  const broadcaster = setInterval(() => {
    const now = Date.now();
    if (!changedSymbols.size || now - lastBroadcast < 1500) return;
    lastBroadcast = now;

    const toSend = {};
    for (const symbol of changedSymbols) {
      if (marketData[symbol]) {
        toSend[symbol] = marketData[symbol];
      }
    }

    for (const [socketId, userData] of Object.entries(userSubscriptions)) {
      try {
        const { mode, symbols = [], page = 1, pageSize = 5 } = userData || {};

        if (mode === "dashboard") {

  const sorted = Object.values(marketData)
    .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));

  const start = (page - 1) * pageSize;
  const paginated = sorted.slice(start, start + pageSize);

  const payload = {};

  paginated.forEach(d => {
    // نبث فقط إذا تغيّر أو أول مرة
    if (changedSymbols.has(d.symbol) || !lastBroadcast) {
      payload[d.symbol] = { meta: d };
    }
  });

  if (Object.keys(payload).length) {
    io.to(socketId).emit("cryptoData", payload);
  }
}
 else if (mode === "chart") {
  const normalized = symbols.map(s => s.toUpperCase());

  // إذا رمز واحد → ابعت object مفرد (مثل قبل)
  if (normalized.length === 1 && toSend[normalized[0]]) {
    const d = toSend[normalized[0]];
    io.to(socketId).emit("cryptoData", {
      symbol: d.symbol,
      high24h: d.high24h,
      low24h: d.low24h,
      volume: d.volume,
      changePercent: d.changePercent,
      marketCap: d.marketCap,
      circulatingSupply: d.circulatingSupply,
      price: d.price
    });
    return;
  }

  // أكثر من رمز
  const payload = {};
  normalized.forEach(s => {
    if (toSend[s]) {
      payload[s] = { meta: toSend[s] };
    }
  });

  if (Object.keys(payload).length) {
    io.to(socketId).emit("cryptoData", payload);
  }
} else {
          io.to(socketId).emit("cryptoData", toSend);
        }
      } catch (err) {
        console.error("⚠️ Emit error:", err.message);
      }
    }

    changedSymbols.clear();
  }, BROADCAST_INTERVAL_MS);

  // ==================== CLEANUP ====================
  return function stop() {
    clearInterval(priceTimer);
    clearInterval(capTimer);
    clearInterval(broadcaster);
    console.log("🛑 Crypto REST socket stopped");
  };
}

module.exports = { startCryptoSocket };
