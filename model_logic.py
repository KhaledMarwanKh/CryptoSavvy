"""
CryptoSavvy AI - LSTM Model Builder & Predictor
=================================================
Handles model creation, training, saving, loading, and prediction.

Architecture:
- 2 LSTM layers with Dropout for regularization
- Trained on windowed sequences of technical indicators
- Saves/loads models per symbol for fast inference
"""

import os
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
import joblib

from features import compute_features, FEATURE_COLUMNS

# ==================== CONFIGURATION ====================

LOOK_BACK = 60          # How many past candles the model "sees" at once
PREDICTION_STEPS = 1    # How many future steps to predict
EPOCHS = 50             # Max training epochs (EarlyStopping may stop earlier)
BATCH_SIZE = 32         # Training batch size
VALIDATION_SPLIT = 0.1  # 10% of data used for validation

# Where to save trained models
MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
os.makedirs(MODEL_DIR, exist_ok=True)


class CryptoPredictor:
    """
    Manages LSTM models for cryptocurrency price prediction.
    
    Why per-symbol models?
    - BTC behaves differently from DOGE
    - Each coin has unique volatility patterns
    - Training data distribution varies widely
    """

    def __init__(self):
        self.models = {}       # {symbol: keras_model}
        self.scalers = {}      # {symbol: MinMaxScaler}
        self.metrics = {}      # {symbol: {val_loss, trained_at, ...}}

    def _get_model_path(self, symbol: str) -> str:
        return os.path.join(MODEL_DIR, f"{symbol}.keras")

    def _get_scaler_path(self, symbol: str) -> str:
        return os.path.join(MODEL_DIR, f"{symbol}_scaler.pkl")

    def _build_model(self, n_features: int) -> Sequential:
        """
        Build a 2-layer LSTM network.
        
        Architecture explained:
        - LSTM(128): First layer captures complex temporal patterns
        - Dropout(0.3): Prevents overfitting (randomly disables 30% of neurons)
        - LSTM(64): Second layer refines the patterns
        - Dense(32): Fully connected layer for final processing
        - Dense(1): Output = predicted close price (scaled)
        """
        model = Sequential([
            LSTM(128, return_sequences=True, input_shape=(LOOK_BACK, n_features)),
            Dropout(0.3),
            LSTM(64, return_sequences=False),
            Dropout(0.3),
            Dense(32, activation="relu"),
            Dense(1)
        ])
        model.compile(optimizer="adam", loss="mse", metrics=["mae"])
        return model

    def _prepare_data(self, df: pd.DataFrame):
        """
        Transforms feature DataFrame into LSTM-ready 3D arrays.
        
        Input shape for LSTM: (samples, time_steps, features)
        - samples: number of sequences we can create
        - time_steps: LOOK_BACK (60 candles)
        - features: number of technical indicators (20)
        
        Returns: X, y, scaler
        """
        feature_data = df[FEATURE_COLUMNS].values
        
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled = scaler.fit_transform(feature_data)

        X, y = [], []
        for i in range(LOOK_BACK, len(scaled)):
            X.append(scaled[i - LOOK_BACK:i])           # Past 60 candles
            y.append(scaled[i, FEATURE_COLUMNS.index("close")])  # Next close price
        
        return np.array(X), np.array(y), scaler

    def train(self, symbol: str, candles: list[dict]) -> dict:
        """
        Train a new LSTM model for a specific symbol.
        
        Args:
            symbol: e.g., "BTCUSDT"
            candles: list of {time, open, high, low, close, volume}
        
        Returns:
            Training metrics dict
        """
        # Step 1: Convert to DataFrame and compute features
        df = pd.DataFrame(candles)
        df = compute_features(df)

        if len(df) < LOOK_BACK + 10:
            raise ValueError(
                f"Not enough data after feature computation. "
                f"Got {len(df)} rows, need at least {LOOK_BACK + 10}. "
                f"Send more historical candles (recommend 500+)."
            )

        # Step 2: Prepare training data
        X, y, scaler = self._prepare_data(df)

        # Step 3: Build and train model
        model = self._build_model(n_features=X.shape[2])
        
        early_stop = EarlyStopping(
            monitor="val_loss",
            patience=5,
            restore_best_weights=True,
            verbose=1
        )

        history = model.fit(
            X, y,
            epochs=EPOCHS,
            batch_size=BATCH_SIZE,
            validation_split=VALIDATION_SPLIT,
            callbacks=[early_stop],
            verbose=1
        )

        # Step 4: Save model and scaler
        model.save(self._get_model_path(symbol))
        joblib.dump(scaler, self._get_scaler_path(symbol))

        # Step 5: Cache in memory
        self.models[symbol] = model
        self.scalers[symbol] = scaler

        # Step 6: Record metrics
        val_loss = min(history.history.get("val_loss", [999]))
        val_mae = min(history.history.get("val_mae", [999]))
        epochs_trained = len(history.history["loss"])

        self.metrics[symbol] = {
            "val_loss": float(val_loss),
            "val_mae": float(val_mae),
            "epochs_trained": epochs_trained,
            "data_points": len(df),
            "features_used": len(FEATURE_COLUMNS),
        }

        return self.metrics[symbol]

    def _load_model(self, symbol: str) -> bool:
        """Try to load a previously trained model from disk."""
        model_path = self._get_model_path(symbol)
        scaler_path = self._get_scaler_path(symbol)

        if os.path.exists(model_path) and os.path.exists(scaler_path):
            self.models[symbol] = load_model(model_path)
            self.scalers[symbol] = joblib.load(scaler_path)
            return True
        return False

    def predict(self, symbol: str, candles: list[dict]) -> dict:
        """
        Predict the next close price for a symbol.
        
        If no trained model exists, trains one on-the-fly.
        
        Args:
            symbol: e.g., "BTCUSDT"
            candles: list of {time, open, high, low, close, volume}
        
        Returns:
            Prediction result dict with price, signal, confidence, indicators
        """
        # Try to load cached model
        if symbol not in self.models:
            loaded = self._load_model(symbol)
            if not loaded:
                # No model exists - train one now
                self.train(symbol, candles)

        model = self.models[symbol]
        scaler = self.scalers[symbol]

        # Compute features on latest data
        df = pd.DataFrame(candles)
        df = compute_features(df)

        if len(df) < LOOK_BACK:
            raise ValueError(
                f"Not enough data for prediction. "
                f"Got {len(df)} valid rows, need at least {LOOK_BACK}."
            )

        # Scale the features
        feature_data = df[FEATURE_COLUMNS].values
        scaled = scaler.transform(feature_data)

        # Take the last LOOK_BACK candles as input
        X_input = scaled[-LOOK_BACK:].reshape(1, LOOK_BACK, len(FEATURE_COLUMNS))

        # Predict
        pred_scaled = model.predict(X_input, verbose=0)[0][0]

        # Inverse scale: create a dummy row to inverse transform
        dummy = np.zeros((1, len(FEATURE_COLUMNS)))
        close_idx = FEATURE_COLUMNS.index("close")
        dummy[0, close_idx] = pred_scaled
        predicted_price = scaler.inverse_transform(dummy)[0, close_idx]

        # ==================== ANALYSIS ENGINE ====================

        current_price = float(df["close"].iloc[-1])
        price_change_pct = ((predicted_price - current_price) / current_price) * 100

        # Latest indicators for the response
        latest = df.iloc[-1]
        rsi_value = float(latest["rsi"])
        macd_value = float(latest["macd"])
        macd_signal_value = float(latest["macd_signal"])
        atr_value = float(latest["atr"])
        bb_width = float(latest["bb_width"])
        ema_cross = float(latest["ema_cross"])

        # --- Signal Logic ---
        signal = self._compute_signal(price_change_pct, rsi_value, macd_value, macd_signal_value, ema_cross)

        # --- Confidence Score ---
        confidence = self._compute_confidence(symbol, rsi_value, bb_width)

        # --- Risk Level ---
        risk_level = self._compute_risk(atr_value, current_price, bb_width)

        # --- Support & Resistance ---
        support, resistance = self._compute_support_resistance(df)

        return {
            "current_price": round(current_price, 6),
            "predicted_price": round(float(predicted_price), 6),
            "price_change_pct": round(price_change_pct, 2),
            "signal": signal,
            "confidence": confidence,
            "risk_level": risk_level,
            "support": round(support, 6),
            "resistance": round(resistance, 6),
            "technical_indicators": {
                "rsi": round(rsi_value, 2),
                "macd": round(macd_value, 6),
                "macd_signal": round(macd_signal_value, 6),
                "ema_9": round(float(latest["ema_9"]), 6),
                "ema_21": round(float(latest["ema_21"]), 6),
                "ema_cross": "Bullish" if ema_cross > 0 else "Bearish",
                "bollinger_width": round(bb_width, 4),
                "atr": round(atr_value, 6),
                "volume_ratio": round(float(latest["volume_ratio"]), 2),
            },
            "model_info": self.metrics.get(symbol, {}),
        }

    def _compute_signal(self, price_change_pct, rsi, macd, macd_signal, ema_cross):
        """
        Multi-factor signal generation.
        Uses a scoring system instead of hard rules.
        """
        score = 0

        # Factor 1: Predicted price direction
        if price_change_pct > 1:
            score += 2
        elif price_change_pct > 0:
            score += 1
        elif price_change_pct < -1:
            score -= 2
        else:
            score -= 1

        # Factor 2: RSI
        if rsi < 30:
            score += 2    # Oversold = buy opportunity
        elif rsi < 40:
            score += 1
        elif rsi > 70:
            score -= 2    # Overbought = sell signal
        elif rsi > 60:
            score -= 1

        # Factor 3: MACD crossover
        if macd > macd_signal:
            score += 1    # Bullish crossover
        else:
            score -= 1    # Bearish crossover

        # Factor 4: EMA cross
        if ema_cross > 0:
            score += 1
        else:
            score -= 1

        # Convert score to signal
        if score >= 3:
            return "STRONG_BUY"
        elif score >= 1:
            return "BUY"
        elif score <= -3:
            return "STRONG_SELL"
        elif score <= -1:
            return "SELL"
        else:
            return "HOLD"

    def _compute_confidence(self, symbol, rsi, bb_width):
        """
        Confidence score based on:
        1. Model validation loss (lower = better)
        2. RSI extremes (more decisive = higher confidence)
        3. Bollinger width (narrow = consolidation = less confident)
        """
        base_confidence = 70

        # Model quality bonus
        metrics = self.metrics.get(symbol, {})
        val_loss = metrics.get("val_loss", 0.01)
        if val_loss < 0.001:
            base_confidence += 15
        elif val_loss < 0.005:
            base_confidence += 10
        elif val_loss < 0.01:
            base_confidence += 5

        # RSI decisiveness bonus
        if rsi < 25 or rsi > 75:
            base_confidence += 8
        elif rsi < 35 or rsi > 65:
            base_confidence += 4

        # Bollinger width penalty (narrow = uncertain)
        if bb_width < 0.02:
            base_confidence -= 10
        elif bb_width < 0.04:
            base_confidence -= 5

        return min(max(base_confidence, 30), 95)

    def _compute_risk(self, atr, current_price, bb_width):
        """
        Risk level based on ATR (volatility) and Bollinger width.
        """
        atr_pct = (atr / current_price) * 100

        if atr_pct > 5 or bb_width > 0.1:
            return "HIGH"
        elif atr_pct > 2 or bb_width > 0.05:
            return "MEDIUM"
        else:
            return "LOW"

    def _compute_support_resistance(self, df: pd.DataFrame):
        """
        Simple support/resistance using recent min/max with lookback.
        """
        recent = df.tail(60)
        support = float(recent["low"].min())
        resistance = float(recent["high"].max())
        return support, resistance
