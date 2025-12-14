// middlewares/startCryptoSocket.js
const WebSocket = require('ws');
const axios = require('axios');

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
    book[side].sort((a, b) => side === 'bids' ? b.price - a.price : a.price - b.price);
    book[side] = book[side].slice(0, 20);
  };

  updateBook('bids', update.b || []);
  updateBook('asks', update.a || []);
}

async function startCryptoSocket(io, userSubscriptions) {
  const cryptoSymbols = ['btcusdt', 'ethusdt', 'solusdt', 'adausdt', 'xrpusdt'];

  // ---------------- FOREX + GOLD ----------------
  const forexSymbols = ['XAUUSD','EURUSD', 'GBPUSD', 'USDJPY'];
  const yahooMap = {
    XAUUSD: "GC=F",   // Gold Futures
    EURUSD: "EURUSD=X",
    GBPUSD: "GBPUSD=X",
    USDJPY: "JPY=X"
  };

  // ---------------- CRYPTO MARKET CAP (COINGECKO) ----------------
  const coingeckoMap = {
    BTCUSDT: 'bitcoin',
    ETHUSDT: 'ethereum',
    SOLUSDT: 'solana',
    ADAUSDT: 'cardano',
    XRPUSDT: 'ripple'
  };

  const marketData = {};
  const changedSymbols = new Set();
  const reloadState = {};

  // -------- CRYPTO SNAPSHOT --------
  async function loadCryptoSnapshot(symLower) {
    const symbol = symLower.toUpperCase();
    reloadState[symbol] = reloadState[symbol] || { reloading: false, lastAttempt: 0 };
    const now = Date.now();
    const COOLDOWN = 1500;
    if (reloadState[symbol].reloading || now - reloadState[symbol].lastAttempt < COOLDOWN) return;
    reloadState[symbol].reloading = true;
    reloadState[symbol].lastAttempt = now;

    try {
      const res = await axios.get('https://api.binance.com/api/v3/depth', {
        params: { symbol, limit: 1000 },
        timeout: 10000
      });
      const { bids, asks, lastUpdateId } = res.data;

      marketData[symbol] = {
        ...(marketData[symbol] || {}),
        symbol,
        orderBook: {
          lastUpdateId,
          bids: bids.map(([p, q]) => ({ price: parseFloat(p), quantity: parseFloat(q) })).slice(0, 20),
          asks: asks.map(([p, q]) => ({ price: parseFloat(p), quantity: parseFloat(q) })).slice(0, 20),
          buffer: []
        }
      };
      console.log(`📥 Snapshot loaded for ${symbol}`);
      changedSymbols.add(symbol);
    } catch (err) {
      console.error(`❌ Error loading snapshot for ${symbol}:`, err.message);
    } finally {
      setTimeout(() => { reloadState[symbol].reloading = false; }, 300);
    }
  }

  // -------- FETCH CRYPTO MARKET CAP --------
  async function updateCryptoMarketCap() {
    try {
      const ids = Object.values(coingeckoMap).join(',');
      const res = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: { vs_currency: 'usd', ids, order: 'market_cap_desc', per_page: 250, page: 1, sparkline: false },
        timeout: 10000
      });

      res.data.forEach(item => {
        const entry = Object.entries(coingeckoMap).find(([_, id]) => id === item.id);
        if (!entry) return;
        const [symbol] = entry;
        marketData[symbol] = {
          ...(marketData[symbol] || {}),
          marketCap: item.market_cap ?? null,
          circulatingSupply: item.circulating_supply ?? null,
          totalSupply: item.total_supply ?? null,
          cg_last_updated: item.last_updated ?? null
        };
        changedSymbols.add(symbol);
      });
      console.log('✅ Crypto Market Cap updated');
    } catch (err) {
      console.error('⚠️ Error fetching crypto market cap:', err.message);
    }
  }

  // -------- FETCH FOREX & GOLD FROM YAHOO --------
  async function fetchYahooPrice(symbol) {
    const yahooSymbol = yahooMap[symbol];
    if (!yahooSymbol) return;

    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`;
      const res = await axios.get(url, { timeout: 10000 });
      const result = res.data.chart?.result?.[0];
      if (!result) return;

      const meta = result.meta;
      marketData[symbol] = {
        ...(marketData[symbol] || {}),
        symbol,
        price: Number(meta.regularMarketPrice || NaN),
        high24h: Number(meta.regularMarketDayHigh || NaN),
        low24h: Number(meta.regularMarketDayLow || NaN),
        volume: null,
        changePercent: null,
        lastTickerUpdate: new Date().toISOString()
      };
      changedSymbols.add(symbol);
    } catch (err) {
      console.error(`⚠️ Yahoo fetch error for ${symbol}:`, err.message);
    }
  }

  // -------- INIT --------
  await Promise.all([
    ...cryptoSymbols.map(s => loadCryptoSnapshot(s)),
    updateCryptoMarketCap(),
    ...forexSymbols.map(sym => fetchYahooPrice(sym))
  ]);

  setInterval(updateCryptoMarketCap, 5 * 60 * 1000);
  setInterval(() => { forexSymbols.forEach(fetchYahooPrice); }, 1000);

  // -------- BINANCE SOCKET --------
  const streams = [
    ...cryptoSymbols.map(s => `${s}@ticker`),
    ...cryptoSymbols.map(s => `${s}@depth@100ms`)
  ].join('/');

  let reconnectAttempts = 0, socket = null, shouldStop = false;

  function connect() {
    socket = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    socket.on('open', () => { reconnectAttempts = 0; console.log('✅ Connected to Binance WebSocket'); });
    socket.on('message', handleMessage);
    socket.on('close', code => { if (!shouldStop) { console.log(`❌ WebSocket closed (code=${code}). Reconnecting...`); reconnectWithBackoff(); } });
    socket.on('error', err => { console.error('⚠️ Binance WebSocket error:', err.message); });
  }

  function handleMessage(data) {
    try {
      const msg = JSON.parse(data);
      if (!msg?.data || !msg?.stream) return;

      const stream = msg.stream;
      const symbol = (msg.data.s || stream.split('@')[0]).toUpperCase();

      // TICKER DATA
      if (stream.includes('@ticker')) {
        const d = msg.data;
        marketData[symbol] = {
          ...(marketData[symbol] || {}),
          symbol,
          price: Number(d.c || NaN),
          high24h: Number(d.h || NaN),
          low24h: Number(d.l || NaN),
          volume: Number(d.v || NaN),
          changePercent: Number(d.P || NaN),
          lastTickerUpdate: new Date().toISOString()
        };
        changedSymbols.add(symbol);
      }

      // ORDER BOOK DATA
      if (stream.includes('@depth')) {
        const d = msg.data;
        const book = marketData[symbol].orderBook || { buffer: [], bids: [], asks: [] };
        book.buffer.push(d);
        if (book.lastUpdateId) {
          const U = d.U || 0;
          const u = d.u || 0;
          if (u > book.lastUpdateId && U <= book.lastUpdateId + 1 && u >= book.lastUpdateId + 1) {
            applyDepthUpdate(book, d);
            book.lastUpdateId = u;
            book.buffer = book.buffer.filter(x => x.u > book.lastUpdateId);
            changedSymbols.add(symbol);
          }
        }
      }
    } catch (err) { console.error('⚠️ Error parsing Binance data:', err.message); }
  }

  function reconnectWithBackoff() {
    reconnectAttempts++;
    const delay = Math.min(30000, 1000 * Math.pow(2, Math.min(reconnectAttempts, 6)));
    setTimeout(() => { if (!socket || socket.readyState !== WebSocket.OPEN) connect(); }, delay);
  }

  connect();

  // -------- BROADCAST --------
  const BROADCAST_INTERVAL_MS = 50;
  let lastBroadcast = 0;

  const broadcaster = setInterval(() => {
    const now = Date.now();
    if (!changedSymbols.size || now - lastBroadcast < 2000) return;
    lastBroadcast = now;
    const toSend = {};

    for (const symbol of changedSymbols) {
      const data = marketData[symbol];
      if (!data) continue;

      toSend[symbol] = {
        meta: {
          symbol,
          price: Number(data.price || NaN),
          high24h: Number(data.high24h || NaN),
          low24h: Number(data.low24h || NaN),
          volume: Number(data.volume || NaN),
          changePercent: Number(data.changePercent || NaN),
          marketCap: data.marketCap ?? null,
          circulatingSupply: data.circulatingSupply ?? null,
          lastUpdate: data.lastTickerUpdate || data.cg_last_updated || new Date().toISOString()
        },
        orderBook: data.orderBook
          ? { bids: data.orderBook.bids.slice(0, 20), asks: data.orderBook.asks.slice(0, 20), lastUpdateId: data.orderBook.lastUpdateId }
          : null
      };
    }

    for (const [socketId, userData] of Object.entries(userSubscriptions)) {
      try {
        const { mode, symbols: userSymbols = [] } = userData || {};
        if (mode === 'dashboard') {
          io.to(socketId).emit('cryptoData', Object.fromEntries(Object.entries(toSend).map(([s, d]) => [s, d.meta])));
        } else if (mode === 'chart') {
          const normalized = Array.isArray(userSymbols) ? userSymbols.map(s => s.toUpperCase()).filter(Boolean) : [];
          if (normalized.length === 0) continue; // لا ترسل كل البيانات
          if (normalized.length === 1 && toSend[normalized[0]]) {
            io.to(socketId).emit('cryptoData', { ...toSend[normalized[0]].meta, orderBook: toSend[normalized[0]].orderBook });
          } else {
            const payload = Object.fromEntries(normalized.filter(s => toSend[s]).map(s => [s, toSend[s]]));
            if (Object.keys(payload).length) io.to(socketId).emit('cryptoData', payload);
          }
        } else {
          io.to(socketId).emit('cryptoData', toSend);
        }
      } catch (err) { console.error('⚠️ Error emitting to client:', err.message); }
    }

    changedSymbols.clear();
  }, BROADCAST_INTERVAL_MS);

  return function stop() {
    shouldStop = true;
    try { socket?.terminate(); } catch {}
    clearInterval(broadcaster);
    console.log('🛑 Crypto socket stopped.');
  };
}

module.exports = { startCryptoSocket };
