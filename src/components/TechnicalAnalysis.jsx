import React from 'react';
import { technicalIndicators } from '../data/cryptoData';

const TechnicalAnalysis = () => {
  return (
    <div className="bg-[#0f1115] rounded-xl border border-gray-800 p-6">
      <h2 className="text-lg font-semibold mb-4">Technical Analysis</h2>

      <div className="space-y-4">
        {/* RSI */}
        <div className="flex items-center justify-between py-3 border-b border-gray-800">
          <span className="text-gray-300">RSI (Relative Strength Index)</span>
          <span className="text-lg font-semibold text-cyan-400">{technicalIndicators.rsi}</span>
        </div>

        {/* MACD */}
        <div className="flex items-center justify-between py-3 border-b border-gray-800">
          <span className="text-gray-300">MACD</span>
          <span className="text-lg font-semibold text-green-500">{technicalIndicators.macd}</span>
        </div>

        {/* Moving Average */}
        <div className="flex items-center justify-between py-3 border-b border-gray-800">
          <span className="text-gray-300">Moving Average</span>
          <span className="text-lg font-semibold text-cyan-400">{technicalIndicators.movingAverage}</span>
        </div>

        {/* Trend */}
        <div className="flex items-center justify-between py-3">
          <span className="text-gray-300">Trend</span>
          <span className="text-lg font-semibold text-green-500">{technicalIndicators.trend}</span>
        </div>
      </div>
    </div>
  );
};

export default TechnicalAnalysis;