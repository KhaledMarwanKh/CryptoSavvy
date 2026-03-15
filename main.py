"""
CryptoSavvy AI - FastAPI Server (Production)
=============================================
REST API server that exposes the LSTM prediction model.

Endpoints:
    GET  /                  - Health check
    POST /predict           - Predict from provided candle data
    POST /predict/auto      - Auto-fetch from Binance + predict
    POST /train             - Train a model for a symbol
    GET  /models            - List all trained models
"""

import os
import time
import httpx
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional

from model_logic import CryptoPredictor
from data_fetcher import fetch_candles, fetch_candles_extended


# ==================== LIFESPAN ====================

predictor = CryptoPredictor()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load any saved models on startup."""
    saved_dir = os.path.join(os.path.dirname(__file__), "saved_models")
    if os.path.exists(saved_dir):
        for f in os.listdir(saved_dir):
            if f.endswith(".keras"):
                symbol = f.replace(".keras", "")
                try:
                    predictor._load_model(symbol)
                    print(f"✅ Loaded pre-trained model for {symbol}")
                except Exception as e:
                    print(f"⚠️ Failed to load model for {symbol}: {e}")
    yield
    print("🛑 AI Service shutting down.")


# ==================== APP ====================

app = FastAPI(
    title="CryptoSavvy AI Service",
    description="LSTM-based cryptocurrency price prediction and analysis",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS - Allow Node.js backend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== SCHEMAS ====================

class Candle(BaseModel):
    time: int
    open: float
    high: float
    low: float
    close: float
    volume: float


class PredictRequest(BaseModel):
    symbol: str = Field(..., example="BTCUSDT")
    history: List[Candle]


class AutoPredictRequest(BaseModel):
    symbol: str = Field(default="BTCUSDT", example="BTCUSDT")
    interval: str = Field(default="1h", example="1h")
    candles: int = Field(default=500, ge=100, le=1000, example=500)


class TrainRequest(BaseModel):
    symbol: str = Field(default="BTCUSDT", example="BTCUSDT")
    interval: str = Field(default="1h", example="1h")
    candles: int = Field(default=2000, ge=500, le=5000, example=2000)


# ==================== ENDPOINTS ====================

@app.get("/")
def health_check():
    """Health check endpoint."""
    loaded_models = list(predictor.models.keys())
    return {
        "status": "running",
        "service": "CryptoSavvy AI",
        "version": "2.0.0",
        "loaded_models": loaded_models,
        "total_models": len(loaded_models),
    }


@app.post("/predict")
async def predict_from_data(request: PredictRequest):
    """
    Predict using provided candlestick data.
    
    The Node.js backend sends candles it already fetched from Binance.
    This avoids duplicate API calls.
    """
    try:
        if len(request.history) < 100:
            raise HTTPException(
                status_code=400,
                detail="At least 100 candles required for accurate prediction. Recommend 500+."
            )

        history_list = [c.model_dump() for c in request.history]
        start = time.time()
        result = predictor.predict(request.symbol.upper(), history_list)
        elapsed = round(time.time() - start, 2)

        return {
            "status": "success",
            "symbol": request.symbol.upper(),
            "prediction": result,
            "processing_time_seconds": elapsed,
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/predict/auto")
async def predict_auto(request: AutoPredictRequest):
    """
    Automatically fetch data from Binance and predict.
    
    This is the easiest endpoint to use - just provide a symbol
    and the service handles everything.
    """
    try:
        # Fetch candles directly from Binance
        candles = await fetch_candles(
            symbol=request.symbol.upper(),
            interval=request.interval,
            limit=request.candles,
        )

        if len(candles) < 100:
            raise HTTPException(
                status_code=400,
                detail=f"Only got {len(candles)} candles from Binance. Need at least 100."
            )

        start = time.time()
        result = predictor.predict(request.symbol.upper(), candles)
        elapsed = round(time.time() - start, 2)

        return {
            "status": "success",
            "symbol": request.symbol.upper(),
            "interval": request.interval,
            "candles_used": len(candles),
            "prediction": result,
            "processing_time_seconds": elapsed,
        }

    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Binance API error: {str(e)}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/train")
async def train_model(request: TrainRequest):
    """
    Train (or retrain) an LSTM model for a specific symbol.
    
    Fetches extended historical data from Binance and trains the model.
    The model is saved to disk for future predictions.
    """
    try:
        # Fetch extended data for training
        candles = await fetch_candles_extended(
            symbol=request.symbol.upper(),
            interval=request.interval,
            total=request.candles,
        )

        if len(candles) < 500:
            raise HTTPException(
                status_code=400,
                detail=f"Only got {len(candles)} candles. Need at least 500 for training."
            )

        start = time.time()
        metrics = predictor.train(request.symbol.upper(), candles)
        elapsed = round(time.time() - start, 2)

        return {
            "status": "success",
            "symbol": request.symbol.upper(),
            "interval": request.interval,
            "candles_fetched": len(candles),
            "training_metrics": metrics,
            "training_time_seconds": elapsed,
        }

    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Binance API error: {str(e)}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")


@app.get("/models")
def list_models():
    """List all saved models and their metrics."""
    saved_dir = os.path.join(os.path.dirname(__file__), "saved_models")
    models_info = {}

    if os.path.exists(saved_dir):
        for f in os.listdir(saved_dir):
            if f.endswith(".keras"):
                symbol = f.replace(".keras", "")
                model_size = os.path.getsize(os.path.join(saved_dir, f))
                models_info[symbol] = {
                    "file_size_kb": round(model_size / 1024, 1),
                    "loaded_in_memory": symbol in predictor.models,
                    "metrics": predictor.metrics.get(symbol, "not available"),
                }

    return {
        "status": "success",
        "total_models": len(models_info),
        "models": models_info,
    }


# ==================== RUN ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
