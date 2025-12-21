const gemini = require("../utils/gemini");
const axios = require("axios");
const indicators = require("../utils/indicators");
const Forecast = require("../models/forecastModel");
const { updateSymbolForecast } = require("../utils/predictionUpdater");

exports.analyzeSentiment = async (req, res) => {
    try {
        const { articles } = req.body;
        if (!articles || !Array.isArray(articles)) {
            return res.status(400).json({ status: "error", message: "Articles array is required" });
        }

        const analysis = await gemini.analyzeNewsSentiment(articles);
        res.json({ status: "success", data: analysis });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

exports.getMarketInsights = async (req, res) => {
    try {
        const { symbol, sentiment } = req.query;
        if (!symbol) {
            return res.status(400).json({ status: "error", message: "Symbol is required" });
        }

        // Fetch history (last 100 candles for better indicator accuracy)
        const historyResponse = await axios.get(`https://api.binance.com/api/v3/klines`, {
            params: { symbol: symbol.toUpperCase(), interval: "1h", limit: 100 }
        });

        const prices = historyResponse.data.map(candle => parseFloat(candle[4]));

        // Calculate technical indicators
        const rsi = indicators.calculateRSI(prices);
        const ma50 = indicators.calculateMA(prices, 50);
        const ma20 = indicators.calculateMA(prices, 20);
        const currentPrice = prices[prices.length - 1];

        const techData = {
            currentPrice,
            rsi: rsi.toFixed(2),
            ma50: ma50.toFixed(2),
            ma20: ma20.toFixed(2),
            trend: currentPrice > ma50 ? "Bullish (Above MA50)" : "Bearish (Below MA50)"
        };

        const insights = await gemini.generateMarketInsights(symbol, techData, sentiment);
        res.json({ status: "success", data: { ...insights, technicals: techData } });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

exports.chat = async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message) {
            return res.status(400).json({ status: "error", message: "Message is required" });
        }

        const response = await gemini.chatWithAI(message, history);
        res.json({ status: "success", response });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

/**
 * Get AI price forecast (pre-calculated or on-demand fallback)
 */
exports.getForecast = async (req, res) => {
    try {
        const { symbol } = req.query;
        if (!symbol) return res.status(400).json({ status: "error", message: "Symbol is required" });

        // Try to get from database first (calculated by cron)
        let forecast = await Forecast.findOne({ symbol: symbol.toUpperCase() });

        // If not found or older than 2 hours, trigger a background update but return what we have
        if (!forecast) {
            console.log(`[AI] Forecast not found for ${symbol}. Triggering sync...`);
            await updateSymbolForecast(symbol);
            forecast = await Forecast.findOne({ symbol: symbol.toUpperCase() });
        }

        res.json({ status: "success", data: forecast });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};
