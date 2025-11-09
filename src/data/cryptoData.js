export const cryptoList = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 67234.50,
    change24h: 2.45,
    change7d: 5.8,
    marketCap: 1320000000000,
    volume: 32000000000,
    rank: 1,
    icon: '₿'
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3456.78,
    change24h: 3.12,
    change7d: 8.2,
    marketCap: 415000000000,
    volume: 18000000000,
    rank: 2,
    icon: 'Ξ'
  },
  {
    id: 'binancecoin',
    symbol: 'BNB',
    name: 'BNB',
    price: 589.23,
    change24h: -1.23,
    change7d: 2.5,
    marketCap: 88000000000,
    volume: 1200000000,
    rank: 3,
    icon: 'BNB'
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    price: 145.67,
    change24h: 5.67,
    change7d: 12.3,
    marketCap: 65000000000,
    volume: 2800000000,
    rank: 4,
    icon: 'SOL'
  },
  {
    id: 'cardano',
    symbol: 'ADA',
    name: 'Cardano',
    price: 0.589,
    change24h: -2.34,
    change7d: -1.2,
    marketCap: 20000000000,
    volume: 450000000,
    rank: 5,
    icon: 'ADA'
  },
  {
    id: 'ripple',
    symbol: 'XRP',
    name: 'XRP',
    price: 0.634,
    change24h: 1.89,
    change7d: 4.5,
    marketCap: 35000000000,
    volume: 1500000000,
    rank: 6,
    icon: 'XRP'
  }
];

export const aiRecommendation = {
  coin: cryptoList[3],
  confidence: 87,
  timeframe: '7-14 days',
  expectedReturn: 15.5,
  riskLevel: 'Medium',
  reasons: [
    'Strong upward trend in the past week with 12.3% increase',
    'Trading volume increasing significantly showing market interest',
    'Technical indicators point to continued upward momentum',
    'Positive news about network developments and new partnerships',
    'Strong support at $140 level with resistance at $155'
  ],
  technicalAnalysis: {
    rsi: 65,
    macd: 'Positive',
    movingAverage: 'Above MA50 & MA200',
    support: '$140',
    resistance: '$155',
    trend: 'Bullish'
  }
};

export const aiChatMessages = [
  {
    id: 1,
    role: 'assistant',
    content: 'Hello! I\'m your AI assistant at CryptoSavvy. How can I help you analyze cryptocurrencies today?',
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: 2,
    role: 'user',
    content: 'Is it a good time to invest in BTC now?',
    timestamp: new Date(Date.now() - 3500000)
  },
  {
    id: 3,
    role: 'assistant',
    content: 'Based on current technical analysis, Bitcoin shows positive signals:\n\n✅ Price above major moving averages\n✅ Strong and stable trading volume\n✅ RSI at 62 (positive zone)\n\nHowever, be aware of:\n⚠️ Strong resistance at $68,000\n⚠️ General market volatility\n\nRecommendation: Suitable for medium-term investment with stop loss at $65,000',
    timestamp: new Date(Date.now() - 3400000)
  }
];

export function generateChartData(days = 30) {
  const data = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  let basePrice = 60000 + Math.random() * 10000;

  for (let i = days; i >= 0; i--) {
    const time = Math.floor((now - i * dayMs) / 1000);
    const volatility = 0.02;
    const trend = Math.sin(i / 10) * 0.01;
    const change = (Math.random() - 0.5) * volatility + trend;
    
    basePrice *= (1 + change);
    
    const open = basePrice;
    const close = basePrice * (1 + (Math.random() - 0.5) * 0.01);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);

    data.push({
      time,
      open,
      high,
      low,
      close,
      value: close
    });
  }

  return data;
}
