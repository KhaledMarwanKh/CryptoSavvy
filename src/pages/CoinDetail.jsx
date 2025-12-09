import React, { useEffect, useState } from 'react';
import { FiBell, FiTrendingUp } from 'react-icons/fi';
import ChartSection from '../components/ChartSection';
import OrderBook from '../components/OrderBook';
import TechnicalAnalysis from '../components/TechnicalAnalysis';
import SupportResistance from '../components/SupportResistance';
import { cryptoList, formatLargeNumber } from '../data/cryptoData';
import { useParams } from 'react-router';
import { ArrowDown, ArrowUp } from 'lucide-react';
import AnalysesEditor from '../components/AnalysesEditor';
import CandlestickLoader from '../components/CandleStickLoader';

const CoinDetails = () => {
  const { coinId } = useParams();
  const [coinDetails, setCoinDetails] = useState({});
  const [editorState, setEditorState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setCoinDetails(cryptoList.filter(coin => coin.id === coinId)[0]);
    }
  }, [coinId, isLoading]);


  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000)

    return () => clearTimeout(timeout)
  }, [])

  if (isLoading) {
    return (
      <div className="h-full rounded-lg bg-[#0f121a] text-gray-100 overflow-scroll fade-in animate-in relative">
        <CandlestickLoader />
      </div>
    )
  }

  return (
    <div className="h-[90vh] rounded-lg bg-[#0f121a] text-gray-100 overflow-scroll fade-in animate-in relative">

      {/** Editor Section */}
      {
        editorState && <AnalysesEditor crypto={coinDetails} setEditorState={setEditorState} editorState={editorState} />
      }

      {/* Header */}
      {
        !editorState && (
          <header className="border-b border-gray-800 bg-[#0f1115] px-6 py-4 header-coin">
            <div className="flex items-center justify-between flex-col gap-3 sm:flex-row h">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold">
                    <img src={crypto?.icon} className='w-full h-full rounded-full' alt="" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold">{coinDetails?.name}</h1>
                      <span className="text-xs bg-gray-800 px-2 py-1 rounded">#{coinDetails?.rank}</span>
                    </div>
                    <p className="text-sm text-gray-400">{coinDetails?.symbol}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <FiBell className="w-4 h-4" />
                  <span className="text-sm">Price Alert</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">
                  <FiTrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Trade</span>
                </button>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center flex-col sm:flex-row gap-8 mt-4 statis">
              <div>
                <p className="text-xs text-center md:text-left text-gray-400 mb-1">Price</p>
                <p className="text-2xl font-bold">{coinDetails?.price?.toFixed(2) || 0.00}$</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">24h Change</p>
                <p className={`text-lg font-semibold ${coinDetails?.change24h > 0 ? "text-green-500" : coinDetails?.change24h === 0 ? "text-gray-500" : "text-red-500"} flex items-center gap-1`}>
                  <span>{coinDetails?.change24h > 0 ? <ArrowUp /> : <ArrowDown />}</span> {coinDetails?.change24h?.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Market Cap</p>
                <p className="text-lg font-semibold">{formatLargeNumber(coinDetails?.marketCap?.toFixed(2))}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">24h Volume</p>
                <p className="text-lg font-semibold">{formatLargeNumber(coinDetails?.volume?.toFixed(2))}</p>
              </div>
            </div>
          </header>
        )
      }

      {/* Main Content */}
      {
        !editorState && (
          <div className="p-3 sm:p-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Chart Section - Left side */}
              <div className="col-span-12 lg:col-span-8">
                <ChartSection crypto={cryptoList.filter(coin => coin.id === coinId)[0]} setEditorState={setEditorState} />
              </div>

              {/* OrderBook - Right side */}
              <div className="col-span-12 lg:col-span-4">
                <OrderBook basePrice={cryptoList.filter(coin => coin.id === coinId)[0]?.price} />
              </div>
            </div>

            {/* Technical Analysis Section */}
            <div className="grid grid-cols-12 gap-6 mt-6">
              <div className="col-span-12 lg:col-span-6">
                <TechnicalAnalysis />
              </div>
              <div className="col-span-12 lg:col-span-6">
                <SupportResistance />
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
};

export default CoinDetails;