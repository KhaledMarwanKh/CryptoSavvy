// controllers/economicController.js
const { ApifyClient } = require("apify-client");

const client = new ApifyClient({
  token: process.env.API_KEY,
});

exports.getEconomicNews = async (req, res) => {
  try {
    const currencyFilter = req.query.currency || ""; // مثال: USD, EUR, GBP
    const importanceFilter = req.query.importances || "high,medium"; 
    // يمكن يمرر: "high", "medium", "low" أو مجموعة مفصولة بفاصلة

    const importances = importanceFilter.split(",").map(s => s.trim().toLowerCase());

    let allItems = [];

    for (const importance of importances) {
      if (!["high", "medium", "low", ""].includes(importance)) continue;

      const input = {
        timeFilter: "time_only",
        importances: importance,
        categories: "",
        country: "",
      };

      const run = await client
        .actor("pintostudio/economic-calendar-data-investing-com")
        .call(input);

      if (run.defaultDatasetId) {
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        allItems = allItems.concat(items);
      }
    }

    // فلترة وتحويل البيانات بناءً على currency إذا تم تمريره
    const events = allItems
      .filter((event) => !currencyFilter || event.currency === currencyFilter)
      .map((event) => ({
        date: event.date || "",
        time: event.time || "",
        currency: event.currency || "",
        country: event.country || "",
        event: event.event || "",
        actual: event.actual || "",
        forecast: event.forecast || "",
        previous: event.previous || "",
        impact: event.impact || "",
      }));

    return res.json({
      status: "success",
      count: events.length,
      events,
    });
  } catch (err) {
    console.error("APIFY ECONOMIC NEWS ERROR:", err.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch economic news from Apify",
    });
  }
};
