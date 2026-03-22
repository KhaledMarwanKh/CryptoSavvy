const STORAGE_KEY = "crypto-market-chat-history-v1";
const DEFAULT_MODEL = "gpt-4o-mini"; // change if your Puter account uses another model
const BINANCE_BASE = "https://data-api.binance.vision/api/v3";
const INTERVALS = ["1m", "5m", "15m", "1h", "4h", "1d", "1w"];

const SYMBOL_MAP = {
    bitcoin: "BTCUSDT",
    btc: "BTCUSDT",
    ethereum: "ETHUSDT",
    eth: "ETHUSDT",
    solana: "SOLUSDT",
    sol: "SOLUSDT",
    binance: "BNBUSDT",
    bnb: "BNBUSDT",
    ripple: "XRPUSDT",
    xrp: "XRPUSDT",
    cardano: "ADAUSDT",
    ada: "ADAUSDT",
    dogecoin: "DOGEUSDT",
    doge: "DOGEUSDT",
    chainlink: "LINKUSDT",
    link: "LINKUSDT",
    avalanche: "AVAXUSDT",
    avax: "AVAXUSDT",
    sui: "SUIUSDT",
    ton: "TONUSDT",
};

const SUGGESTIONS = [
    "What is the current BTC price?",
    "Analyze ETHUSDT on the 4h timeframe.",
    "Explain RSI, MACD, and Bollinger Bands in crypto trading.",
    "Give me a crypto market overview today.",
];

const SYSTEM_PROMPT = `
You are CryptoPilot, a professional crypto-market assistant.

Rules:
- Answer ONLY crypto-related questions:
  crypto prices, market analysis, technical analysis, indicators, tokenomics, blockchain terms, DeFi, sentiment, portfolio risk, crypto investing education, and crypto-related uploaded files/images.
- If the user asks about something unrelated to crypto, politely refuse and redirect them to crypto topics.
- Use the provided live market data and indicator data when available.
- Never promise profits or certainty.
- Give practical, risk-aware, educational investment guidance.
- When asked for price or market analysis, explain:
  1) current trend
  2) momentum
  3) support/resistance
  4) risks
  5) possible bullish/bearish scenarios
- If files/images are uploaded, analyze only what is available and mention limitations if needed.

Formatting:
- Use clean markdown
- Use short headings
- Use bullets where useful
- Highlight important numbers in bold
`;

export { SYSTEM_PROMPT, STORAGE_KEY, BINANCE_BASE, INTERVALS, SUGGESTIONS, DEFAULT_MODEL, SYMBOL_MAP };