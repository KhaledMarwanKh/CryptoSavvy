const axios = require("axios");
const cheerio = require("cheerio");
const AppError = require("../utils/appError");

exports.getUsdDamasPrice = async () => {
  try {
    const { data } = await axios.get("https://sp-today.com/en");
    const $ = cheerio.load(data);

    const priceText = $('.item-data a[href*="us_dollar/city/damascus"] .value')
      .text()
      .trim();
    console.log("Price text:", priceText);
    const price = parseInt(priceText.replace(/,/g, ""));
    console.log("Extracted price:", price);
    if (!price || isNaN(price)) {
      throw new AppError("Failed to extract price from the website", 500);
    }
    return price;
  } catch (err) {
    throw new AppError("Error fetching price: " + err.message, 500);
  }
};


