// =====================
// server.js
// =====================

// =====================
// External Imports
// =====================
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");

// =====================
// Local Imports
// =====================
const { startCryptoSocket, cryptoSymbols } = require("./middlewares/cryptoSocket");
const appError = require("./utils/appError");
const globalError = require("./controllers/errorController");
const userRoute = require("./routes/userRoute");
const cryptoHistoryRoute = require("./routes/cryptoRoute");
const newsRoute = require("./routes/newsRoute");

// =====================
// Environment Configuration
// =====================
dotenv.config({ path: "./.env" });

// =====================
// App Initialization
// =====================
const app = express();
const port = process.env.PORT || 4000;

// =====================
// CORS Configuration
// =====================
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (!allowedOrigins.includes(origin)) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }

      return callback(null, true);
    },
    credentials: true,
  })
);

app.options("*", cors({ origin: allowedOrigins, credentials: true }));

// =====================
// Static Files
// =====================
app.use("/uploads", express.static("uploads"));

// =====================
// Global Middlewares
// =====================
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(helmet());

app.use(
  "/api",
  rateLimit({
    max: 100,
    windowMs: 15 * 60 * 1000,
    message: "Too many requests from this IP, please try again later.",
  })
);

app.use(express.json());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({ whitelist: [] }));

// =====================
// Routes
// =====================
app.get("/", (req, res) => {
  res.send("API IS RUNNING");
});

app.use("/api/user", userRoute);
app.use("/api/crypto", cryptoHistoryRoute);
app.use("/api/news", newsRoute);

// =====================
// Unhandled Routes
// =====================
app.all("*", (req, res, next) => {
  next(new appError(`can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalError);

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
