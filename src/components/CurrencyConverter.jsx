import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, ArrowUpDown } from 'lucide-react';

const CurrencyConverter = ({ currencies, convertCurrency }) => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('1');
  const [result, setResult] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);

  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    const converted = convertCurrency(numAmount, fromCurrency, toCurrency);
    setResult(converted);
  }, [amount, fromCurrency, toCurrency, convertCurrency]);

  const handleSwapCurrencies = () => {
    setIsSwapping(true);
    setTimeout(() => {
      const temp = fromCurrency;
      setFromCurrency(toCurrency);
      setToCurrency(temp);
      setIsSwapping(false);
    }, 200);
  };

  const getSymbol = (code) => {
    const currency = currencies.find(c => c.code === code);
    return currency ? currency.symbol : '';
  };

  return (
    <div className="bg-[#0f1115] border border-gray-800/50 rounded-xl p-5 h-full">
      <div className="flex items-center gap-2 mb-5">
        <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
        <h2 className="text-lg font-semibold text-white">Currency Converter</h2>
      </div>

      <div className="space-y-4">
        {/* From Currency */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">From</label>
          <div className="flex gap-2">
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className={`flex-1 bg-[#0a0b0d] border border-gray-700 text-white px-4 py-3 rounded-lg focus:border-emerald-500 transition-all duration-200 cursor-pointer ${isSwapping ? 'translate-y-2 opacity-50' : ''
                }`}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
              {getSymbol(fromCurrency)}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#1a1a24] border border-gray-700 text-white text-lg font-medium pl-10 pr-4 py-3 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSwapCurrencies}
            className="p-3 bg-[#0a0b0d]/10 hover:bg-[#0a0b0d]/20 rounded-full text-gray-400 transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <ArrowUpDown className={`w-5 h-5 transition-transform duration-200 ${isSwapping ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* To Currency */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">To</label>
          <div className="flex gap-2">
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className={`flex-1 bg-[#0a0b0d] border border-gray-700 text-white px-4 py-3 rounded-lg focus:border-emerald-500 transition-all duration-200 cursor-pointer ${isSwapping ? '-translate-y-2 opacity-50' : ''
                }`}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
              {getSymbol(toCurrency)}
            </span>
            <div className="w-full bg-[#0f0f15] border border-gray-700 text-white text-lg font-medium pl-10 pr-4 py-3 rounded-lg">
              {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </div>
          </div>
        </div>

        {/* Exchange Rate Info */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Exchange Rate</span>
            <span className="text-gray-200 font-medium">
              1 {fromCurrency} = {convertCurrency(1, fromCurrency, toCurrency).toFixed(4)} {toCurrency}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
