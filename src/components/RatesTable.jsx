import React from 'react';
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';

const RatesTable = ({ baseCurrency, rates, currencies, onCurrencySelect }) => {
  const getCurrencyInfo = (code) => {
    return currencies.find(c => c.code === code) || { code, name: code, symbol: '' };
  };

  return (
    <div className="bg-[#0f1115] border border-gray-800/50 rounded-xl overflow-hidden h-[506px]">

      <div className="overflow-scroll h-full">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800/50">
              <th className="text-left py-3 px-5 text-sm font-medium text-gray-400">Currency</th>
              <th className="text-right py-3 px-5 text-sm font-medium text-gray-400">Rate</th>
              <th className="text-right py-3 px-5 text-sm font-medium text-gray-400">24h Change</th>
              <th className="text-right py-3 px-5 text-sm font-medium text-gray-400">7d Change</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(rates).map(([code, data]) => {
              const currency = getCurrencyInfo(code);
              const is24hPositive = data.change24h >= 0;
              const is7dPositive = data.change7d >= 0;

              return (
                <tr
                  key={code}
                  onClick={() => onCurrencySelect(code)}
                  className="border-b border-gray-800/30 hover:bg-[#1a1a24] cursor-pointer transition-colors duration-150 group"
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-sm font-bold text-white">
                        {code.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{code}</p>
                        <p className="text-sm text-gray-400">{currency.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <span className="text-white font-medium">
                      {data.rate.toFixed(4)}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${is24hPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                      {is24hPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span className="text-sm font-medium">
                        {is24hPositive ? '+' : ''}{data.change24h}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${is7dPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                      {is7dPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span className="text-sm font-medium">
                        {is7dPositive ? '+' : ''}{data.change7d}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RatesTable;
