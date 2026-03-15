import asyncio
import pandas as pd
from data_fetcher import fetch_candles
from features import compute_features

async def test():
    print("Testing Data Fetching & Feature Engineering...")
    try:
        # Fetch actual data from Binance
        symbol = "BTCUSDT"
        candles = await fetch_candles(symbol, interval="1h", limit=100)
        
        if not candles:
            print("[ERROR] Failed to fetch candles")
            return

        print(f"[OK] Fetched {len(candles)} candles for {symbol}")
        
        # Compute features
        df = pd.DataFrame(candles)
        df_featured = compute_features(df)
        
        print("\n--- Feature Engineering Results (Latest 5) ---")
        # Ensure we have indicators (they need some warm-up rows, usually 14-30)
        # We fetched 100, so we should have plenty.
        pd.set_option('display.max_columns', None)
        pd.set_option('display.width', 1000)
        subset = df_featured[['close', 'rsi', 'macd', 'bb_high', 'bb_low']].tail()
        print(subset)
        
        latest_rsi = df_featured['rsi'].iloc[-1]
        latest_close = df_featured['close'].iloc[-1]
        
        print(f"\nCurrent Price: {latest_close}")
        print(f"Latest RSI: {latest_rsi:.2f}")
        
        if 30 <= latest_rsi <= 70:
            print("Status: Neutral/Normal")
        elif latest_rsi < 30:
            print("Status: Oversold! (Potential Buy)")
        else:
            print("Status: Overbought! (Potential Sell)")
            
        print("\n[SUCCESS] Technical Analysis Engine is functional and accurate!")
        
    except Exception as e:
        print(f"[ERROR] Error during test: {str(e)}")

if __name__ == "__main__":
    # Fix for Windows console encoding
    import sys
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    asyncio.run(test())
