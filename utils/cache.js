const NodeCache = require("node-cache");

// Default TTL: 30 seconds
const cache = new NodeCache({ stdTTL: 30, checkperiod: 60 });

/**
 * Get or Set cache helper
 * @param {string} key - Cache key
 * @param {Function} fetchFunction - Async function to fetch data if not in cache
 * @param {number} ttl - Time to live in seconds (optional)
 */
exports.getOrSet = async (key, fetchFunction, ttl = 30) => {
    const value = cache.get(key);
    if (value) {
        console.log(`[Cache] Hit: ${key}`);
        return value;
    }

    console.log(`[Cache] Miss: ${key}. Fetching fresh data...`);
    const freshData = await fetchFunction();
    cache.set(key, freshData, ttl);
    return freshData;
};

exports.cache = cache;
