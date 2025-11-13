import React, { useState, useMemo, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, TrendingUp, DollarSign, Repeat2, Zap, LayoutGrid, BarChart3 } from 'lucide-react';
import { cryptoList as cryptoData } from '../data/cryptoData';

const FIAT_RATES = {
  USD: { rate: 1.00, symbol: '$', name: 'US Dollar' },
  EUR: { rate: 0.92, symbol: '€', name: 'Euro' },
  GBP: { rate: 0.80, symbol: '£', name: 'British Pound' },
  SAR: { rate: 3.75, symbol: 'SAR', name: 'Saudi Riyal' },
};

const NEWS_HEADLINES = [
  "Report: Institutional investment in cryptocurrencies hits a new high in the last quarter.",
  "Bitcoin surpasses analyst expectations, approaching new record highs.",
  "New Euro-backed stablecoin launches in European markets.",
  "Trading platforms strengthen cybersecurity measures against increasing breaches.",
  "Ethereum announces network expansion plan to boost transaction speed.",
];

// --- HELPER FUNCTIONS & COMPONENTS ---

const formatCurrency = (amount) => {
  // Use 'compact' notation for large amounts for better fit in cards
  if (amount > 1e6) {
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(amount);
  }
  const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  return formatted;
};

const formatLargeNumber = (num) => {
  if (num >= 1e12) return '$' + (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
  return '$' + formatCurrency(num);
};

const ChangePill = ({ change }) => {
  const isPositive = change >= 0;
  const color = isPositive ? 'text-green-400 bg-green-900/30' : 'text-red-400 bg-red-900/30';
  const Icon = isPositive ? ArrowUp : ArrowDown;
  const sign = isPositive ? '+' : '';

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {`${sign}${change.toFixed(2)}%`}
    </div>
  );
};

const SortableHeader = ({ title, sortKey, currentSort, onClick, className }) => {
  const isSorted = currentSort.key === sortKey;
  let Icon = ArrowUpDown;
  if (isSorted) {
    Icon = currentSort.direction === 'asc' ? ArrowUp : ArrowDown;
  }

  return (
    <th
      scope="col"
      className={`px-6 py-3 cursor-pointer select-none whitespace-nowrap ${className}`}
      onClick={() => onClick(sortKey)}
    >
      <div className="flex items-center justify-end group">
        <span className="group-hover:text-white transition duration-150">
          {title}
        </span>
        <Icon className={`w-3 h-3 ml-1 ${isSorted ? 'text-white' : 'text-gray-500 group-hover:text-gray-400'}`} />
      </div>
    </th>
  );
};

