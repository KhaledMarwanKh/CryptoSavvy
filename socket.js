// client.js
const { io } = require("socket.io-client");

// الاتصال بالسيرفر
const socket = io("http://localhost:4000");

// ==================
// Pagination State
// ==================
let currentPage = 1;
const pageSize = 5; // عدد العملات بكل صفحة
const mode = "dashboard"; // dashboard | chart

// ==================
// Helpers
// ==================
function sendDashboardState() {
  socket.emit("setMode", {
    mode: "dashboard",
    page: currentPage,
    pageSize
  });
}

// ==================
// Socket Events
// ==================
socket.on("connect", () => {
  console.log("✅ Connected to server");

  if (mode === "dashboard") {
    sendDashboardState();
  }

  if (mode === "chart") {
    // اشترك برمز واحد (مثال: BTCUSDT)
    socket.emit("setMode", { mode: "chart" });
    socket.emit("subscribe", "BTCUSDT");
  }
});

// ==================
// Pagination Controls
// ==================
function nextPage() {
  currentPage++;
  console.log(`➡️ Next page: ${currentPage}`);
  sendDashboardState();
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    console.log(`⬅️ Prev page: ${currentPage}`);
    sendDashboardState();
  }
}

// ==================
// Data Handlers
// ==================
function handleSingleSymbol(data) {
  console.log(`💰 ${data.symbol}`);
  console.log(`📈 High24h: ${data.high24h ?? 'N/A'}, Low24h: ${data.low24h ?? 'N/A'}`);
  console.log(`🔄 Change: ${data.changePercent ?? 'N/A'}% , Volume: ${data.volume ?? 'N/A'}`);
  console.log(`💹 Market Cap: ${data.marketCap ?? 'N/A'}, Circulating Supply: ${data.circulatingSupply ?? 'N/A'}`);
  if (data.orderBook) {
    console.log("📝 Order Book Bids:", data.orderBook.bids);
    console.log("📝 Order Book Asks:", data.orderBook.asks);
  }
  console.log('-------------------------------');
}

function handleMapPayload(map) {
  for (const [symbol, val] of Object.entries(map)) {
    if (!val) continue;

    const meta = val.meta || {};
    console.log(`💰 ${symbol.toUpperCase()}`);
    console.log(`📈 High24h: ${meta.high24h ?? 'N/A'}, Low24h: ${meta.low24h ?? 'N/A'}`);
    console.log(`🔄 Change: ${meta.changePercent ?? 'N/A'}% , Volume: ${meta.volume ?? 'N/A'}`);
    console.log(`💹 Market Cap: ${meta.marketCap ?? 'N/A'}, Circulating Supply: ${meta.circulatingSupply ?? 'N/A'}`);
    if (val.orderBook) {
      console.log("📝 Order Book Bids:", val.orderBook.bids);
      console.log("📝 Order Book Asks:", val.orderBook.asks);
    }
    console.log('-------------------------------');
  }
}

// ==================
// Main Listener
// ==================
socket.on("cryptoData", (data) => {
  if (!data) return;

  // single symbol (chart)
  if (data.symbol) {
    return handleSingleSymbol(data);
  }

  // map payload (dashboard / multi)
  if (typeof data === "object") {
    return handleMapPayload(data);
  }

  console.warn("⚠️ Unknown cryptoData shape:", data);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
});
