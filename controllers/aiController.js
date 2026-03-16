const axios = require("axios");
const catchasync = require("../utils/catchasync");
const AppError = require("../utils/appError");

// AI Service URL (Python FastAPI)
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * Centralized handler for errors coming from the AI service.
 * Translates Axios errors into clean AppError instances.
 */
function handleAiError(err, next) {
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND" || err.code === "ECONNRESET") {
        return next(new AppError("AI service is unreachable. Make sure the Python service is running on port 8000.", 503));
    }
    if (err.response) {
        // AI service responded with an error status
        const detail = err.response.data?.detail || err.response.statusText;
        return next(new AppError(`AI service error: ${detail}`, err.response.status));
    }
    if (err.code === "ECONNABORTED") {
        return next(new AppError("AI service request timed out. Training may still be running in background.", 504));
    }
    return next(err);
}

/**
 * POST /api/ai/predict
 * 
 * Fetches historical data from Binance, sends it to the AI service,
 * and returns the prediction to the frontend.
 * 
 * Query params:
 *  - symbol: e.g., BTCUSDT (required)
 *  - interval: e.g., 1h, 4h, 1d (default: 1h)
 *  - candles: number of candles to fetch (default: 500)
 */
exports.getPrediction = catchasync(async (req, res, next) => {
    const { symbol, interval = "1h", candles = 500 } = req.query;

    if (!symbol) {
        return next(new AppError("Symbol is required (e.g., BTCUSDT)", 400));
    }

    // Step 1: Fetch candles from Binance
    let binanceRes;
    try {
        binanceRes = await axios.get("https://api.binance.com/api/v3/klines", {
            params: {
                symbol: symbol.toUpperCase(),
                interval,
                limit: Math.min(parseInt(candles), 1000),
            },
            timeout: 15000,
        });
    } catch (err) {
        return next(new AppError(`Binance API error: ${err.message}`, 502));
    }

    const history = binanceRes.data.map((candle) => ({
        time: candle[0],
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5]),
    }));

    if (history.length < 100) {
        return next(
            new AppError(
                `Only ${history.length} candles available. Need at least 100.`,
                400
            )
        );
    }

    // Step 2: Send to AI service for prediction
    let aiRes;
    try {
        aiRes = await axios.post(
            `${AI_SERVICE_URL}/predict`,
            { symbol: symbol.toUpperCase(), history },
            { timeout: 120000 } // 2 min timeout for first-time training
        );
    } catch (err) {
        return handleAiError(err, next);
    }

    // Step 3: Return enriched response
    res.json({
        status: "success",
        symbol: symbol.toUpperCase(),
        interval,
        candles_analyzed: history.length,
        ...aiRes.data,
    });
});

/**
 * POST /api/ai/predict/auto
 * 
 * Auto prediction - lets the AI service fetch data directly from Binance.
 * Simpler to use but slightly slower.
 * 
 * Body:
 *  - symbol: e.g., BTCUSDT
 *  - interval: e.g., 1h
 *  - candles: number of candles (default: 500)
 */
exports.getAutoPrediction = catchasync(async (req, res, next) => {
    const { symbol, interval = "1h", candles = 500 } = req.body;

    if (!symbol) {
        return next(new AppError("Symbol is required", 400));
    }

    let aiRes;
    try {
        aiRes = await axios.post(
            `${AI_SERVICE_URL}/predict/auto`,
            {
                symbol: symbol.toUpperCase(),
                interval,
                candles: parseInt(candles),
            },
            { timeout: 120000 }
        );
    } catch (err) {
        return handleAiError(err, next);
    }

    res.json({
        status: "success",
        ...aiRes.data,
    });
});

/**
 * POST /api/ai/train
 * 
 * Train or retrain a model for a specific symbol.
 * This endpoint fetches extended data (2000+ candles) for better accuracy.
 * 
 * Body:
 *  - symbol: e.g., BTCUSDT
 *  - interval: e.g., 1h
 *  - candles: total training data points (default: 2000)
 */
exports.trainModel = catchasync(async (req, res, next) => {
    const { symbol, interval = "1h", candles = 2000 } = req.body;

    if (!symbol) {
        return next(new AppError("Symbol is required", 400));
    }

    let aiRes;
    try {
        aiRes = await axios.post(
            `${AI_SERVICE_URL}/train`,
            {
                symbol: symbol.toUpperCase(),
                interval,
                candles: parseInt(candles),
            },
            { timeout: 300000 } // 5 min timeout for training
        );
    } catch (err) {
        return handleAiError(err, next);
    }

    res.json({
        status: "success",
        ...aiRes.data,
    });
});

/**
 * GET /api/ai/models
 * 
 * List all trained AI models and their metrics.
 */
exports.listModels = catchasync(async (req, res, next) => {
    const aiRes = await axios.get(`${AI_SERVICE_URL}/models`, {
        timeout: 10000,
    });

    res.json({
        status: "success",
        ...aiRes.data,
    });
});

/**
 * GET /api/ai/health
 * 
 * Check if the AI service is running.
 */
exports.healthCheck = catchasync(async (req, res, next) => {
    try {
        const aiRes = await axios.get(`${AI_SERVICE_URL}/`, { timeout: 5000 });
        res.json({
            status: "success",
            ai_service: aiRes.data,
        });
    } catch (err) {
        res.status(503).json({
            status: "error",
            message: "AI service is not available",
            detail: err.message,
        });
    }
});