// --- STAT CARD COMPONENT (New) ---
const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className={`bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 transition duration-300 hover:border-blue-500 hover:scale-105`}>
    <div className="flex items-center justify-between">
      <div className='text-left'>
        <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
        <p className="text-2xl font-extrabold text-white">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${colorClass} bg-opacity-20`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
    </div>
  </div>
);


// --- NEWS TICKER COMPONENT ---
const NewsTicker = ({ headlines }) => {
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  // Auto-rotate the news headline every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNewsIndex(prevIndex => (prevIndex + 1) % headlines.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [headlines.length]);

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 space-y-3">
      <h2 className="text-lg font-semibold text-white flex items-center border-b border-gray-700 pb-2">
        <Zap className="w-5 h-5 text-yellow-400 mr-2" />
        Crypto News
      </h2>
      <div className="flex items-center overflow-hidden">
        <div
          key={currentNewsIndex}
          className="text-sm text-gray-300 transition-opacity duration-1000 ease-in-out opacity-100"
        >
          {headlines[currentNewsIndex]}
        </div>
      </div>
    </div>
  );
};

// --- CURRENCY CONVERTER COMPONENT ---
const CurrencyConverter = ({ cryptoList, rates }) => {
  const [cryptoAmount, setCryptoAmount] = useState(1);
  const [selectedCryptoId, setSelectedCryptoId] = useState('bitcoin');
  const [selectedFiat, setSelectedFiat] = useState('USD');

  const currentCrypto = cryptoList.find(c => c.id === selectedCryptoId) || cryptoList[0];
  const fiatRate = rates[selectedFiat].rate;
  const fiatSymbol = rates[selectedFiat].symbol;

  const cryptoPriceUSD = currentCrypto ? currentCrypto.price : 0;
  const convertedValue = (cryptoAmount * cryptoPriceUSD * fiatRate);

  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-700 space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center border-b border-gray-700 pb-2">
        <Repeat2 className="w-5 h-5 text-blue-400 mr-2" />
        Quick Currency Converter
      </h2>

      {/* Input Crypto Amount */}
      <div>
        <label htmlFor="cryptoAmount" className="block text-xs font-medium text-gray-400 mb-1">Amount</label>
        <input
          id="cryptoAmount"
          type="number"
          value={cryptoAmount}
          onChange={(e) => setCryptoAmount(Math.max(0, parseFloat(e.target.value)))}
          className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-left"
          placeholder="Enter Amount"
          min="0"
        />
      </div>

      {/* Select Crypto */}
      <div>
        <label htmlFor="selectCrypto" className="block text-xs font-medium text-gray-400 mb-1">Crypto Currency</label>
        <select
          id="selectCrypto"
          value={selectedCryptoId}
          onChange={(e) => setSelectedCryptoId(e.target.value)}
          className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none transition duration-150 text-left"
        >
          {cryptoList.map(crypto => (
            <option key={crypto.id} value={crypto.id}>
              {crypto.name} ({crypto.symbol})
            </option>
          ))}
        </select>
      </div>

      {/* Select Fiat */}
      <div>
        <label htmlFor="selectFiat" className="block text-xs font-medium text-gray-400 mb-1">Fiat Currency</label>
        <select
          id="selectFiat"
          value={selectedFiat}
          onChange={(e) => setSelectedFiat(e.target.value)}
          className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none transition duration-150 text-left"
        >
          {Object.entries(rates).map(([key, value]) => (
            <option key={key} value={key}>
              {value.name} ({value.symbol})
            </option>
          ))}
        </select>
      </div>

      {/* Result Display */}
      <div className="pt-3 border-t border-gray-700">
        <p className="text-sm text-gray-400 mb-1 flex items-center">
          <DollarSign className="w-4 h-4 text-green-400 mr-1" />
          Total Value in {rates[selectedFiat].name}:
        </p>
        <div className="text-2xl font-bold text-green-400 bg-gray-700/50 p-3 rounded-lg text-center font-mono">
          {formatCurrency(convertedValue || 0)} {fiatSymbol}
        </div>
        <p className="text-xs text-gray-500 mt-1 text-center">
          Current Price of {currentCrypto.symbol}: {formatCurrency(cryptoPriceUSD || 0)} $
        </p>
      </div>
    </div>
  );
};


const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'rank', direction: 'asc' });

  // Function to handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  // --- Calculations for Stat Cards ---
  const totalCoins = cryptoData.length;

  const totalMarketCap = useMemo(() =>
    cryptoData.reduce((sum, crypto) => sum + crypto.marketCap, 0), []
  );

  const totalVolume = useMemo(() =>
    cryptoData.reduce((sum, crypto) => sum + crypto.volume, 0), []
  );
  // -----------------------------------


  // Filter and sort data logic
  const filteredAndSortedData = useMemo(() => {
    let sortableData = [...cryptoData];

    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      sortableData = sortableData.filter(crypto =>
        crypto.name.toLowerCase().includes(lowerCaseSearch) ||
        crypto.symbol.toLowerCase().includes(lowerCaseSearch)
      );
    }

    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableData;
  }, [searchTerm, sortConfig]);

  return (
    <div className="min-h-screen bg-gray-900 rounded p-4 sm:p-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white mb-6 border-b border-gray-700 pb-3">
          Dashboard
        </h1>

        {/* --- NEW: Stat Cards Grid (Responsive) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Card 1: Total Coins */}
          <StatCard
            title="Total Coins Available"
            value={totalCoins.toString()}
            icon={LayoutGrid}
            colorClass="text-blue-400"
          />

          {/* Card 2: Total Market Cap */}
          <StatCard
            title="Total Market Cap"
            value={formatLargeNumber(totalMarketCap)}
            icon={DollarSign}
            colorClass="text-green-400"
          />

          {/* Card 3: Total Volume (24h) */}
          <StatCard
            title="Total Volume (24h)"
            value={formatLargeNumber(totalVolume)}
            icon={BarChart3}
            colorClass="text-yellow-400"
          />

        </div>
        {/* --- END Stat Cards Grid --- */}

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-left"
          />
        </div>

        {/* Main Content Layout: Table + Aside */}
        <div className="grid grid-cols-1 xl:grid-cols-[4fr_2fr] gap-8">

          {/* 1. Main Table Section */}
          <div className="w-full">
            <div className="shadow-2xl rounded-xl overflow-scroll border border-gray-800 h-[70vh] md:h-[109vh]">
              <table className="w-full text-sm text-left text-gray-400">

                {/* Table Header */}
                <thead className="text-xs uppercase bg-gray-800 text-gray-400 border-b border-gray-700 sticky top-0">
                  <tr>
                    {/* Rank */}
                    <th
                      scope="col"
                      className="p-4 cursor-pointer text-center select-none"
                      onClick={() => handleSort('rank')}
                    >
                      <div className="flex items-center justify-center group">
                        <span>Rank</span>
                        {sortConfig.key === 'rank' && (
                          sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 mr-1 text-white" /> : <ArrowDown className="w-3 h-3 mr-1 text-white" />
                        )}
                      </div>
                    </th>

                    {/* Asset (Name) - Text is left-aligned */}
                    <th
                      scope="col"
                      className="px-6 py-3 cursor-pointer select-none text-left"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center group">
                        <span>Asset</span>
                        {sortConfig.key === 'name' ? (
                          sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 mr-1 text-white" /> : <ArrowDown className="w-3 h-3 mr-1 text-white" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 mr-1 text-gray-500 group-hover:text-gray-400" />
                        )}
                      </div>
                    </th>

                    {/* Price - Right-aligned numbers */}
                    <SortableHeader
                      title="Price"
                      sortKey="price"
                      currentSort={sortConfig}
                      onClick={handleSort}
                      className="text-right"
                    />

                    {/* 24h Change - Right-aligned numbers */}
                    <SortableHeader
                      title="24h Change"
                      sortKey="change24h"
                      currentSort={sortConfig}
                      onClick={handleSort}
                      className="text-right"
                    />

                    {/* 7d Change - Right-aligned numbers */}
                    <SortableHeader
                      title="7d Change"
                      sortKey="change7d"
                      currentSort={sortConfig}
                      onClick={handleSort}
                      className="text-right"
                    />

                    {/* Market Cap - Right-aligned numbers */}
                    <SortableHeader
                      title="Market Cap"
                      sortKey="marketCap"
                      currentSort={sortConfig}
                      onClick={handleSort}
                      className="text-right"
                    />

                    {/* Volume - Right-aligned numbers */}
                    <SortableHeader
                      title="Volume (24h)"
                      sortKey="volume"
                      currentSort={sortConfig}
                      onClick={handleSort}
                      className="text-right"
                    />
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {filteredAndSortedData.length > 0 ? (
                    filteredAndSortedData.map((crypto) => (
                      <tr
                        key={crypto.id}
                        className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800 hover:scale-105 transition duration-150 cursor-pointer"
                      >
                        {/* Rank */}
                        <td className="p-4 font-semibold text-center text-gray-300">
                          {crypto.rank}
                        </td>

                        {/* Asset Name and Symbol - Left-aligned text */}
                        <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap text-left">
                          <div className="flex items-center">
                            <img className="w-6 h-6 rounded-full mr-3" src={crypto.icon} alt={`${crypto.name} logo`} onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/24x24/1F2937/FFFFFF?text=?" }} />
                            <div className='text-left'>
                              <p className="text-base text-white font-bold">{crypto.name}</p>
                              <p className="text-xs text-gray-400">{crypto.symbol}</p>
                            </div>
                          </div>
                        </th>

                        {/* Price - Right-aligned number */}
                        <td className="px-6 py-4 text-right font-mono text-white">
                          {formatCurrency(crypto.price)} $
                        </td>

                        {/* 24h Change - Right-aligned number */}
                        <td className="px-6 py-4 text-right">
                          <ChangePill change={crypto.change24h} />
                        </td>

                        {/* 7d Change - Right-aligned number */}
                        <td className="px-6 py-4 text-right">
                          <ChangePill change={crypto.change7d} />
                        </td>

                        {/* Market Cap  */}
                        <td className="px-6 py-4 text-right font-medium text-gray-300">
                          {formatLargeNumber(crypto.marketCap)}
                        </td>

                        {/* Volume */}
                        <td className="px-6 py-4 text-right text-gray-400">
                          {formatLargeNumber(crypto.volume)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-lg text-gray-500">
                        No results found for "{searchTerm}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Aside Section*/}
          <aside className="block space-y-8 h-full">
            <NewsTicker headlines={NEWS_HEADLINES} />
            <CurrencyConverter cryptoList={cryptoData} rates={FIAT_RATES} />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;