const { chromium } = require("playwright");
const AppError = require("../utils/appError");

exports.getUsdDamasPrice = async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
    });

    const page = await context.newPage();

    await page.goto(
      "https://sp-today.com/en/currency/us_dollar/city/damascus",
      { waitUntil: "networkidle" }
    );

    // الأسعار
    const prices = await page.evaluate(() => {
      const buyEl = [...document.querySelectorAll(".cur-col")]
        .find(el => el.textContent.includes("Buy"))
        ?.querySelector(".value");

      const sellEl = [...document.querySelectorAll(".cur-col")]
        .find(el => el.textContent.includes("Sell"))
        ?.querySelector(".value");

      return {
        buy: buyEl ? parseInt(buyEl.textContent.replace(/,/g, "")) : 0,
        sell: sellEl ? parseInt(sellEl.textContent.replace(/,/g, "")) : 0,
      };
    });

    // الشارت مع تحويل التاريخ
    const chart = await page.evaluate(() => {
      if (!window.Highcharts?.charts?.length) return [];
      const chartInstance = window.Highcharts.charts.find(c => c);
      if (!chartInstance) return [];

      return chartInstance.series[0].data
        .map(p => {
          if (!p) return null;
          return {
            date: new Date(p.x).toISOString().split("T")[0], // YYYY-MM-DD
            value: p.y
          };
        })
        .filter(v => v !== null);
    });

    return {
      currency: "USD",
      city: "Damascus",
      buy: prices.buy,
      sell: prices.sell,
      chart,
    };
  } catch (err) {
    throw new AppError(
      "Failed to fetch USD Damascus price: " + err.message,
      500
    );
  } finally {
    if (browser) await browser.close();
  }
};
