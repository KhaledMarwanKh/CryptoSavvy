"""
CryptoSavvy AI - Feature Engineering Module
============================================
Converts raw OHLCV candlestick data into a rich feature matrix
using professional technical analysis indicators.

This is the SECRET SAUCE. Instead of feeding the LSTM just prices,
we feed it 12+ features that professional traders actually use.
"""

import numpy as np
import pandas as pd
import ta


def compute_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Takes a DataFrame with columns: [open, high, low, close, volume]
    Returns the same DataFrame enriched with technical indicators.

    Every indicator added here becomes a "brain cell" for the LSTM.
    More meaningful features = more accurate predictions.
    """
    df = df.copy()

    # ==================== TREND INDICATORS ====================

    # RSI (Relative Strength Index) - Measures overbought/oversold
    # RSI > 70 = overbought (price may drop)
    # RSI < 30 = oversold (price may rise)
    df["rsi"] = ta.momentum.rsi(df["close"], window=14)

    # MACD (Moving Average Convergence Divergence)
    # Shows the relationship between two moving averages
    macd = ta.trend.MACD(df["close"])
    df["macd"] = macd.macd()
    df["macd_signal"] = macd.macd_signal()
    df["macd_diff"] = macd.macd_diff()  # Histogram - the diff between MACD and Signal

    # EMA (Exponential Moving Averages)
    # Short-term vs long-term trend direction
    df["ema_9"] = ta.trend.ema_indicator(df["close"], window=9)
    df["ema_21"] = ta.trend.ema_indicator(df["close"], window=21)

    # EMA Cross Signal: positive = bullish cross, negative = bearish
    df["ema_cross"] = df["ema_9"] - df["ema_21"]

    # ==================== VOLATILITY INDICATORS ====================

    # Bollinger Bands - Shows volatility range
    bollinger = ta.volatility.BollingerBands(df["close"], window=20, window_dev=2)
    df["bb_high"] = bollinger.bollinger_hband()
    df["bb_low"] = bollinger.bollinger_lband()
    df["bb_mid"] = bollinger.bollinger_mavg()

    # Bollinger Band Width - Measures volatility level
    df["bb_width"] = (df["bb_high"] - df["bb_low"]) / df["bb_mid"]

    # ATR (Average True Range) - Measures volatility magnitude
    df["atr"] = ta.volatility.average_true_range(df["high"], df["low"], df["close"], window=14)

    # ==================== VOLUME INDICATORS ====================

    # OBV (On-Balance Volume) - Volume-weighted trend confirmation
    df["obv"] = ta.volume.on_balance_volume(df["close"], df["volume"])

    # Volume SMA - Is current volume above or below average?
    df["volume_sma"] = df["volume"].rolling(window=20).mean()
    df["volume_ratio"] = df["volume"] / (df["volume_sma"] + 1e-10)

    # ==================== PRICE ACTION FEATURES ====================

    # Percentage change from previous candle
    df["price_change_pct"] = df["close"].pct_change()

    # High-Low range as percentage of close (shows candle body size)
    df["hl_pct"] = (df["high"] - df["low"]) / (df["close"] + 1e-10)

    # ==================== CLEANUP ====================

    # Drop NaN rows created by indicator calculations
    # (first ~33 rows will be NaN because indicators need warmup data)
    df.dropna(inplace=True)
    df.reset_index(drop=True, inplace=True)

    return df


# The feature columns our LSTM will consume (order matters!)
FEATURE_COLUMNS = [
    "open", "high", "low", "close", "volume",
    "rsi", "macd", "macd_signal", "macd_diff",
    "ema_9", "ema_21", "ema_cross",
    "bb_high", "bb_low", "bb_width",
    "atr", "obv", "volume_ratio",
    "price_change_pct", "hl_pct",
]
