const axios = require('axios');
const cache = require('../utils/cache');

exports.getCryptoHistory = async (req, res) => {
  const { symbol, period = '7d', interval = '1h' } = req.query;

  let totalHours = parseInt(period) * 24;
  let limit = 0;

  if (interval.endsWith('m')) {
    const minutes = parseInt(interval);
    limit = Math.ceil(totalHours * 60 / minutes);
  } else if (interval.endsWith('h')) {
    const hours = parseInt(interval);
    limit = Math.ceil(totalHours / hours);
  } else if (interval.endsWith('d')) {
    const days = parseInt(interval);
    limit = Math.ceil(totalHours / (days * 24));
  }

  const cacheKey = `history_${symbol}_${interval}_${limit}`;

  try {
    const history = await cache.getOrSet(cacheKey, async () => {
      console.log(`Fetching fresh history for ${symbol} with interval ${interval} and limit ${limit}`);
      const response = await axios.get('https://api.binance.com/api/v3/klines', {
        params: { symbol: symbol.toUpperCase(), interval, limit }
      });

      return response.data.map(candle => ({
        time: candle[0],
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5])
      }));
    }, 60); // Cache history for 60 seconds

    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching historical data" });
  }
};

