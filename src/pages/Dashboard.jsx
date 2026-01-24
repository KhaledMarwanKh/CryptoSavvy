import React, { useState, useMemo, useEffect } from 'react';
import { DollarSign, LayoutGrid, BarChart3, TrendingUp, TrendingDown, FilterIcon } from 'lucide-react';
import { FIAT_RATES, formatLargeNumbers } from '../data/cryptoData';
import { useNavigate } from 'react-router';
import CurrencyConverter from '../components/CurrencyConventor';
import NewsTicker from '../components/NewsTricker';
import StatCard from '../components/StatCard';
import { formatLargeNumber } from '../data/cryptoData';
import { FaSearch } from 'react-icons/fa';
import FilterDialog from '../components/FilterDialog';
import { getFilteredData } from '../data/component-functions';
import { io } from 'socket.io-client';

const ChangePill = ({ change }) => {
  const isPositive = change >= 0;
  const color = isPositive ? 'text-green-400 bg-green-900/30' : 'text-red-400 bg-red-900/30';
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const sign = isPositive ? '+' : '';

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {`${sign}${change.toFixed(2)}%`}
    </div>
  );
};

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [crypto, setCrypto] = useState([]);
  const [filterConfig, setFilterConfig] = useState({
    applyFilters: false,
    volume: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY
    },
    marketCap: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY
    },
    price: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY
    },
  })
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'index', direction: 'asc' });
  const navigate = useNavigate();

  // --- Calculations for Stat Cards ---
  const totalCoins = crypto.length;

  const totalMarketCap = useMemo(() => {
    if (crypto) {
      return crypto?.reduce((sum, crypto) => sum + crypto?.marketCap, 0)
    }

    return 0;
  }, [crypto]);

  const totalVolume = useMemo(() => {
    if (crypto) {
      return crypto?.reduce((sum, crypto) => sum + crypto?.volume, 0)
    }

    return 0;
  }, [crypto]

  );

  // Filter and sort data logic
  const filteredAndSortedData = useMemo(() => {

    if (crypto) {
      return getFilteredData(searchTerm, sortConfig, crypto, filterConfig);
    }

    return [];

  }, [searchTerm, sortConfig, crypto, filterConfig]);

  const socket = io("https://lounge-producing-electron-one.trycloudflare.com/");

  useEffect(() => {
    setIsLoading(true);

    socket.connect("connect", () => {
      console.log("ON");
    })

    socket.emit("setMode", {
      mode: "dashboard",
      page: currentPage,
      pageSize: pageSize
    })

    socket.on("cryptoData", (data) => {
      if (!data) {
        setCrypto([]);
      }

      const newData = Object.values(data).map(value => value.meta);

      if (isLoading) {
        setCrypto(newData)
      } else {
        if (newData?.length < filteredAndSortedData?.length) {
          const updatedData = filteredAndSortedData.map((crypto) => {
            const updatedItem = newData.filter(newCrypto => newCrypto.symbol === crypto.symbol)[0];

            if (updatedItem) {
              return updatedItem;
            } else {
              return crypto;
            }

          });

          setCrypto(updatedData);
        } else {
          setCrypto(newData);
        }

      }

      setIsLoading(false);
    })

    setTimeout(() => {
      setIsLoading(false);
      setCrypto([
        {
          "index": "1",
          "baseSymbol": "BTC",
          "symbol": "Bitcoin",
          "price": 67234.50,
          "change24h": 2.45,
          "low24h": 2000,
          "high24h": 3000,
          "circulatingSupply": 3000,
          "marketCap": 1320000000000,
          "volume": 32000000000,
          "logo": "https://cryptologos.cc/logos/bitcoin-btc-logo.png"
        },
        {
          "index": "2",
          "baseSymbol": "BTC",
          "symbol": "Bitcoin",
          "price": 5050000,
          "change24h": 2.00,
          "low24h": 2001,
          "high24h": 300,
          "circulatingSupply": 3000,
          "marketCap": 13200000,
          "volume": 320000,
          "logo": "https://cryptologos.cc/logos/bitcoin-btc-logo.png"
        },
      ])
    }, 3000)


  }, [pageSize, currentPage]);

  return (
    <div className="overflow-y-scroll bg-[#0f121a] rounded p-4 sm:p-8 font-inter fade-in animate-in relative">
      <div className="max-w-7xl mx-auto">

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

        {/* Main Content Layout: Table + Aside */}
        <div className="grid grid-cols-1 lg:grid-cols-[4fr_2fr] gap-8">

          {/* 1. Main Table Section */}
          <div className="w-full">
            <div className="shadow-2xl rounded-xl overflow-scroll border border-gray-800 h-[70vh] md:h-[130vh] px-3 bg-[#0f1115]">
              {/* Search Bar */}
              <div className="my-4 flex gap-2">
                <div className='relative grow'>
                  <FaSearch className='absolute opacity-25 right-3 text-xl top-[50%] translate-y-[-50%]' />
                  <input
                    type="text"
                    placeholder="Search by name or symbol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-5 py-3 bg-gray-700 border border-gray-700 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-left outline-none text-[0.7rem] sm:text-[1rem]"
                  />
                </div>

                <button className='p-3 bg-gray-700 rounded-lg hover:bg-gray-800 transition-colors duration-150' onClick={() => setFilterConfig((prev) => ({ ...prev, applyFilters: true }))}>
                  <FilterIcon className='w-4 h-4' />
                </button>
              </div>

              <div className='flex items-center  justify-between'>
                <button disabled={isLoading} onClick={() => setCurrentPage(currentPage + 1)} className={`w-[100px] py-2 my-2 ${isLoading || currentPage === 1 ? "bg-gray-600 pointer-events-none" : "bg-blue-600"} rounded-lg active:bg-gray-700 transition-all duration-100`}>Previous</button>
                <button disabled={isLoading} onClick={() => setCurrentPage(currentPage - 1)} className={`w-[100px] py-2 my-2 ${isLoading ? "bg-gray-600 pointer-events-none" : "bg-blue-600"} rounded-lg active:bg-gray-700 transition-all duration-100`}>Next</button>
              </div>

              <table className="w-full text-sm text-left text-gray-400">

                {/* Table Header */}
                <thead className="text-xs uppercase bg-[#0f1115] text-gray-400 border-b border-gray-700 sticky top-0">
                  <tr>
                    <th
                      scope="col"
                      className="p-4 text-center select-none"
                    >
                      Rank
                    </th>

                    <th
                      scope="col"
                      className="px-6 py-3 select-none text-center"
                    >
                      Asset
                    </th>

                    <th
                      scope="col"
                      className={`px-6 py-3 select-none whitespace-nowrap text-center`}
                    >
                      Price
                    </th>

                    <th
                      scope="col"
                      className={`px-6 py-3 select-none whitespace-nowrap text-center`}
                    >
                      24h Change
                    </th>

                    <th
                      scope="col"
                      className={`px-6 py-3 select-none whitespace-nowrap text-center`}
                    >
                      High 24h
                    </th>

                    <th
                      scope="col"
                      className={`px-6 py-3 select-none whitespace-nowrap text-center`}
                    >
                      Low 24h
                    </th>

                    <th
                      scope="col"
                      className={`px-6 py-3 select-none whitespace-nowrap text-center`}
                    >
                      Market Cap
                    </th>

                    <th
                      scope="col"
                      className={`px-6 py-3 select-none whitespace-nowrap text-center`}
                    >
                      Volume (24h)
                    </th>

                    <th
                      scope="col"
                      className={`px-6 py-3 select-none whitespace-nowrap text-center`}
                    >
                      Circulating Supply
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {filteredAndSortedData?.length > 0 && !isLoading ? (
                    filteredAndSortedData?.map((crypto) => (
                      <tr
                        onClick={() => navigate('/coin/' + crypto?.symbol)}
                        key={crypto?.symbol}
                        className="bg-[#0f1115] border-b border-gray-800 hover:bg-gray-800 transition duration-150 cursor-pointer"
                      >
                        {/* Rank */}
                        <td className="p-4 font-semibold text-center text-gray-300">
                          {crypto?.index}
                        </td>

                        {/* Asset Name and Symbol - Left-aligned text */}
                        <th scope="row" className="px-3 py-4 font-medium text-white whitespace-nowrap text-center">
                          <div className="flex items-center">
                            <img className="w-4 h-4 rounded-full mr-2" src={crypto?.logo} alt={`${crypto?.symbol}`} />
                            <div className='flex flex-col justify-center'>
                              <p className="text-xs text-gray-400">{crypto?.symbol}</p>
                              <p className="text-sm text-gray-300">{crypto?.baseSymbol}</p>
                            </div>
                          </div>
                        </th>

                        {/* Price - Right-aligned number */}
                        <td className=" py-4 text-center font-mono text-white">
                          {formatLargeNumber(crypto?.price)}
                        </td>

                        {/* 24h Change - Right-aligned number */}
                        <td className="px-6 py-4 text-center">
                          <ChangePill change={crypto?.changePercent | 0.00} />
                        </td>

                        {/* 7d Change - Right-aligned number */}
                        <td className="px-6 py-4 text-center">
                          {formatLargeNumber(crypto?.high24h)}
                        </td>

                        <td className="px-6 py-4 text-center">
                          {formatLargeNumber(crypto?.low24h)}
                        </td>

                        {/* Market Cap  */}
                        <td className="px-6 py-4 text-center font-medium text-gray-300">
                          {formatLargeNumber(crypto?.marketCap)}
                        </td>

                        {/* Volume */}
                        <td className="px-6 py-4 text-center text-gray-400">
                          {formatLargeNumber(crypto?.volume)}
                        </td>

                        {/** Circulating Supply */}
                        <td className="px-6 py-4 text-center text-gray-400">
                          {formatLargeNumbers(crypto?.circulatingSupply)}
                        </td>
                      </tr>
                    ))
                  ) : searchTerm.trim() === "" && isLoading ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-lg text-gray-500">

                        <div className='w-full flex flex-col items-center justify-center gap-2'>
                          <span className="loading loading-spinner"></span>
                          Loading
                        </div>

                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-lg text-gray-500">
                        No results found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Aside Section*/}
          <aside className="block space-y-8 h-full">
            <NewsTicker />
            <CurrencyConverter cryptoList={crypto} rates={FIAT_RATES} />
          </aside>
        </div>
      </div>

      {
        filterConfig.applyFilters && (
          <FilterDialog
            filterConfig={filterConfig}
            sortConfig={sortConfig}
            setFilterConfig={setFilterConfig}
            setSortConfig={setSortConfig}
          />
        )
      }


    </div>
  );
};

export default Dashboard;