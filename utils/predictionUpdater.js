const axios = require('axios');
const Forecast = require('../models/forecastModel');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Update predictions for a given symbol by calling the Python AI service
 * @param {string} symbol - e.g. 'BTC'
 */
exports.updateSymbolForecast = async (symbol) => {
    try {
        console.log(`[AI-Service] Syncing forecast for ${symbol}...`);

        // 1. Get historical data from Binance (via our internal API logic or direct)
        const binanceRes = await axios.get('https://api.binance.com/api/v3/klines', {
            params: { symbol: `${symbol}USDT`, interval: '1d', limit: 100 }
        });

        const historicalData = binanceRes.data.map(d => ({
            timestamp: d[0],
            price: parseFloat(d[4])
        }));

        // 2. Call Python AI Microservice
        const aiRes = await axios.post(`${AI_SERVICE_URL}/predict`, {
            symbol: symbol,
            periods: 7,
            data: historicalData
        });

        // 3. Save to MongoDB
        await Forecast.findOneAndUpdate(
            { symbol: symbol.toUpperCase() },
            {
                predictions: aiRes.data.predictions,
                lastUpdated: new Date()
            },
            { upsert: true, new: true }
        );

        console.log(`[AI-Service] Success: Forecast updated for ${symbol}`);
    } catch (err) {
        console.error(`[AI-Service] Error updating forecast for ${symbol}:`, err.message);
    }
};
