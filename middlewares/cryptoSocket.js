const WebSocket = require("ws");
const axios = require("axios");

// ==================== CONSTANTS ====================

const BROADCAST_INTERVAL_MS = 5000;
const MARKET_CAP_UPDATE_INTERVAL = 5 * 60 * 1000;
const SNAPSHOT_COOLDOWN = 1500;

const CRYPTO_SYMBOLS = [
  "btcusdt",
  "ethusdt",
  "solusdt",
  "adausdt",
  "xrpusdt",
  "bnbusdt",
  "dogeusdt",
  "avaxusdt",
];

const SYMBOL_INDEX_MAP = Object.fromEntries(
  CRYPTO_SYMBOLS.map((s, i) => [s.toUpperCase(), i + 1])
);

const COINGECKO_MAP = {
  BTCUSDT: "bitcoin",
  ETHUSDT: "ethereum",
  SOLUSDT: "solana",
  ADAUSDT: "cardano",
  XRPUSDT: "ripple",
  BNBUSDT: "binancecoin",
  DOGEUSDT: "dogecoin",
  AVAXUSDT: "avalanche-2",
};

// ==================== STATE ====================

const marketData = {};
const reloadState = {};

// 🔒 ADDITION (1): ترتيب ثابت للداشبورد
let DASHBOARD_ORDER = null;
let dashboardLocked = false;

// ==================== HELPERS ====================

function applyDepthUpdate(book, update) {
  const updateBook = (side, items) => {
    items.forEach(([price, qty]) => {
      const p = parseFloat(price);
      const q = parseFloat(qty);
      if (q === 0) {
        book[side] = book[side].filter(x => x.price !== p);
      } else {
        const existing = book[side].find(x => x.price === p);
        if (existing) existing.quantity = q;
        else book[side].push({ price: p, quantity: q });
      }
    });
    book[side].sort((a, b) =>
      side === "bids" ? b.price - a.price : a.price - b.price
    );
    book[side] = book[side].slice(0, 20);
  };

  updateBook("bids", update.b || []);
  updateBook("asks", update.a || []);
}

// ==================== SNAPSHOT ====================

async function loadCryptoSnapshot(symLower) {
  const symbol = symLower.toUpperCase();
  reloadState[symbol] ??= { reloading: false, lastAttempt: 0 };

  const now = Date.now();
  if (
    reloadState[symbol].reloading ||
    now - reloadState[symbol].lastAttempt < SNAPSHOT_COOLDOWN
  ) return;

  reloadState[symbol].reloading = true;
  reloadState[symbol].lastAttempt = now;

  try {
    const res = await axios.get(
      "https://api.binance.com/api/v3/depth",
      { params: { symbol, limit: 1000 } }
    );

    marketData[symbol] = {
      ...(marketData[symbol] || {}),
      symbol,
      orderBook: {
        lastUpdateId: res.data.lastUpdateId,
        bids: res.data.bids.map(([p, q]) => ({
          price: +p,
          quantity: +q,
        })).slice(0, 20),
        asks: res.data.asks.map(([p, q]) => ({
          price: +p,
          quantity: +q,
        })).slice(0, 20),
        buffer: [],
      },
    };
  } finally {
    setTimeout(() => (reloadState[symbol].reloading = false), 300);
  }
}

// ==================== MARKET CAP ====================

async function updateCryptoMarketCap() {
  try {
    const ids = Object.values(COINGECKO_MAP).join(",");
    const res = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      { params: { vs_currency: "usd", ids } }
    );

    res.data.forEach(item => {
      const entry = Object.entries(COINGECKO_MAP)
        .find(([_, id]) => id === item.id);
      if (!entry) return;

      const [symbol] = entry;

      marketData[symbol] = {
        ...(marketData[symbol] || {}),
        marketCap: item.market_cap,
        circulatingSupply: item.circulating_supply,
        cg_last_updated: item.last_updated,
        coin: {
          symbol: item.symbol.toUpperCase(),
          logo: item.image,
        },
      };
    });

    // 🔒 ADDITION (2): قفل ترتيب الداشبورد مرة واحدة فقط
    if (!dashboardLocked) {
      const allReady = CRYPTO_SYMBOLS.every(
        s => marketData[s.toUpperCase()]?.marketCap
      );

      if (allReady) {
        DASHBOARD_ORDER = CRYPTO_SYMBOLS
          .map(s => s.toUpperCase())
          .sort(
            (a, b) =>
              (marketData[b].marketCap || 0) -
              (marketData[a].marketCap || 0)
          );

        dashboardLocked = true;
        console.log("📌 Dashboard order locked");
      }
    }
  } catch (err) {
    console.error("MarketCap error:", err.message);
  }
}

// ==================== MAIN ====================

