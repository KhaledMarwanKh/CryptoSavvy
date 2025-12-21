const cron = require('node-cron');
const { updateSymbolForecast } = require('../utils/predictionUpdater');

// Symbols we want to track
const TRACKED_SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'ADA'];

// Run every hour at minute 0
exports.initForecastCron = () => {
    console.log('📅 Forecast Cron Job Initialized (Running every hour)');

    cron.schedule('0 * * * *', async () => {
        console.log('⏰ Starting scheduled forecast update...');
        for (const symbol of TRACKED_SYMBOLS) {
            await updateSymbolForecast(symbol);
            // Small delay between calls to not overload the AI service
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    });

    // Optional: Run once on startup if you want immediate data
    // for (const symbol of TRACKED_SYMBOLS) { updateSymbolForecast(symbol); }
};
