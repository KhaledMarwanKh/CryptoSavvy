"""
CryptoSavvy AI - Configuration
===============================
All configurable parameters in one place.
"""

import os

# ==================== AI SERVICE ====================
AI_SERVICE_HOST = os.getenv("AI_HOST", "0.0.0.0")
AI_SERVICE_PORT = int(os.getenv("AI_PORT", 8000))

# ==================== BINANCE ====================
BINANCE_BASE_URL = "https://api.binance.com/api/v3"

# ==================== MODEL DEFAULTS ====================
DEFAULT_LOOK_BACK = 60
DEFAULT_EPOCHS = 50
DEFAULT_BATCH_SIZE = 32
DEFAULT_VALIDATION_SPLIT = 0.1

# ==================== SUPPORTED SYMBOLS ====================
SUPPORTED_SYMBOLS = [
    "BTCUSDT", "ETHUSDT", "SOLUSDT", "ADAUSDT",
    "XRPUSDT", "BNBUSDT", "DOGEUSDT", "AVAXUSDT",
]
