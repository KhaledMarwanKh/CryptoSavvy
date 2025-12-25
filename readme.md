# CryptoSavvy | Backend 

## 🏗️ System Architecture Overview
CryptoSavvy implements a high-performance, distributed architecture designed for real-time market analysis and predictive modeling.

- **Primary Gateway (Node.js/Express)**: Handles authentication, real-time WebSocket streams, database management, and orchestration of third-party APIs.
- **AI Microservice (Python/FastAPI)**: A dedicated service for heavy computational tasks, specifically Time-Series Forecasting using Meta's **Prophet** algorithm.
- **Intelligence Layer (Google Gemini 1.5 Pro/Flash)**: Orchestrates Explainable AI (XAI) for news sentiment analysis and complex market reasoning.
- **Persistence & Caching**: MongoDB for structured data and internal memory caching for optimized API performance.

---

## 📡 REST API Documentation

### 1. Authentication & User Management (`/api/user`)
| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/signup` | POST | Register a new user and initiate email verification. | No |
| `/login` | POST | Authenticates user and returns a JWT. | No |
| `/profile` | GET | Retrieves current user profile details. | Yes |
| `/updateProfile` | PATCH | Updates user account information. | Yes |

### 2. Crypto Market Data (`/api/crypto`)
| Endpoint | Method | Parameters | Description |
| :--- | :--- | :--- | :--- |
| `/history` | GET | `symbol`, `period`, `interval` | Returns OHLCV historical data with server-side caching. |

### 3. Intelligence & AI Analytics (`/api/ai`)
| Endpoint | Method | Description | Logic |
| :--- | :--- | :--- | :--- |
| `/analyze-sentiment`| POST | Analyzes a list of news articles for market sentiment. | Uses Gemini 1.5 for XAI Reasoning. |
| `/market-insights` | GET | Provides a deep-dive analysis of a specific symbol. | Combines Technical Indicators + News Sentiment. |
| `/forecast` | GET | Retrieves 7-day price predictions for a symbol. | Fetches from pre-calculated Prophet results. |
| `/chat` | POST | Interactive LLM-powered market assistant. | Context-aware crypto chat. |

---

## ⚡ WebSocket Interface (Real-time)
Used for live price updates and Order Book depth.
- **Connection**: `ws://localhost:4000`
- **Events**:
  - `setMode`: Switches between `dashboard` (multi-coin stats) and `chart` (single-coin depth).
  - `subscribe`: Listens to specific symbols (e.g., `BTCUSDT`).
  - `cryptoData`: Emitted by server every 500ms containing live price & order book updates.

---

## 🧠 AI Strategy & Implementation

### A. Price Forecasting (Time-Series)
Our Python service utilizes **Prophet** to model non-linear trends with yearly, weekly, and daily seasonality. 
- **Data Pipeline**: Node.js Cron (Hourly) -> Binance OHLCV -> FastAPI (Prophet) -> MongoDB.
- **Explainability**: The model doesn't just predict; it benchmarks against historical volatility.

### B. News Sentiment (NLP)
We go beyond simple keyword matching. Our system uses LLM-based **Explainable AI (XAI)** to identify:
- **Tone**: Bullish, Bearish, or Neutral.
- **Reasoning**: Why the news matters (Adoption, Regulation, Technology).
- **Confidence Score**: 0-100 quantitative metric.

---

## ⚙️ Development Environment
- **Node.js**: v18+
- **Python**: v3.9+ 
- **Database**: MongoDB Atlas / Local
- **AI Access**: Google Generative AI API Key

---
