const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'
const CRYPTOCOMPARE_BASE = 'https://min-api.cryptocompare.com/data/v2'
// https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=1000&page=1&sparkline=true
// https://api.coingecko.com/api/v3/global

const coingeckoHeaders = {
    accept: 'application/json',
    ...(import.meta.env.VITE_COINGECKO_API_KEY
        ? { 'x-cg-demo-api-key': import.meta.env.VITE_COINGECKO_API_KEY }
        : {}),
}

const cryptoCompareHeaders = {
    accept: 'application/json',
    ...(import.meta.env.VITE_CRYPTOCOMPARE_API_KEY
        ? { authorization: `Apikey ${import.meta.env.VITE_CRYPTOCOMPARE_API_KEY}` }
        : {}),
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, options)
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
    }
    return response.json()
}

export const RANGE_TO_DAYS = {
    '1M': 30,
    '3M': 90,
    '1Y': 365,
}

export async function getGlobalData() {
    const data = await fetchJson(`${COINGECKO_BASE}/global`, {
        headers: coingeckoHeaders,
    })
    return data.data
}

export async function getGlobalMarketChart(range = '1M') {
    const days = RANGE_TO_DAYS[range] ?? 30

    return fetchJson(
        `${COINGECKO_BASE}/global?vs_currency=usd&days=${days}`,
        {
            headers: coingeckoHeaders,
        }
    )
}

export async function getMarkets() {
    const params = new URLSearchParams({
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: '100',
        page: '1',
        sparkline: 'true',
        price_change_percentage: '24h',
    })

    return fetchJson(`${COINGECKO_BASE}/coins/markets?${params.toString()}`, {
        headers: coingeckoHeaders,
    })
}

export async function searchAssets(query) {
    if (!query.trim()) return []

    const data = await fetchJson(
        `${COINGECKO_BASE}/search?query=${encodeURIComponent(query)}`,
        {
            headers: coingeckoHeaders,
        }
    )

    return data.coins?.slice(0, 6) ?? []
}

export async function getBreakingNews() {
    const data = await fetchJson(
        `${CRYPTOCOMPARE_BASE}/news/?lang=EN&categories=BTC,ETH,Blockchain,Regulation`,
        {
            headers: cryptoCompareHeaders,
        }
    )

    return data?.Data?.[0] ?? null
}