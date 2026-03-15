"""
CryptoSavvy AI - Data Fetcher
==============================
Fetches historical candlestick data directly from Binance API.

This allows the AI service to work independently from Node.js
for training purposes, while still accepting data via API for predictions.
"""

import httpx
import pandas as pd
from typing import Optional


BINANCE_BASE_URL = "https://api.binance.com/api/v3"


async def fetch_candles(
    symbol: str = "BTCUSDT",
    interval: str = "1h",
    limit: int = 500
) -> list[dict]:
    """
    Fetch OHLCV candlestick data from Binance.
    
    Args:
        symbol: Trading pair (e.g., "BTCUSDT", "ETHUSDT")
        interval: Candle interval (1m, 5m, 15m, 1h, 4h, 1d)
        limit: Number of candles to fetch (max 1000)
    
    Returns:
        List of candle dicts with keys: time, open, high, low, close, volume
    """
    url = f"{BINANCE_BASE_URL}/klines"
    params = {
        "symbol": symbol.upper(),
        "interval": interval,
        "limit": min(limit, 1000),
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        raw = response.json()

    candles = []
    for candle in raw:
        candles.append({
            "time": int(candle[0]),
            "open": float(candle[1]),
            "high": float(candle[2]),
            "low": float(candle[3]),
            "close": float(candle[4]),
            "volume": float(candle[5]),
        })

    return candles


async def fetch_candles_extended(
    symbol: str = "BTCUSDT",
    interval: str = "1h",
    total: int = 2000
) -> list[dict]:
    """
    Fetch more than 1000 candles by making multiple API calls.
    Binance limits each call to 1000 candles, so we paginate using endTime.
    
    Useful for training with large datasets.
    """
    all_candles = []
    end_time: Optional[int] = None

    while len(all_candles) < total:
        batch_limit = min(1000, total - len(all_candles))
        url = f"{BINANCE_BASE_URL}/klines"
        params = {
            "symbol": symbol.upper(),
            "interval": interval,
            "limit": batch_limit,
        }
        if end_time:
            params["endTime"] = end_time - 1  # Avoid duplicate

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            raw = response.json()

        if not raw:
            break

        batch = []
        for candle in raw:
            batch.append({
                "time": int(candle[0]),
                "open": float(candle[1]),
                "high": float(candle[2]),
                "low": float(candle[3]),
                "close": float(candle[4]),
                "volume": float(candle[5]),
            })

        # Prepend (older data comes first)
        all_candles = batch + all_candles
        end_time = batch[0]["time"]

        if len(batch) < batch_limit:
            break  # No more data available

    return all_candles[-total:]  # Ensure exact count
