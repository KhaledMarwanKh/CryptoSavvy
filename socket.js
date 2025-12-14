// client.js
const { io } = require("socket.io-client");

// الاتصال بالسيرفر
const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("✅ Connected to server");

  const mode = "chart";
  socket.emit("setMode", mode);

  if (mode === "chart") {
    // اشترك برمز واحد (سلسلة نصية)
    socket.emit("subscribe", "EURUSD");
  }
});

function handleSingleSymbol(data) {
  // data: { symbol, price, high24h, low24h, changePercent, volume, marketCap, circulatingSupply, orderBook }
  console.log(`💰 ${data.symbol}: ${data.price} USD`);
  console.log(`📈 High24h: ${data.high24h}, Low24h: ${data.low24h}`);
  console.log(`🔄 Change: ${data.changePercent}%, Volume: ${data.volume}`);
  console.log(`💹 Market Cap: ${data.marketCap}, Supply: ${data.circulatingSupply}`);
  console.log('📝 Order Book Bids:', data.orderBook?.bids);
  console.log('📝 Order Book Asks:', data.orderBook?.asks);
}

function handleMapPayload(map) {
  // map: { BTCUSDT: { meta: {...}, orderBook: {...} }, ... } or for dashboard { BTCUSDT: meta, ... }
  for (const [sym, val] of Object.entries(map)) {
    if (!val) continue;
    // if val has meta field then structure is { meta, orderBook }
    if (val.meta) {
      const meta = val.meta;
      console.log(`💰 ${meta.symbol}: ${meta.price} USD`);
      console.log(`📈 High24h: ${meta.high24h}, Low24h: ${meta.low24h}`);
      console.log(`🔄 Change: ${meta.changePercent}%, Volume: ${meta.volume}`);
      console.log(`💹 Market Cap: ${meta.marketCap}, Supply: ${meta.circulatingSupply}`);
      console.log('📝 Order Book Bids:', val.orderBook?.bids);
      console.log('📝 Order Book Asks:', val.orderBook?.asks);
    } else {
      // dashboard fallback where val itself is meta
      const meta = val;
      console.log(`💰 ${sym}: ${meta.price} USD`);
      console.log(`📈 High24h: ${meta.high24h}, Low24h: ${meta.low24h}`);
      console.log(`🔄 Change: ${meta.changePercent}%, Volume: ${meta.volume}`);
    }
  }
}

socket.on("cryptoData", (data) => {
  // Accept both shapes:
  // 1) single symbol object: { symbol, price, ... }
  // 2) map: { BTCUSDT: { meta: {...}, orderBook: {...} }, ... } or { BTCUSDT: meta, ... }

  if (!data) return console.warn('Received empty cryptoData');

  if (data.symbol) {
    // single-symbol object
    return handleSingleSymbol(data);
  }

  if (typeof data === 'object') {
    return handleMapPayload(data);
  }

  console.warn('Unknown cryptoData shape:', data);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
});
