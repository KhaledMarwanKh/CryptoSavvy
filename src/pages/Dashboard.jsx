import React, { useState, useMemo, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, TrendingUp, DollarSign, Repeat2, Zap, LayoutGrid, BarChart3 } from 'lucide-react';
import { cryptoList as cryptoData, FIAT_RATES, formatCurrency, NEWS_HEADLINES, updateCryptoTable } from '../data/cryptoData';
import { useNavigate } from 'react-router';
import CurrencyConverter from '../components/CurrencyConventor';
import SortableHeader from '../components/SortableHeader';
import NewsTicker from '../components/NewsTricker';
import StatCard from '../components/StatCard';
import { formatLargeNumber } from '../data/cryptoData';

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

const Dashboard = () => {
  const [crypto, setCrypto] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'rank', direction: 'asc' });
  const navigate = useNavigate();

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
  const totalCoins = crypto.length;

  const totalMarketCap = useMemo(() =>
    crypto.reduce((sum, crypto) => sum + crypto.marketCap, 0), [crypto]
  );

  const totalVolume = useMemo(() =>
    crypto.reduce((sum, crypto) => sum + crypto.volume, 0), [crypto]
  );

  // Filter and sort data logic
  const filteredAndSortedData = useMemo(() => {
    let sortableData = [...crypto];

    if (searchTerm !== '') {
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
  }, [searchTerm, sortConfig, crypto]);

  useEffect(() => {
    setCrypto(cryptoData);
  }, []);

  useEffect(() => {

    let interval = setInterval(() => {
      setCrypto(updateCryptoTable(cryptoData));
    }, 3000)

    return () => clearInterval(interval)

  }, [])

  return (
    <div className="min-h-screen bg-[#0f121a] rounded p-4 sm:p-8 font-inter">
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
            className="w-full p-3 bg-[#0f1115] border border-gray-700 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-left"
          />
        </div>

        {/* Main Content Layout: Table + Aside */}
        <div className="grid grid-cols-1 xl:grid-cols-[4fr_2fr] gap-8">

          {/* 1. Main Table Section */}
          <div className="w-full">
            <div className="shadow-2xl rounded-xl overflow-scroll border border-gray-800 h-[70vh] md:h-[109vh]">
              <table className="w-full text-sm text-left text-gray-400">

                {/* Table Header */}
                <thead className="text-xs uppercase bg-[#0f1115] text-gray-400 border-b border-gray-700 sticky top-0">
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
                        onClick={() => navigate('/coin/' + crypto.id)}
                        key={crypto.id}
                        className="bg-[#0f1115]border-b border-gray-800 hover:bg-gray-800 hover:scale-105 transition duration-150 cursor-pointer"
                      >
                        {/* Rank */}
                        <td className="p-4 font-semibold text-center text-gray-300">
                          {crypto.rank}
                        </td>

                        {/* Asset Name and Symbol - Left-aligned text */}
                        <th scope="row" className="px-3 py-4 font-medium text-white whitespace-nowrap text-center">
                          <div className="flex items-center">
                            <img className="w-6 h-6 rounded-full mr-3" src={crypto.icon} alt={`${crypto.name} logo`} onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/24x24/1F2937/FFFFFF?text=?" }} />
                            <div className='text-left'>
                              <p className="text-base text-white font-bold">{crypto.name}</p>
                              <p className="text-xs text-gray-400">{crypto.symbol}</p>
                            </div>
                          </div>
                        </th>

                        {/* Price - Right-aligned number */}
                        <td className=" py-4 text-center font-mono text-white">
                          {formatCurrency(crypto.price)} $
                        </td>

                        {/* 24h Change - Right-aligned number */}
                        <td className="px-6 py-4 text-center">
                          <ChangePill change={crypto.change24h} />
                        </td>

                        {/* 7d Change - Right-aligned number */}
                        <td className="px-6 py-4 text-center">
                          <ChangePill change={crypto.change7d} />
                        </td>

                        {/* Market Cap  */}
                        <td className="px-6 py-4 text-center font-medium text-gray-300">
                          {formatLargeNumber(crypto.marketCap)}
                        </td>

                        {/* Volume */}
                        <td className="px-6 py-4 text-center text-gray-400">
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