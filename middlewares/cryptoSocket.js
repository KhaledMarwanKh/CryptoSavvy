const WebSocket = require("ws");
const axios = require("axios");

// ==================== CONSTANTS ====================

const BROADCAST_INTERVAL_MS = 500; // Interval for broadcasting updated data (milliseconds)
const MARKET_CAP_UPDATE_INTERVAL = 5 * 60 * 1000; // Interval for updating market cap from CoinGecko (5 minutes)
const SNAPSHOT_COOLDOWN = 1500; // Cooldown time between loading Order Book snapshots (milliseconds)
const RECONNECT_MAX_DELAY = 30000; // Maximum delay for WebSocket reconnection (milliseconds)
const RECONNECT_BASE_DELAY = 1000; // Base delay for reconnection (milliseconds)
const RECONNECT_MAX_ATTEMPTS = 6; // Maximum number of reconnection attempts

const CRYPTO_SYMBOLS = [
  // List of supported cryptocurrency symbols from Binance
  "btcusdt",
  "ethusdt",
  "solusdt",
  "adausdt",
  "xrpusdt",
  "bnbusdt",
  "dogeusdt",
  "avaxusdt"
  // "linkusdt",
  // "maticusdt",
  // "dotusdt",
];

const COINGECKO_MAP = {
  // Mapping of Binance symbols to CoinGecko API coin names
  BTCUSDT: "bitcoin",
  ETHUSDT: "ethereum",
  SOLUSDT: "solana",
  ADAUSDT: "cardano",
  XRPUSDT: "ripple",
  BNBUSDT: "binancecoin",
  DOGEUSDT: "dogecoin",
  AVAXUSDT: "avalanche-2"
  // LINKUSDT: "chainlink",
  // MATICUSDT: "matic-network",
  // DOTUSDT: "polkadot",
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Applies depth update to order book
 * @param {Object} book - Order book object
 * @param {Object} update - Update data from Binance
 */
function applyDepthUpdate(book, update) {
  const updateBook = (side, items) => {
    items.forEach(([price, qty]) => {
      const p = parseFloat(price);
      const q = parseFloat(qty);
      if (q === 0) {
        book[side] = book[side].filter((x) => x.price !== p);
      } else {
        const existing = book[side].find((x) => x.price === p);
        if (existing) {
          existing.quantity = q;
        } else {
          book[side].push({ price: p, quantity: q });
        }
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

// ==================== MAIN FUNCTION ====================

/**
 * Starts the crypto WebSocket connection and data broadcasting
 * @param {Object} io - Socket.io instance
 * @param {Object} userSubscriptions - User subscription data
 * @returns {Function} Stop function
 */
async function startCryptoSocket(io, userSubscriptions) {
  // State variables
  const marketData = {};
  const changedSymbols = new Set();
  const reloadState = {};
  let reconnectAttempts = 0;
  let socket = null;
  let shouldStop = false;
  let lastBroadcast = 0;

  // ==================== INNER FUNCTIONS ====================

  /**
   * Loads crypto snapshot from Binance
   * @param {string} symLower - Symbol in lowercase
   */
  async function loadCryptoSnapshot(symLower) {
    const symbol = symLower.toUpperCase();
    reloadState[symbol] = reloadState[symbol] || {
      reloading: false,
      lastAttempt: 0,
    };
    const now = Date.now();

    if (
      reloadState[symbol].reloading ||
      now - reloadState[symbol].lastAttempt < SNAPSHOT_COOLDOWN
    ) {
      return;
    }

    reloadState[symbol].reloading = true;
    reloadState[symbol].lastAttempt = now;

    try {
      const res = await axios.get("https://api.binance.com/api/v3/depth", {
        params: { symbol, limit: 1000 },
        timeout: 10000,
      });

      const { bids, asks, lastUpdateId } = res.data;

      marketData[symbol] = {
        ...(marketData[symbol] || {}),
        symbol,
        orderBook: {
          lastUpdateId,
          bids: bids
            .map(([p, q]) => ({
              price: parseFloat(p),
              quantity: parseFloat(q),
            }))
            .slice(0, 20),
          asks: asks
            .map(([p, q]) => ({
              price: parseFloat(p),
              quantity: parseFloat(q),
            }))
            .slice(0, 20),
          buffer: [],
        },
      };

      console.log(`📥 Snapshot loaded for ${symbol}`);
      changedSymbols.add(symbol);
    } catch (err) {
      console.error(`❌ Error loading snapshot for ${symbol}:`, err.message);
    } finally {
      setTimeout(() => {
        reloadState[symbol].reloading = false;
      }, 300);
    }
  }

  /**
   * Updates crypto market cap data from CoinGecko
   */
  async function updateCryptoMarketCap() {
    try {
      const ids = Object.values(COINGECKO_MAP).join(",");
      const res = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets",
        {
          params: {
            vs_currency: "usd",
            ids,
            order: "market_cap_desc",
            per_page: 250,
            page: 1,
            sparkline: false,
          },
          timeout: 10000,
        }
      );

      res.data.forEach((item) => {
        const entry = Object.entries(COINGECKO_MAP).find(
          ([_, id]) => id === item.id
        );
        if (!entry) return;

        const [symbol] = entry;
        marketData[symbol] = {
  ...(marketData[symbol] || {}),
  marketCap: item.market_cap ?? null,
  circulatingSupply: item.circulating_supply ?? null,
  totalSupply: item.total_supply ?? null,

  coin: {
    id: item.id,
    name: item.name,                 // ⭐ اسم العملة
    symbol: item.symbol.toUpperCase(), // ⭐ BTC
    logo: item.image,                // ⭐ رابط الصورة
  },

  cg_last_updated: item.last_updated ?? null,
};

        changedSymbols.add(symbol);
      });

      console.log("✅ Crypto Market Cap updated");
    } catch (err) {
      console.error("⚠️ Error fetching crypto market cap:", err.message);
    }
  }

  /**
   * Handles WebSocket message from Binance
   * @param {string} data - Raw message data
   */
  function handleMessage(data) {
    try {
      const msg = JSON.parse(data);
      if (!msg?.data || !msg?.stream) return;

      const stream = msg.stream;
      const symbol = (msg.data.s || stream.split("@")[0]).toUpperCase();

      // Handle ticker data
      if (stream.includes("@ticker")) {
        const d = msg.data;
        marketData[symbol] = {
          ...(marketData[symbol] || {}),
          symbol,
          price: Number(d.c || NaN),
          high24h: Number(d.h || NaN),
          low24h: Number(d.l || NaN),
          volume: Number(d.v || NaN),
          changePercent: Number(d.P || NaN),
          lastTickerUpdate: new Date().toISOString(),
        };
        changedSymbols.add(symbol);
      }

      // Handle order book data
      if (stream.includes("@depth")) {
        const d = msg.data;
        const book = marketData[symbol].orderBook || {
          buffer: [],
          bids: [],
          asks: [],
        };
        book.buffer.push(d);

        if (book.lastUpdateId) {
          const U = d.U || 0;
          const u = d.u || 0;
          if (
            u > book.lastUpdateId &&
            U <= book.lastUpdateId + 1 &&
            u >= book.lastUpdateId + 1
          ) {
            applyDepthUpdate(book, d);
            book.lastUpdateId = u;
            book.buffer = book.buffer.filter((x) => x.u > book.lastUpdateId);
            changedSymbols.add(symbol);
          }
        }
      }
    } catch (err) {
      console.error("⚠️ Error parsing Binance data:", err.message);
    }
  }

  /**
   * Reconnects to WebSocket with exponential backoff
   */
  function reconnectWithBackoff() {
    reconnectAttempts++;
    const delay = Math.min(
      RECONNECT_MAX_DELAY,
      RECONNECT_BASE_DELAY *
        Math.pow(2, Math.min(reconnectAttempts, RECONNECT_MAX_ATTEMPTS))
    );
    setTimeout(() => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        connect();
      }
    }, delay);
  }

  /**
   * Establishes WebSocket connection to Binance
   */
  function connect() {
    const streams = [
      ...CRYPTO_SYMBOLS.map((s) => `${s}@ticker`),
      ...CRYPTO_SYMBOLS.map((s) => `${s}@depth@100ms`),
    ].join("/");

    socket = new WebSocket(
      `wss://stream.binance.com:9443/stream?streams=${streams}`
    );

    socket.on("open", () => {
      reconnectAttempts = 0;
      console.log("✅ Connected to Binance WebSocket");
    });

    socket.on("message", handleMessage);

    socket.on("close", (code) => {
      if (!shouldStop) {
        console.log(`❌ WebSocket closed (code=${code}). Reconnecting...`);
        reconnectWithBackoff();
      }
    });

    socket.on("error", (err) => {
      console.error("⚠️ Binance WebSocket error:", err.message);
    });
  }

  // ==================== INITIALIZATION ====================

  // Load initial data
  await Promise.all([
    ...CRYPTO_SYMBOLS.map((s) => loadCryptoSnapshot(s)),
    updateCryptoMarketCap(),
  ]);

  // Set up periodic market cap updates
  setInterval(updateCryptoMarketCap, MARKET_CAP_UPDATE_INTERVAL);

  // Connect to WebSocket
  connect();

  // ==================== BROADCASTING ====================

  const broadcaster = setInterval(() => {
    const now = Date.now();
    if (!changedSymbols.size || now - lastBroadcast < 2000) return;
    lastBroadcast = now;

    // Build data to send
    const toSend = {};
    for (const symbol of changedSymbols) {
      const data = marketData[symbol];
      if (!data) continue;

      toSend[symbol] = {
        meta: {
          symbol,
          baseSymbol: data.coin?.symbol ?? null,
          logo: data.coin?.logo ?? null,
          price: Number(data.price || NaN),
          high24h: Number(data.high24h || NaN),
          low24h: Number(data.low24h || NaN),
          volume: Number(data.volume || NaN),
          changePercent: Number(data.changePercent || NaN),
          marketCap: data.marketCap ?? null,
          circulatingSupply: data.circulatingSupply ?? null,
          lastUpdate:
            data.lastTickerUpdate ||
            data.cg_last_updated ||
            new Date().toISOString(),
        },
        orderBook: data.orderBook
          ? {
              bids: data.orderBook.bids.slice(0, 20),
              asks: data.orderBook.asks.slice(0, 20),
              lastUpdateId: data.orderBook.lastUpdateId,
            }
          : null,
      };
    }

    // Send to subscribed users
    for (const [socketId, userData] of Object.entries(userSubscriptions)) {
      try {
        const {
          mode,
          symbols: userSymbols = [],
          page = 1,
          pageSize = 5,
        } = userData || {};

        if (mode === "dashboard") {
          // Sort by market cap descending
          const availableSymbols = CRYPTO_SYMBOLS.filter(
            (s) => toSend[s.toUpperCase()]
          );
          const sortedEntries = availableSymbols
            .map((s) => [s.toUpperCase(), toSend[s.toUpperCase()]])
            .sort((a, b) => {
              const aCap = a[1].meta.marketCap || 0;
              const bCap = b[1].meta.marketCap || 0;
              return bCap - aCap;
            });

          const start = (page - 1) * pageSize;
          const paginated = sortedEntries.slice(start, start + pageSize);

          const payload = {};
          paginated.forEach(([symbol, data]) => {
            payload[symbol] = { meta: { ...data.meta } };
          });

          io.to(socketId).emit("cryptoData", payload);
      } else if (mode === "chart") {
  const normalized = Array.isArray(userSymbols)
    ? userSymbols.map((s) => s.toUpperCase()).filter(Boolean)
    : [];
  if (normalized.length === 0) continue;

  const payload = {};
  for (const sym of normalized) {
    if (!marketData[sym]) continue;

    payload[sym] = {
      meta: {
        symbol: sym,
        baseSymbol: data.coin?.symbol ?? null,
        logo: data.coin?.logo ?? null,
        price: marketData[sym].price ?? null,
        high24h: marketData[sym].high24h ?? null,
        low24h: marketData[sym].low24h ?? null,
        volume: marketData[sym].volume ?? null,
        changePercent: marketData[sym].changePercent ?? null,
        marketCap: marketData[sym].marketCap ?? null,
        circulatingSupply: marketData[sym].circulatingSupply ?? null,
        lastUpdate:
          marketData[sym].lastTickerUpdate ||
          marketData[sym].cg_last_updated ||
          new Date().toISOString(),
      },
      orderBook: marketData[sym].orderBook
        ? {
            bids: marketData[sym].orderBook.bids.slice(0, 20),
            asks: marketData[sym].orderBook.asks.slice(0, 20),
          }
        : null,
    };
  }

  if (Object.keys(payload).length) {
    io.to(socketId).emit("cryptoData", payload);
  }
}
 else {
          // Default mode: send all changed data
          io.to(socketId).emit("cryptoData", toSend);
        }
      } catch (err) {
        console.error("⚠️ Error emitting to client:", err.message);
      }
    }

    changedSymbols.clear();
  }, BROADCAST_INTERVAL_MS);

  // ==================== CLEANUP ====================

  return function stop() {
    shouldStop = true;
    try {
      socket?.terminate();
    } catch {}
    clearInterval(broadcaster);
    console.log("🛑 Crypto socket stopped.");
  };
}

module.exports = { startCryptoSocket };
