const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

// =====================
// Load Environment Variables
// =====================
dotenv.config({ path: "./.env" });

// Local Imports
const app = require("./app");
const { startCryptoSocket, cryptoSymbols } = require("./middlewares/cryptoSocket");
const { startAutoFetch } = require("./services/sypService");

// =====================
// Initialize Services
// =====================
startAutoFetch();

const port = process.env.PORT || 4000;
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];

// =====================
// HTTP Server + Socket.IO Setup
// =====================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// =====================
// Socket Subscriptions Store
// =====================
const userSubscriptions = {};

// =====================
// Socket.IO Events
// =====================
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  // Default subscription
  userSubscriptions[socket.id] = userSubscriptions[socket.id] || {
    mode: "dashboard",
    page: 1,
    pageSize: 5,
    symbols: [],
  };

  // -------- setMode --------
  socket.on("setMode", ({ mode, page, pageSize }) => {
    const user = userSubscriptions[socket.id];
    if (!user) return;

    if (typeof mode === "string") user.mode = mode === "chart" ? "chart" : "dashboard";
    if (page) user.page = page;
    if (pageSize) user.pageSize = pageSize;

    console.log(`⚙️ ${socket.id} mode: ${user.mode}, page: ${user.page}`);
  });

  // -------- dashboard pagination --------
  socket.on("dashboardNext", () => {
    const user = userSubscriptions[socket.id];
    if (!user) return;
    const perPage = user.pageSize || 5;
    const totalPages = Math.ceil(cryptoSymbols.length / perPage);
    user.page = Math.min(user.page + 1, totalPages);
    console.log(`➡️ ${socket.id} page: ${user.page}`);
  });

  socket.on("dashboardPrev", () => {
    const user = userSubscriptions[socket.id];
    if (!user) return;
    user.page = Math.max(user.page - 1, 1);
    console.log(`⬅️ ${socket.id} page: ${user.page}`);
  });

  // -------- subscribe / unsubscribe --------
  socket.on("subscribe", (payload) => {
    const user = userSubscriptions[socket.id];
    if (!user) return;
    const arr = Array.isArray(payload) ? payload : [payload];

    for (let s of arr) {
      if (typeof s !== "string") {
        if (s && typeof s === "object" && s.symbol) s = String(s.symbol);
        else continue;
      }
      const sym = s.trim().toUpperCase();
      if (!user.symbols.includes(sym)) user.symbols.push(sym);
      user.mode = "chart";
      console.log(`📈 ${socket.id} subscribed to ${sym}`);
    }
  });

  socket.on("unsubscribe", (payload) => {
    const user = userSubscriptions[socket.id];
    if (!user) return;
    const arr = Array.isArray(payload) ? payload : [payload];

    for (let s of arr) {
      if (typeof s !== "string") {
        if (s && typeof s === "object" && s.symbol) s = String(s.symbol);
        else continue;
      }
      const sym = s.trim().toUpperCase();
      user.symbols = user.symbols.filter((x) => x !== sym);
      console.log(`📉 ${socket.id} unsubscribed from ${sym}`);
    }
  });

  // -------- disconnect --------
  socket.on("disconnect", () => {
    delete userSubscriptions[socket.id];
    console.log("🔴 Client disconnected:", socket.id);
  });

  // -------- health ping --------
  socket.on("pingServer", () => {
    socket.emit("pongServer", { time: Date.now() });
  });
});

// =====================
// Crypto Socket Starter
// =====================
startCryptoSocket(io, userSubscriptions);

// =====================
// Server Startup
// =====================
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
