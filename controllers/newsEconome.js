// controllers/economicController.js
const { ApifyClient } = require("apify-client");

const client = new ApifyClient({
  token: process.env.API_KEY,
});

exports.getEconomicNews = async (req, res) => {
  try {
    const currencyFilter = req.query.currency || ""; // مثال: USD, EUR, GBP

    const input = {
      timeFilter: "time_only",
      importances: "high", // High impact only
      categories: "",
      country: "",
    };

    const run = await client
      .actor("pintostudio/economic-calendar-data-investing-com")
      .call(input);

    if (!run.defaultDatasetId) {
      return res.status(500).json({
        status: "error",
        message: "No dataset returned from Apify Actor",
      });
    }

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    // فلترة وتحويل البيانات بناءً على currency إذا تم تمريره
    const events = items
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
