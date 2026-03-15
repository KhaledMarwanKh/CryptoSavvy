# CryptoSavvy AI Service 

LSTM-based cryptocurrency price prediction microservice.

## Architecture

```
ai/
├── main.py              # FastAPI server (entry point)
├── model_logic.py       # LSTM model: build, train, predict, analyze
├── features.py          # Technical indicators (RSI, MACD, Bollinger, etc.)
├── data_fetcher.py      # Binance API data fetcher
├── config.py            # Configuration constants
├── requirements.txt     # Python dependencies
├── saved_models/        # Trained .keras models (auto-created)
└── README.md
```

## Quick Start

```bash
# 1. Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the server
python main.py
```

Server runs on `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /
```

### Auto Predict (easiest)
```
POST /predict/auto
Body: { "symbol": "BTCUSDT", "interval": "1h", "candles": 500 }
```

### Train Model
```
POST /train
Body: { "symbol": "BTCUSDT", "interval": "1h", "candles": 2000 }
```

### Manual Predict (from Node.js backend)
```
POST /predict
Body: { "symbol": "BTCUSDT", "history": [...candles] }
```

### List Models
```
GET /models
```

## Integration with Node.js Backend

The Node.js backend calls this service via:
- `GET /api/ai/predict?symbol=BTCUSDT`
- `POST /api/ai/train`
- `GET /api/ai/models`

Make sure to set `AI_SERVICE_URL=http://localhost:8000` in the backend `.env` file.

## Technical Indicators Used

| Indicator | Purpose |
|-----------|---------|
| RSI | Overbought/Oversold detection |
| MACD | Trend direction & momentum |
| EMA (9/21) | Short vs long-term trend |
| Bollinger Bands | Volatility measurement |
| ATR | Risk/volatility magnitude |
| OBV | Volume-weighted trend |
| Volume Ratio | Unusual volume detection |
