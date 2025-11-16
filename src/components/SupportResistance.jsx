import React from 'react';
import { supportResistanceLevels } from '../data/cryptoData';

const SupportResistance = () => {
  return (
    <div className="bg-[#0f1115] rounded-xl border border-gray-800 p-6">
      <h2 className="text-lg font-semibold mb-4">Support & Resistance Levels</h2>

      <div className="space-y-4">
        {/* Resistance Levels */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3">Resistance</h3>
          <div className="space-y-2">
            {supportResistanceLevels.resistance.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-3 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                <span className="text-red-400 font-medium">{item.level}</span>
                <span className="text-red-400 font-semibold">{item.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Price */}
        <div className="py-3 my-2">
          <div className="flex items-center justify-center py-3 px-4 bg-gray-800 rounded-lg border border-gray-700">
            <span className="text-sm text-gray-400">{supportResistanceLevels.currentPrice}</span>
          </div>
        </div>

        {/* Support Levels */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3">Support</h3>
          <div className="space-y-2">
            {supportResistanceLevels.support.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-3 bg-green-500/10 border border-green-500/20 rounded-lg"
              >
                <span className="text-green-400 font-medium">{item.level}</span>
                <span className="text-green-400 font-semibold">{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportResistance;