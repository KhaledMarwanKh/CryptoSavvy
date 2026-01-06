const WebSocket = require("ws");
const axios = require("axios");

// ==================== CONSTANTS ====================
const BROADCAST_INTERVAL_MS = 500; 
const MARKET_CAP_UPDATE_INTERVAL = 5 * 60 * 1000;
const SNAPSHOT_COOLDOWN = 1500;
const RECONNECT_MAX_DELAY = 30000;
const RECONNECT_BASE_DELAY = 1000;
const RECONNECT_MAX_ATTEMPTS = 6;

const CRYPTO_SYMBOLS = [
  "btcusdt","ethusdt"
  //,"solusdt","adausdt","xrpusdt",
  //"bnbusdt","dogeusdt","avaxusdt","linkusdt","maticusdt","dotusdt"
];

const COINGECKO_MAP = {
  BTCUSDT: "bitcoin",
  ETHUSDT: "ethereum",
  // SOLUSDT: "solana",
  // ADAUSDT: "cardano",
  // XRPUSDT: "ripple",
  // BNBUSDT: "binancecoin",
  // DOGEUSDT: "dogecoin",
  // AVAXUSDT: "avalanche-2",
  // LINKUSDT: "chainlink",
  // MATICUSDT: "matic-network",
  // DOTUSDT: "polkadot",
};

// ==================== HELPERS ====================
function applyDepthUpdate(book, update) {
  const updateBook = (side, items) => {
    items.forEach(([price, qty]) => {
      const p = parseFloat(price);
      const q = parseFloat(qty);
      if (q === 0) book[side] = book[side].filter(x => x.price !== p);
      else {
        const existing = book[side].find(x => x.price === p);
        if (existing) existing.quantity = q;
        else book[side].push({ price: p, quantity: q });
      }
    });
    book[side].sort((a,b) => side==="bids"?b.price-a.price:a.price-b.price);
    book[side] = book[side].slice(0,20);
  };
  updateBook("bids", update.b || []);
  updateBook("asks", update.a || []);
}

