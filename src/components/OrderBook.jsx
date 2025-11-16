import React, { useState, useEffect } from 'react';
import { generateOrderBookData, updateOrderBookData } from '../data/cryptoData';

const OrderBook = ({ basePrice = 0 }) => {
  const [orderBookData, setOrderBookData] = useState(generateOrderBookData());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setOrderBookData(updateOrderBookData(basePrice));
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [basePrice]);

  return (
    <div className="bg-[#0f1115] rounded-xl border border-gray-800 p-6 h-[628px] flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Order Book</h2>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Asks (Sell Orders) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="space-y-0.5">
            {[...orderBookData.asks].reverse().map((ask, index) => (
              <div
                key={`ask-${index}`}
                className="relative grid grid-cols-3 gap-2 text-xs py-1.5 px-2 rounded hover:bg-gray-800/30 transition-colors"
              >
                {/* Background bar based on total */}
                <div
                  className="absolute inset-0 bg-red-500/10"
                  style={{
                    width: `${Math.min((parseFloat(ask.total) / 1000000) * 100, 100)}%`,
                    right: 0,
                    left: 'auto'
                  }}
                />

                <div className="relative text-red-500 font-medium text-right">
                  {ask.price}
                </div>
                <div className="relative text-gray-300 text-right">
                  {ask.quantity}
                </div>
                <div className="relative text-gray-400 text-right">
                  {parseFloat(ask.total).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Price Divider */}
        <div className="py-3 my-2 border-y border-gray-800">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-green-500">67,234.5</div>
            <div className="text-sm text-green-500">↑ $1,612.00</div>
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="space-y-0.5">
            {orderBookData.bids.map((bid, index) => (
              <div
                key={`bid-${index}`}
                className="relative grid grid-cols-3 gap-2 text-xs py-1.5 px-2 rounded hover:bg-gray-800/30 transition-colors"
              >
                {/* Background bar based on total */}
                <div
                  className="absolute inset-0 bg-green-500/10"
                  style={{
                    width: `${Math.min((parseFloat(bid.total) / 1000000) * 100, 100)}%`,
                    right: 0,
                    left: 'auto'
                  }}
                />

                <div className="relative text-green-500 font-medium text-right">
                  {bid.price}
                </div>
                <div className="relative text-gray-300 text-right">
                  {bid.quantity}
                </div>
                <div className="relative text-gray-400 text-right">
                  {parseFloat(bid.total).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mt-3 pt-3 border-t border-gray-800 font-medium">
        <div className="text-right">Price (USD)</div>
        <div className="text-right">Amount (BTC)</div>
        <div className="text-right">Total</div>
      </div>
    </div>
  );
};

export default OrderBook;