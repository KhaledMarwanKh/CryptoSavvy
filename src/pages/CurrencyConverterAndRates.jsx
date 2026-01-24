import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import { currencies, generateHistoricalData, getAllRatesForCurrency, convertCurrency } from '../data/cryptoData';
import ExchangeChart from '../components/ExchangeChart';
import CurrencyConverter from '../components/CurrencyConverter';
import RatesTable from '../components/RatesTable';

const intervals = [
  { label: '12h', value: '12h' },
  { label: '1D', value: '1d' },
  { label: '1M', value: '1M' },
  { label: '1Y', value: '1Y' },
  { label: '10Y', value: '10Y' },
];

const CurrencyConverterAndRates = () => {
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [quoteCurrency, setQuoteCurrency] = useState('EUR');
  const [selectedInterval, setSelectedInterval] = useState('1d');
  const [chartData, setChartData] = useState([]);
  const [rates, setRates] = useState({});

  const refreshData = useCallback(() => {
    // Simulate API call delay
    setTimeout(() => {
      const newChartData = generateHistoricalData(baseCurrency, quoteCurrency, selectedInterval);
      const newRates = getAllRatesForCurrency(baseCurrency);
      setChartData(newChartData);
      setRates(newRates);
    }, 300);
  }, [baseCurrency, quoteCurrency, selectedInterval]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const currentRate = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
  const previousRate = chartData.length > 1 ? chartData[chartData.length - 2].value : currentRate;
  const rateChange = currentRate - previousRate;
  const rateChangePercent = previousRate !== 0 ? ((rateChange / previousRate) * 100).toFixed(2) : 0;
  const isPositive = rateChange >= 0;

  return (
    <div className="min-h-screen bg-[#18191d] text-gray-100 rounded animate-in fade-in">

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-6 py-3 space-y-3">
        {/* Chart Section */}
        <section className="bg-[#0f1115] border border-gray-800/50 rounded-xl p-4 sm:p-6">

          {/* Chart Header */}
          <div className="flex flex-col xl:flex-row xl:justify-between items-center gap-4 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* Currency Selectors */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <select
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                  className="bg-gray-700 border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:border-blue-500 transition-colors cursor-pointer"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
                <div className="p-2 bg-[#0a0b0d] rounded-lg rotate-90 sm:rotate-0">
                  <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                </div>
                <select
                  value={quoteCurrency}
                  onChange={(e) => setQuoteCurrency(e.target.value)}
                  className="bg-gray-700 border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:border-blue-500 transition-colors cursor-pointer"
                >
                  {currencies.filter(c => c.code !== baseCurrency).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Rate Display */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-white">
                  {currentRate.toFixed(4)}
                </span>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="text-sm font-medium">
                    {isPositive ? '+' : ''}{rateChangePercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Interval Selector */}
            <div className="w-fit flex items-center gap-1 bg-[#0a0b0d] p-1 rounded-lg">
              {intervals.map((interval) => (
                <button
                  key={interval.value}
                  onClick={() => setSelectedInterval(interval.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${selectedInterval === interval.value
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                >
                  {interval.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="h-[300px] sm:h-[400px]">
            <ExchangeChart
              data={chartData}
              isPositive={isPositive}
              baseCurrency={baseCurrency}
              quoteCurrency={quoteCurrency}
            />
          </div>
        </section>

        {/* Converter and Table Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_4fr] gap-3">
          {/* Converter */}
          <div className='lg:place-self-start'>
            <CurrencyConverter
              currencies={currencies}
              convertCurrency={convertCurrency}
            />
          </div>

          {/* Rates Table */}
          <div>
            <RatesTable
              baseCurrency={baseCurrency}
              rates={rates}
              currencies={currencies}
              onCurrencySelect={(currency) => setQuoteCurrency(currency)}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CurrencyConverterAndRates;
