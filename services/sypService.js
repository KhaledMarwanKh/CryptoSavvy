const { chromium } = require("playwright");

// Constants
const SOURCE_URL = "https://sp-today.com/en/currencies";
const PAGE_LOAD_TIMEOUT = 60000; // 60 seconds
const SELECTOR_TIMEOUT = 20000; // 20 seconds
const AUTO_FETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Global variables for caching
let cache = null;
let lastUpdate = null;
let isFetching = false;

/**
 * Launches a headless Chromium browser instance.
 *  The launched browser instance.
 */
async function launchBrowser() {
  return await chromium.launch({ headless: true });
}

/**
 * Creates a new page with a custom user agent and navigates to the source URL.
 * - The browser instance.
 *  The navigated page.
 */
async function navigateToPage(browser) {
  const page = await browser.newPage({ userAgent: USER_AGENT });
  await page.goto(SOURCE_URL, {
    waitUntil: "domcontentloaded",
    timeout: PAGE_LOAD_TIMEOUT,
  });
  await page.waitForSelector("table tbody tr", { timeout: SELECTOR_TIMEOUT });
  return page;
}

/**
 * Parses currency data from the Next.js __NEXT_DATA__ script tag.
 *  - The Playwright page instance.
 *  Array of currency objects or null if parsing fails.
 */
async function parseCurrenciesFromNextData(page) {
  return await page.evaluate(() => {
    try {
      const nextData = document.getElementById("__NEXT_DATA__");
      if (nextData) {
        const parsed = JSON.parse(nextData.textContent);
        const items = parsed.props.pageProps.initialData[0].items;
        return items.map((item) => ({
          currency: item.symbol,
          name: item.name_en,
          buy: item.cities.damascus.buy.toString(),
          sell: item.cities.damascus.sell.toString(),
          change: item.cities.damascus.change + "%",
        }));
      }
    } catch (e) {
      console.error("NextData parsing failed, falling back to DOM scraping");
    }
    return null;
  });
}

/**
 * Parses currency data directly from the DOM table as a fallback.
 *  - The Playwright page instance.
 *  Array of currency objects or null if no data found.
 */
async function parseCurrenciesFromDOM(page) {
  return await page.evaluate(() => {
    const rows = document.querySelectorAll("table tbody tr");
    if (!rows.length) return null;

    return Array.from(rows).map((row) => {
      const cols = row.querySelectorAll("td");
      return {
        currency: cols[0]?.querySelector(".font-bold")?.innerText.trim() || "",
        name: cols[0]?.querySelector(".text-xs")?.innerText.trim() || "",
        buy: cols[1]?.innerText.replace(/,/g, "").trim(),
        sell: cols[2]?.innerText.replace(/,/g, "").trim(),
        change: cols[3]?.innerText.trim(),
      };
    });
  });
}

/**
 * Updates the cache with new currency data and sets the last update time.
 * currencies - The array of currency data.
 */
function updateCache(currencies) {
  cache = currencies;
  lastUpdate = new Date();
  console.log(
    `✅ Table updated successfully (${cache.length} currencies) at ${lastUpdate.toLocaleTimeString()}`
  );
}

/**
 * Fetches currency data from the source website.
 */
async function fetchFromSource() {
  if (isFetching) return;
  isFetching = true;

  let browser;
  try {
    console.log("🔄 Updating currency data from sp-today...");

    browser = await launchBrowser();
    const page = await navigateToPage(browser);

    let currencies = await parseCurrenciesFromNextData(page);
    if (!currencies) {
      currencies = await parseCurrenciesFromDOM(page);
    }

    if (!currencies || currencies.length === 0) {
      throw new Error("No data found in the table");
    }

    updateCache(currencies);
  } catch (err) {
    console.error("❌ Update failed, keeping old data:", err.message);
  } finally {
    isFetching = false;
    if (browser) await browser.close();
  }
}

/**
 * Starts automatic fetching of currency data.
 */
exports.startAutoFetch = () => {
  fetchFromSource(); // Initial fetch
  setInterval(fetchFromSource, AUTO_FETCH_INTERVAL);
};

/**
 * Retrieves the cached currency rates.
 *  Object containing success status, data, and last update time.
 */
exports.getRates = () => {
  return {
    success: !!cache,
    data: cache,
    lastUpdate,
  };
};
