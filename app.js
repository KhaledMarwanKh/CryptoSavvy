// =====================
// app.js
// =====================

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const morgan = require("morgan");

// Local Imports
const appError = require("./utils/appError");
const globalError = require("./controllers/errorController");
const userRoute = require("./routes/userRoute");
const cryptoHistoryRoute = require("./routes/cryptoRoute");
const newsRoute = require("./routes/newsRoute");
const aiRoute = require("./routes/aiRoute");

const app = express();

// =====================
// CORS Configuration
// =====================
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (!allowedOrigins.includes(origin)) {
                const msg = "The CORS policy for this site does not allow access from the specified Origin.";
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
app.use("/api/ai", aiRoute);

// =====================
// Unhandled Routes
// =====================
app.all("*", (req, res, next) => {
    next(new appError(`can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalError);

module.exports = app;
