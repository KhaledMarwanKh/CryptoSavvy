/**
 * Calculate RSI (Relative Strength Index)
 * @param {Array} prices - Close prices
 * @param {number} period - Period (default 14)
 * @returns {number} RSI value
 */
exports.calculateRSI = (prices, period = 14) => {
    if (prices.length <= period) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
        const change = prices[i] - prices[i - 1];
        if (change > 0) gains += change;
        else losses -= change;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period + 1; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        let currentGain = change > 0 ? change : 0;
        let currentLoss = change < 0 ? -change : 0;

        avgGain = (avgGain * (period - 1) + currentGain) / period;
        avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
    }

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
};

/**
 * Calculate Moving Average
 * @param {Array} prices - Close prices
 * @param {number} period - Period
 * @returns {number} MA value
 */
exports.calculateMA = (prices, period) => {
    if (prices.length < period) return prices[prices.length - 1];
    const slice = prices.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
};
