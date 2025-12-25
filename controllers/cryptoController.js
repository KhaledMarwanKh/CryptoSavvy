const axios = require("axios");
const catchasync = require("../utils/catchasync");
const AppError = require("../utils/appError");

exports.getCryptoHistory = catchasync(async (req, res, next) => {
  const { symbol, period = "7d", interval = "1h" } = req.query;

  let totalHours = parseInt(period) * 24;
  let limit = 0;

  if (interval.endsWith("m")) {
    const minutes = parseInt(interval);
    limit = Math.ceil((totalHours * 60) / minutes);
  } else if (interval.endsWith("h")) {
    const hours = parseInt(interval);
    limit = Math.ceil(totalHours / hours);
  } else if (interval.endsWith("d")) {
    const days = parseInt(interval);
    limit = Math.ceil(totalHours / (days * 24));
  }

  console.log(
    `Fetching history for ${symbol} with interval ${interval} and limit ${limit}`
  );

  const response = await axios.get("https://api.binance.com/api/v3/klines", {
    params: { symbol, interval, limit },
  });

  const history = response.data.map((candle) => ({
    time: candle[0],
    open: parseFloat(candle[1]),
    high: parseFloat(candle[2]),
    low: parseFloat(candle[3]),
    close: parseFloat(candle[4]),
    volume: parseFloat(candle[5]),
  }));

  res.json(history);
});
