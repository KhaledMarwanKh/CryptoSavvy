import React, { useState, useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import { FiEdit3 } from 'react-icons/fi';
import { generateAreaData, generateCandlestickData } from '../data/cryptoData';

const ChartSection = ({ crypto }) => {
  const [candleData, setCandleData] = useState([]);
  const [areaChartData, setAreaChartData] = useState([]);

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [chartType, setChartType] = useState('Candles');
  const [showDrawingEditor, setShowDrawingEditor] = useState(false);

  const periods = ['1m', '5m', '24h', '7d', '1M'];
  const chartTypes = ['Candles', 'Area'];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: '#0f1115' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#374151',
      },
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
      },
    });

    chartRef.current = chart;

    // Add series based on chart type
    if (chartType === 'Candles') {
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });
      candlestickSeries.setData(candleData);
      seriesRef.current = candlestickSeries;
    } else if (chartType === 'Area') {
      const areaSeries = chart.addAreaSeries({
        topColor: 'rgba(6, 182, 212, 0.4)',
        bottomColor: 'rgba(6, 182, 212, 0.0)',
        lineColor: '#06b6d4',
        lineWidth: 2,
      });
      areaSeries.setData(areaChartData);
      seriesRef.current = areaSeries;
    }

    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [chartType, candleData, areaChartData]);

  useEffect(() => {
    const candle = generateCandlestickData(crypto?.price);
    const area = generateAreaData(candle);

    setCandleData(candle);
    setAreaChartData(area);
  }, [crypto])

  return (
    <div className="bg-[#0f1115] rounded-xl border border-gray-800 p-6">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4 flex-col md:flex-row">
        <h2 className="text-lg font-semibold mb-3">{crypto?.name} - USD</h2>

        <div className="flex items-center flex-col md:flex-row gap-4">
          {/* Period Selector */}
          <div className="flex items-center gap-1 bg-[#0a0b0d] rounded-lg p-1">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
                  }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center gap-1 bg-[#0a0b0d] rounded-lg p-1">
            {chartTypes.map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${chartType === type
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Draw/Analysis Button - Only show when Candles is selected */}
          {/* {chartType === 'Candles' && (
            <button
              onClick={() => setShowDrawingEditor(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-all text-sm font-medium"
            >
              <FiEdit3 className="w-4 h-4" />
              <span>Draw / Analysis</span>
            </button>
          )} */}
        </div>
      </div>

      {/* Chart Container */}
      <div ref={chartContainerRef} className="rounded-lg overflow-hidden" />

      {/* Drawing Editor Modal */}
      {/* {showDrawingEditor && (
        <DrawingEditor onClose={() => setShowDrawingEditor(false)} />
      )} */}
    </div>
  );
};

export default ChartSection;