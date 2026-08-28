"""
CryptoSavvy AI - LSTM Model Builder & Predictor (Enhanced)
==========================================================
Handles model creation, training, saving, loading, and prediction.
Includes additional model evaluation metrics for overfitting/underfitting analysis.
"""
from tensorflow.keras.optimizers import Adam
import os
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, r2_score
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
import joblib

from features import compute_features, FEATURE_COLUMNS

# ==================== CONFIGURATION ====================
LOOK_BACK = 60
PREDICTION_STEPS = 1
EPOCHS = 50
BATCH_SIZE = 32
VALIDATION_SPLIT = 0.1

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
os.makedirs(MODEL_DIR, exist_ok=True)


class CryptoPredictor:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.metrics = {}

    # -------------------- Helpers --------------------
    def _get_model_path(self, symbol: str) -> str:
        return os.path.join(MODEL_DIR, f"{symbol}.keras")

    def _get_scaler_path(self, symbol: str) -> str:
        return os.path.join(MODEL_DIR, f"{symbol}_scaler.pkl")

    def _build_model(self, n_features: int) -> Sequential:
        model = Sequential([
            LSTM(128, return_sequences=True, input_shape=(LOOK_BACK, n_features)),
            Dropout(0.3),
            LSTM(64, return_sequences=False),
            Dropout(0.3),
            Dense(32, activation="relu"),
            Dense(1)
        ])
        model.compile(optimizer=Adam(learning_rate=0.0001), loss="mse", metrics=["mae"])
        return model

    def _prepare_data(self, df: pd.DataFrame):
        feature_data = df[FEATURE_COLUMNS].values
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled = scaler.fit_transform(feature_data)

        X, y = [], []
        for i in range(LOOK_BACK, len(scaled)):
            X.append(scaled[i - LOOK_BACK:i])
            y.append(scaled[i, FEATURE_COLUMNS.index("close")])

        return np.array(X), np.array(y), scaler

    # -------------------- Training --------------------
    def train(self, symbol: str, candles: list[dict]) -> dict:

        df = pd.DataFrame(candles)
        df = compute_features(df)

        if len(df) < LOOK_BACK + 10:
            raise ValueError(
                f"Not enough data after feature computation. Got {len(df)} rows."
            )

        # ==================== PREPARE DATA ====================

        X, y, scaler = self._prepare_data(df)

        # ==================== TIME SERIES SPLIT ====================

        split_idx = int(len(X) * 0.8)

        X_train = X[:split_idx]
        y_train = y[:split_idx]

        X_val = X[split_idx:]
        y_val = y[split_idx:]

        # ==================== BUILD MODEL ====================

        model = self._build_model(n_features=X.shape[2])

        early_stop = EarlyStopping(
            monitor="val_loss",
            patience=5,
            restore_best_weights=True,
            verbose=1
        )

        # ==================== TRAIN ====================

        history = model.fit(
            X_train,
            y_train,
            validation_data=(X_val, y_val),
            epochs=EPOCHS,
            batch_size=BATCH_SIZE,
            shuffle=False,
            callbacks=[early_stop],
            verbose=1
        )

        # ==================== SAVE MODEL ====================

        model.save(self._get_model_path(symbol))
        joblib.dump(scaler, self._get_scaler_path(symbol))

        self.models[symbol] = model
        self.scalers[symbol] = scaler

        # ==================== PREDICTIONS ====================

        y_pred_train = model.predict(X_train, verbose=0)
        y_pred_val = model.predict(X_val, verbose=0)

        # ==================== METRICS ====================

        rmse_train = float(
            np.sqrt(mean_squared_error(y_train, y_pred_train))
        )

        rmse_val = float(
            np.sqrt(mean_squared_error(y_val, y_pred_val))
        )

        r2_train = float(
            r2_score(y_train, y_pred_train)
        )

        r2_val = float(
            r2_score(y_val, y_pred_val)
        )

        # ==================== LOSS INFO ====================
        best_epoch_idx = int(np.argmin(history.history["val_loss"]))

        train_loss_final = float(history.history["loss"][best_epoch_idx])
        val_loss_final = float(history.history["val_loss"][best_epoch_idx])
        val_mae = float(
            min(history.history.get("val_mae", [999]))
        )

        gap_ratio = val_loss_final / (train_loss_final + 1e-8)

        rmse_ratio = rmse_val / (rmse_train + 1e-8)

        best_epoch = int(
            np.argmin(history.history["val_loss"])
        ) + 1

        epochs_trained = len(history.history["loss"])

        # ==================== STORE METRICS ====================

        self.metrics[symbol] = {

            "train_rmse": round(rmse_train, 6),
            "val_rmse": round(rmse_val, 6),

            "train_r2": round(r2_train, 6),
            "val_r2": round(r2_val, 6),

            "train_loss": round(train_loss_final, 6),
            "val_loss": round(val_loss_final, 6),

            "val_mae": round(val_mae, 6),

            "epochs_trained": epochs_trained,
            "best_epoch": best_epoch,

            "gap_ratio": round(float(gap_ratio), 6),
            "rmse_ratio": round(float(rmse_ratio), 6),

            "train_samples": len(X_train),
            "val_samples": len(X_val),

            "data_points": len(df),

            "features_used": len(FEATURE_COLUMNS),
        }

        # ==================== AUTOMATIC PLOTTING ====================
        try:
            import matplotlib
            matplotlib.use('Agg')
            import matplotlib.pyplot as plt

            # 1. رسم منحنى الخسارة (Loss Curve)
            plt.figure(figsize=(10, 5))
            plt.plot(history.history["loss"], label="Train Loss", color="blue", linewidth=1.5)
            plt.plot(history.history["val_loss"], label="Validation Loss", color="red", linewidth=1.5)
            plt.title(f"Model Loss Curve - {symbol}")
            plt.xlabel("Epochs")
            plt.ylabel("Loss (MSE)")
            plt.legend()
            plt.grid(True)
            
            loss_plot_path = os.path.join(MODEL_DIR, f"{symbol}_loss_curve.png")
            plt.savefig(loss_plot_path, dpi=300, bbox_inches='tight')
            plt.close()
            print(f"📊 تم حفظ منحنى الخسارة بنجاح في: {loss_plot_path}")

            # 2. رسم الأسعار الحقيقية مقابل المتوقعة بشكل مطابق تماماً
            close_idx = FEATURE_COLUMNS.index("close")

            # قمنا بحصر البيانات بآخر 150 شمعة لكي تطابق مصفوفة الرسم تماماً وتمنع أي انزياح زمني
            val_features_true = X_val[-150:, -1, :].copy()

            dummy_act = val_features_true.copy()
            dummy_act[:, close_idx] = y_val[-150:] # تأكد من أخذ آخر 150 قيمة حقيقية

            dummy_pred = val_features_true.copy()
            dummy_pred[:, close_idx] = y_pred_val[-150:].flatten() # تأكد من أخذ آخر 150 قيمة متوقعة

            actual_prices = scaler.inverse_transform(dummy_act)[:, close_idx]
            predicted_prices = scaler.inverse_transform(dummy_pred)[:, close_idx]
            plt.figure(figsize=(14, 6))
            plt.plot(actual_prices[-150:], label="Actual Prices", color="blue", linewidth=1.5)
            plt.plot(predicted_prices[-150:], label="Predicted Prices", color="red", linestyle="--", linewidth=1.5)
            plt.title(f"Price Prediction Validation (Last 150 Candles) - {symbol}")
            plt.xlabel("Time Steps")
            plt.ylabel("Price")
            plt.legend()
            plt.grid(True)

            pred_plot_path = os.path.join(MODEL_DIR, f"{symbol}_prediction_chart.png")
            plt.savefig(pred_plot_path, dpi=300, bbox_inches='tight')
            plt.close()
            print(f"📊 تم حفظ مخطط مقارنة الأسعار الجديد والمطابق في: {pred_plot_path}")
            
        except Exception as e:
            print(f"⚠️ تحذير: تم تخطي الرسم البياني بسبب مشكلة في تهيئة مكتبة الرسم: {e}")

        # ==================== REPORT ====================

        print("\n" + "=" * 80)
        print(f"📊 COMPLETE MODEL EVALUATION REPORT - {symbol}")
        print("=" * 80)

        print("\n🔹 TRAIN METRICS")
        print(f"Train RMSE         : {rmse_train}")
        print(f"Train R²           : {r2_train}")

        print("\n🔹 VALIDATION METRICS")
        print(f"Validation RMSE    : {rmse_val}")
        print(f"Validation R²      : {r2_val}")
        print(f"Validation MAE     : {val_mae}")

        print("\n🔹 LOSS ANALYSIS")
        print(f"Train Loss         : {train_loss_final}")
        print(f"Validation Loss    : {val_loss_final}")
        print(f"Loss Gap Ratio     : {gap_ratio}")

        print("\n🔹 RMSE ANALYSIS")
        print(f"RMSE Ratio         : {rmse_ratio}")

        print("\n🔹 TRAINING INFO")
        print(f"Epochs Trained     : {epochs_trained}")
        print(f"Best Epoch         : {best_epoch}")

        print("\n🔹 DATA INFO")
        print(f"Train Samples      : {len(X_train)}")
        print(f"Validation Samples : {len(X_val)}")
        print(f"Total Data Points  : {len(df)}")
        print(f"Features Used      : {len(FEATURE_COLUMNS)}")

        print("\n🔹 OVERFITTING CHECK")

        if gap_ratio < 1.2 and rmse_ratio < 1.2:
            print("Status             : ✅ NO OVERFITTING DETECTED")

        elif gap_ratio < 1.5:
            print("Status             : ⚠️ MILD OVERFITTING")

        else:
            print("Status             : ❌ OVERFITTING DETECTED")

        print("=" * 80 + "\n")

        return self.metrics[symbol]

    # -------------------- Loading --------------------
    def _load_model(self, symbol: str) -> bool:
        model_path = self._get_model_path(symbol)
        scaler_path = self._get_scaler_path(symbol)

        if os.path.exists(model_path) and os.path.exists(scaler_path):
            self.models[symbol] = load_model(model_path)
            self.scalers[symbol] = joblib.load(scaler_path)
            return True
        return False

    # -------------------- Prediction --------------------
    def predict(self, symbol: str, candles: list[dict]) -> dict:
        if symbol not in self.models:
            loaded = self._load_model(symbol)
            if not loaded:
                self.train(symbol, candles)

        model = self.models[symbol]
        scaler = self.scalers[symbol]

        df = pd.DataFrame(candles)
        df = compute_features(df)
        preview_path = os.path.join(MODEL_DIR, f"{symbol}_dataset_preview.xlsx")
        df.head(50).to_excel(preview_path, index=False)
        print(f"📊 تم حفظ عينة من الداتا سيت بنجاح في: {preview_path}")

        if len(df) < LOOK_BACK:
            raise ValueError(f"Not enough data for prediction. Got {len(df)} valid rows.")

        scaled = scaler.transform(df[FEATURE_COLUMNS].values)
        X_input = scaled[-LOOK_BACK:].reshape(1, LOOK_BACK, len(FEATURE_COLUMNS))

        pred_scaled = model.predict(X_input, verbose=0)[0][0]

        dummy = np.zeros((1, len(FEATURE_COLUMNS)))
        close_idx = FEATURE_COLUMNS.index("close")
        dummy[0, close_idx] = pred_scaled
        predicted_price = scaler.inverse_transform(dummy)[0, close_idx]

        current_price = float(df["close"].iloc[-1])
        price_change_pct = ((predicted_price - current_price) / current_price) * 100

        latest = df.iloc[-1]

        rsi_value = float(latest["rsi"])
        macd_value = float(latest["macd"])
        macd_signal_value = float(latest["macd_signal"])
        atr_value = float(latest["atr"])
        bb_width = float(latest["bb_width"])
        ema_cross = float(latest["ema_cross"])

        signal = self._compute_signal(price_change_pct, rsi_value, macd_value, macd_signal_value, ema_cross)
        confidence = self._compute_confidence(symbol, rsi_value, bb_width)
        risk_level = self._compute_risk(atr_value, current_price, bb_width)
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
            "model_info": self.metrics.get(symbol, {}),
        }

    # -------------------- Helpers --------------------
    def _compute_signal(self, price_change_pct, rsi, macd, macd_signal, ema_cross):
        if abs(price_change_pct) < 0.5:
            return "HOLD"

        confirmation = 0

        if rsi < 35:
            confirmation += 1
        elif rsi > 65:
            confirmation -= 1

        if macd > macd_signal:
            confirmation += 1
        else:
            confirmation -= 1

        if ema_cross > 0:
            confirmation += 1
        else:
            confirmation -= 1

        if price_change_pct > 0:
            if confirmation >= 2:
                return "STRONG_BUY"
            return "BUY"
        else:
            if confirmation <= -2:
                return "STRONG_SELL"
            return "SELL"

    def _compute_confidence(self, symbol, rsi, bb_width):
        base = 70
        return base

    def _compute_risk(self, atr, current_price, bb_width):
        atr_pct = (atr / current_price) * 100
        if atr_pct > 5 or bb_width > 0.1:
            return "HIGH"
        elif atr_pct > 2:
            return "MEDIUM"
        return "LOW"

    def _compute_support_resistance(self, df):
        recent = df.tail(60)
        return float(recent["low"].min()), float(recent["high"].max())
