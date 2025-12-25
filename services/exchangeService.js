const axios = require("axios");


exports.convert = async (from, to, amount) => {
  const key = `${from}${to}`;

console.log(`Converting ${amount} from ${from} to ${to} using key ${key}`);
  const url = `https://api.exchangerate-api.com/v4/latest/${from}`;
  const response = await axios.get(url);

  if (!response.data || !response.data.rates) {
    throw new Error("Exchange API failed");
  }

  const rate = response.data.rates[to];
  if (!rate) {
    throw new Error(`Rate for ${to} not found`);
  }
const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  const startStr = start.toISOString().split("T")[0];
  const endStr = end.toISOString().split("T")[0];
  const result = amount * rate;
  const history = await axios.get(`https://api.frankfurter.app/${startStr}..${endStr}?from=${from}&to=${to}`);
  return {
    from,
    to,
    amount,
    rate,
    result,
    source: "exchangerate-api.com",
    history: history.data.rates,
  };
};


