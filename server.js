const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

// Load Environment Variables
dotenv.config({ path: "./.env" });

const logger = require("./utils/logger");
const validateEnv = require("./utils/envValidator");

// Validate Environment
validateEnv();

const app = require("./app");
const { startCryptoSocket, cryptoSymbols } = require("./middlewares/cryptoSocket");
const { initForecastCron } = require("./cron/forecastCron");
const { connectDb } = require("./config/mongodb");

// Connect to Database
connectDb();

const port = process.env.PORT || 4000;
const server = http.createServer(app);

// =====================
// Socket.IO Setup
// =====================
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Socket Subscriptions Store
const userSubscriptions = {};

// Socket.IO Events
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  userSubscriptions[socket.id] = {
    mode: "dashboard",
    page: 1,
    pageSize: 5,
    symbols: [],
  };

  socket.on("setMode", ({ mode, page, pageSize }) => {
    const user = userSubscriptions[socket.id];
    if (!user) return;
    if (typeof mode === "string") user.mode = mode === "chart" ? "chart" : "dashboard";
    if (page) user.page = page;
    if (pageSize) user.pageSize = pageSize;
    console.log(`⚙️ ${socket.id} mode: ${user.mode}, page: ${user.page}`);
  });

  socket.on("dashboardNext", () => {
    const user = userSubscriptions[socket.id];
    if (!user) return;
    const perPage = user.pageSize || 5;
    const totalPages = Math.ceil(cryptoSymbols.length / perPage);
    user.page = Math.min(user.page + 1, totalPages);
  });

  socket.on("dashboardPrev", () => {
    const user = userSubscriptions[socket.id];
    if (!user) return;
    user.page = Math.max(user.page - 1, 1);
  });

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
    }
  });

  socket.on("disconnect", () => {
    delete userSubscriptions[socket.id];
    console.log("🔴 Client disconnected:", socket.id);
  });

  socket.on("pingServer", () => {
    socket.emit("pongServer", { time: Date.now() });
  });
});

// Start Crypto Real-time Stream
startCryptoSocket(io, userSubscriptions);

// Initialize Cron Jobs
initForecastCron();

// Start Server
server.listen(port, () => {
  logger.info(`🚀 Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle Graceful Shutdown
const gracefulShutdown = () => {
  logger.info("Signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });

  // Force shutdown after 10s
  setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION! 💥 Shutting down...");
  logger.error(err);
  server.close(() => {
    process.exit(1);
  });
});