// ==================== MAIN ====================
async function startCryptoSocket(io, userSubscriptions) {
  const marketData = {};
  const changedSymbols = new Set();
  const reloadState = {};
  let reconnectAttempts = 0;
  let socket = null;
  let shouldStop = false;
  let lastBroadcast = 0;

  // -------- SNAPSHOT --------
  async function loadSnapshot(symLower) {
    const symbol = symLower.toUpperCase();
    reloadState[symbol] = reloadState[symbol] || { reloading:false, lastAttempt:0 };
    const now = Date.now();
    if (reloadState[symbol].reloading || now - reloadState[symbol].lastAttempt < SNAPSHOT_COOLDOWN) return;
    reloadState[symbol].reloading = true;
    reloadState[symbol].lastAttempt = now;

    try {
      const res = await axios.get("https://api.binance.com/api/v3/depth", {
        params: { symbol, limit: 1000 }, timeout:10000
      });
      const { bids, asks, lastUpdateId } = res.data;
      marketData[symbol] = {
        ...(marketData[symbol] || {}),
        symbol,
        orderBook: {
          lastUpdateId,
          bids: bids.map(([p,q])=>({price:parseFloat(p),quantity:parseFloat(q)})).slice(0,20),
          asks: asks.map(([p,q])=>({price:parseFloat(p),quantity:parseFloat(q)})).slice(0,20),
          buffer: []
        }
      };
      changedSymbols.add(symbol);
      console.log(`📥 Snapshot loaded for ${symbol}`);
    } catch(err) {
      console.error(`❌ Snapshot error ${symbol}:`, err.message);
    } finally {
      setTimeout(()=>reloadState[symbol].reloading=false,300);
    }
  }

  // -------- MARKET CAP --------
  async function updateMarketCap() {
    try {
      const ids = Object.values(COINGECKO_MAP).join(",");
      const res = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
        params:{ vs_currency:"usd", ids }, timeout:10000
      });
      res.data.forEach(item=>{
        const [symbol] = Object.entries(COINGECKO_MAP).find(([_,id])=>id===item.id)||[];
        if(!symbol) return;
        marketData[symbol] = {
          ...(marketData[symbol]||{}),
          marketCap: item.market_cap ?? null,
          circulatingSupply: item.circulating_supply ?? null,
          totalSupply: item.total_supply ?? null,
          cg_last_updated: item.last_updated ?? null
        };
        changedSymbols.add(symbol);
      });
      console.log("✅ MarketCap updated");
    } catch(err){ console.error("⚠️ MarketCap error:", err.message);}
  }

  // -------- WEBSOCKET HANDLER --------
  function handleMessage(data) {
    try {
      const msg = JSON.parse(data);
      if(!msg?.stream || !msg?.data) return;
      const stream = msg.stream;
      const symbol = (msg.data.s || stream.split("@")[0]).toUpperCase();
      const d = msg.data;

      if(stream.includes("@ticker")){
        marketData[symbol] = {
          ...(marketData[symbol]||{}),
          symbol,
          price: Number(d.c||NaN),
          high24h: Number(d.h||NaN),
          low24h: Number(d.l||NaN),
          volume: Number(d.v||NaN),
          changePercent: Number(d.P||NaN),
          lastTickerUpdate: new Date().toISOString()
        };
        changedSymbols.add(symbol);
      }

      if(stream.includes("@depth")){
        const book = marketData[symbol].orderBook||{buffer:[],bids:[],asks:[]};
        book.buffer.push(d);
        if(book.lastUpdateId){
          const U=d.U||0, u=d.u||0;
          if(u>book.lastUpdateId && U<=book.lastUpdateId+1 && u>=book.lastUpdateId+1){
            applyDepthUpdate(book,d);
            book.lastUpdateId = u;
            book.buffer = book.buffer.filter(x=>x.u>book.lastUpdateId);
            changedSymbols.add(symbol);
          }
        }
      }
    } catch(err){ console.error("⚠️ WS parse error:", err.message);}
  }

  function reconnectWithBackoff(){
    reconnectAttempts++;
    const delay = Math.min(RECONNECT_MAX_DELAY, RECONNECT_BASE_DELAY*Math.pow(2,Math.min(reconnectAttempts,RECONNECT_MAX_ATTEMPTS)));
    setTimeout(()=>{ if(!socket || socket.readyState!==WebSocket.OPEN) connect(); }, delay);
  }

  function connect(){
    const streams = [...CRYPTO_SYMBOLS.map(s=>`${s}@ticker`), ...CRYPTO_SYMBOLS.map(s=>`${s}@depth@100ms`)].join("/");
    socket = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

    socket.on("open", ()=>{ reconnectAttempts=0; console.log("✅ Connected to Binance WS"); });
    socket.on("message", handleMessage);
    socket.on("close", code=>{ if(!shouldStop){ console.log(`❌ WS closed (${code}), reconnecting...`); reconnectWithBackoff(); } });
    socket.on("error", err=>console.error("⚠️ WS error:",err.message));
  }

  // -------- INIT --------
  await Promise.all(CRYPTO_SYMBOLS.map(s=>loadSnapshot(s)));
  await updateMarketCap();
  setInterval(updateMarketCap, MARKET_CAP_UPDATE_INTERVAL);
  connect();

  // -------- BROADCAST --------
  setInterval(()=>{
    const now=Date.now();
    if(!changedSymbols.size || now-lastBroadcast<2000) return;
    lastBroadcast = now;

    for(const [socketId,userData] of Object.entries(userSubscriptions)){
      try{
        const { mode, symbols=[], page=1, pageSize=5 } = userData||{};
        let payload = {};

        if(mode==="dashboard"){
  const sorted = Object.values(marketData).sort((a,b)=>(b.marketCap||0)-(a.marketCap||0));
  const start=(page-1)*pageSize;
  const paginated = sorted.slice(start,start+pageSize);

  payload = {};
  paginated.forEach(d=>{
    payload[d.symbol] = {
      meta: {
        price: d.price,
        high24h: d.high24h,
        low24h: d.low24h,
        volume: d.volume,
        changePercent: d.changePercent,
        marketCap: d.marketCap,
        circulatingSupply: d.circulatingSupply,
        // ⚠️ ما نرسل orderBook هنا
      }
    };
  });

} else if(mode==="chart"){
  const normalized = symbols.map(s=>s.toUpperCase());
  payload = Object.fromEntries(
    normalized
      .filter(s => marketData[s])
      .map(s => [s, marketData[s]]) // هنا نرسل كل شيء بما فيها orderBook
  );
}
 else if(mode==="chart"){
          const normalized = symbols.map(s=>s.toUpperCase());
          payload = Object.fromEntries(
            normalized
              .filter(s => marketData[s])
              .map(s => [s, marketData[s]])
          );

        } else {
          payload = {...marketData};
        }

        if(Object.keys(payload).length) io.to(socketId).emit("cryptoData", payload);
      }catch(err){ console.error("⚠️ Emit error:",err.message);}
    }

    changedSymbols.clear();
  }, BROADCAST_INTERVAL_MS);

  // -------- CLEANUP --------
  return function stop(){
    shouldStop=true;
    try{ socket?.terminate(); } catch{}
    console.log("🛑 Crypto socket stopped.");
  };
}

module.exports = { startCryptoSocket };