function startCryptoSocket(io, userSubscriptions) {
  const streams = [
    ...CRYPTO_SYMBOLS.map(s => `${s}@ticker`),
    ...CRYPTO_SYMBOLS.map(s => `${s}@depth@100ms`),
  ].join("/");

  const ws = new WebSocket(
    `wss://stream.binance.com:9443/stream?streams=${streams}`
  );

  ws.on("message", raw => {
    const msg = JSON.parse(raw);
    if (!msg?.data) return;

    const symbol = msg.data.s;
    if (!symbol) return;

    if (msg.stream.includes("@ticker")) {
      marketData[symbol] ??= {};
      Object.assign(marketData[symbol], {
        symbol,
        price: +msg.data.c,
        high24h: +msg.data.h,
        low24h: +msg.data.l,
        volume: +msg.data.v,
        changePercent: +msg.data.P,
        lastTickerUpdate: new Date().toISOString(),
      });
    }

    if (msg.stream.includes("@depth")) {
      const book = marketData[symbol]?.orderBook;
      if (!book) return;

      book.buffer.push(msg.data);

      if (book.lastUpdateId) {
        const { U, u } = msg.data;
        if (u > book.lastUpdateId && U <= book.lastUpdateId + 1) {
          applyDepthUpdate(book, msg.data);
          book.lastUpdateId = u;
        }
      }
    }
  });

  // ==================== BROADCAST (كما كان + تعديل بسيط) ====================

  setInterval(() => {
    const toSend = {};
    for (const sym in marketData) {
      toSend[sym] = marketData[sym];
    }

    for (const [socketId, user] of Object.entries(userSubscriptions)) {
      const { mode = "dashboard", page = 1, pageSize = 5, symbols = [] } = user;

      // ================= DASHBOARD =================
      if (mode === "dashboard") {
        const list = dashboardLocked
          ? DASHBOARD_ORDER
          : CRYPTO_SYMBOLS.map(s => s.toUpperCase());

        const start = (page - 1) * pageSize;
        const end = start + pageSize;

        const payload = {};

        list.slice(start, end).forEach((symbol, i) => {
          const d = toSend[symbol];
          if (!d) return;

          payload[symbol] = {
            meta: {
              index: start + i + 1,
              symbol,
              baseSymbol: d.coin?.symbol,
              logo: d.coin?.logo,
              price: d.price,
              high24h: d.high24h,
              low24h: d.low24h,
              volume: d.volume,
              changePercent: d.changePercent,
              marketCap: d.marketCap,
              lastUpdate: d.lastTickerUpdate || d.cg_last_updated,
            },
          };
        });

        if (Object.keys(payload).length) {
          io.to(socketId).emit("cryptoData", payload);
        }
      }

      // ================= CHART (كما كان بدون أي تغيير) =================
      else if (mode === "chart") {
        const payload = {};
        symbols.map(s => s.toUpperCase()).forEach(sym => {
          const d = marketData[sym];
          if (!d) return;

          payload[sym] = {
            meta: {
              symbol: sym,
              baseSymbol: d.coin?.symbol,
              logo: d.coin?.logo,
              price: d.price,
              high24h: d.high24h,
              low24h: d.low24h,
              volume: d.volume,
              changePercent: d.changePercent,
              marketCap: d.marketCap,
              circulatingSupply: d.circulatingSupply,
              lastUpdate: d.lastTickerUpdate || d.cg_last_updated,
            },
            orderBook: d.orderBook
              ? {
                  bids: d.orderBook.bids.slice(0, 20),
                  asks: d.orderBook.asks.slice(0, 20),
                }
              : null,
          };
        });

        if (Object.keys(payload).length) {
          io.to(socketId).emit("cryptoData", payload);
        }
      }
  // ================= ALL (NEW MODE) =================
else if (mode === "all") {
  const list = dashboardLocked
    ? DASHBOARD_ORDER
    : CRYPTO_SYMBOLS.map(s => s.toUpperCase());

  const payload = {};

  list.forEach((symbol, i) => {
    const d = toSend[symbol];
    if (!d) return;

    payload[symbol] = {
      meta: {
        index: i + 1,
        symbol,
        baseSymbol: d.coin?.symbol,
        logo: d.coin?.logo,
        price: d.price,
        high24h: d.high24h,
        low24h: d.low24h,
        volume: d.volume,
        changePercent: d.changePercent,
        marketCap: d.marketCap,
        circulatingSupply: d.circulatingSupply,
        lastUpdate: d.lastTickerUpdate || d.cg_last_updated,
      },
      orderBook: d.orderBook
        ? {
            bids: d.orderBook.bids.slice(0, 20),
            asks: d.orderBook.asks.slice(0, 20),
          }
        : null,
    };
  });

  if (Object.keys(payload).length) {
    io.to(socketId).emit("cryptoData", payload);
  }
}    
    }
  }, BROADCAST_INTERVAL_MS);

  // ==================== INIT ====================

  CRYPTO_SYMBOLS.forEach(loadCryptoSnapshot);
  updateCryptoMarketCap();
  setInterval(updateCryptoMarketCap, MARKET_CAP_UPDATE_INTERVAL);

  console.log("✅ Crypto socket started");
}

module.exports = { startCryptoSocket };
