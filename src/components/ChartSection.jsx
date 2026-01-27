import React, { useState, useEffect, useRef } from 'react';
import { CandlestickSeries, createChart, CrosshairMode } from 'lightweight-charts';
import { FiEdit3 } from 'react-icons/fi';
import { Activity, Download, EraserIcon, Fan, Layers, RotateCcw, Route, Square, TrendingUp, Triangle } from 'lucide-react';
import { FaRegHand, FaTimeline } from 'react-icons/fa6';
import { AxiosError } from 'axios';
import { handleDownloadChartImage, makeTool } from '../data/component-functions';
import axiosInst, { baseURL } from '../api/initAxios';

const TOOLS = [
  { name: 'TrendLine', toolNum: 0, icon: TrendingUp },
  { name: 'TimeLine', toolNum: 1, icon: FaTimeline },
  { name: 'Triangle', toolNum: 2, icon: Triangle },
  { name: 'Rectangle', toolNum: 3, icon: Square },
  { name: 'FibonacciChannel', toolNum: 4, icon: Layers },
  { name: 'FibonacciSpiral', toolNum: 5, icon: RotateCcw },
  { name: 'FibonacciWedge', toolNum: 6, icon: Fan },
  { name: 'Curve', toolNum: 7, icon: Activity },
  { name: 'Polyline', toolNum: 8, icon: Route },
  { name: 'Cursor', toolNum: 9, icon: FaRegHand },
  { name: 'Eraser', toolNum: 10, icon: EraserIcon }
]

const ChartSection = ({ setCursorMode, crypto, setEditorState, editorState }) => {
  const [candleData, setCandleData] = useState([]);
  // const [areaChartData, setAreaChartData] = useState([]);

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const toolRef = useRef(null);

  const [selectedPeriod, setSelectedPeriod] = useState('1m');
  const [selectedTool, setSelectedTool] = useState(9);
  const [isLoadingChartData, setIsLoadingChartData] = useState(true);

  const periods = ['1m', '5m', '1h', '1w', '1M'];

  const handleToolChange = (toolNum) => {
    const tool = makeTool(toolNum, chartRef.current, seriesRef.current, editorState, setCursorMode, toolRef, setSelectedTool);

    toolRef.current = tool;

    if (toolNum !== 9 || toolNum !== 10) {
      toolRef.current?.startDrawing();
    } else {
      toolRef.current?.stopDrawing();
      if (toolNum === 10) {
        toolRef.current?.remove();
      }
    }
  }

  const updateSeries = (lastCandle, price, time) => {
    if (seriesRef.current) {
      seriesRef.current.update({
        ...lastCandle,
        high: Math.max(lastCandle.high, price),
        low: Math.min(lastCandle.low, price),
        close: price,
      })
    }
  }

  const getData = async () => {
    setIsLoadingChartData(true);

    try {
      const candle = (await axiosInst.get(baseURL + `${baseURL}api/crypto/history?symbol=${crypto.baseSymbol}&interval=` + selectedPeriod)).data;

      setCandleData(candle);

    } catch (error) {
      console.log(1);
      if (error instanceof AxiosError) {
        console.log(error);
      }
    } finally {
      setIsLoadingChartData(false);
    }
  }


  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: '#0f1115' },
        textColor: '#9ca3af',
        fontSize: 10

      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#374151'
      },
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
      },
    });

    chartRef.current = chart;

    let series = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    series.setData(candleData);

    seriesRef.current = series;

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
      chart.remove();
      window.removeEventListener("resize", handleResize)
    }

  }, [candleData])

  useEffect(() => {
    handleToolChange(selectedTool);
  }, [selectedTool]);

  useEffect(() => {

    getData();


  }, []);

  useEffect(() => {

    if (!isLoadingChartData && candleData.length > 0) {

      const price = crypto?.price;

      const time = new Date(crypto?.lastUpdate).getMilliseconds();

      const lastCandle = candleData.at(candleData.length - 1);

      const lastCandleTime = lastCandle.time;

      console.log(price, time, lastCandle, lastCandleTime, crypto)

      if (lastCandleTime < time) {
        setCandleData((prev) => [...prev, {
          time,
          open: price,
          high: price,
          low: price,
          close: price
        }]);

        return;
      }

      updateSeries(lastCandle, price, time);

    }

  }, [isLoadingChartData, crypto, candleData, selectedPeriod])

  return (
    <div className="bg-[#0f1115] rounded-xl border border-gray-800 p-6">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4 flex-col md:flex-row">
        <h2 className="text-lg font-semibold mb-3">{crypto?.symbol} - USD</h2>

        <div className="flex items-center flex-col sm:flex-row gap-4">
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
          {/* <div className="flex items-center gap-1 bg-[#0a0b0d] rounded-lg p-1">
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
          </div> */}

          {/* Draw/Analysis Button - Only show when Candles is selected */}
          {
            !editorState && (
              <button
                onClick={() => setEditorState(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-all text-sm font-medium"
              >
                <FiEdit3 className="w-4 h-4" />
                <span>Analysis</span>
              </button>
            )
          }

        </div>
      </div>

      <div className='px-2 py-3 mb-2 flex flex-wrap'>
        <p className='w-full mb-2 font-semibold'>Tools</p>
        {
          TOOLS.map(tool => (
            <button onClick={() => setSelectedTool(tool.toolNum)} className={`block p-2 ${tool.toolNum === selectedTool ? "bg-blue-600" : "bg-[#0a0b0d]"} rounded`} title={tool.name}>
              <tool.icon className='w-4 h-4' />
            </button>
          ))
        }
        <button onClick={() => handleDownloadChartImage(editorState, chartContainerRef)} title='Download Chart as Image' className={`block p-2 bg-[#0a0b0d] justify-self-end rounded active:bg-[#0a0b0d]/50 duration-100 transition-all`}>
          <Download className='w-4 h-4' />
        </button>
      </div>

      {/* Chart Container */}
      <div className='relative h-[500px]'>
        {
          isLoadingChartData ? (
            <div className='w-full h-full flex items-center justify-center absolute z-[1000] top-0 left-0'>
              <span className='loading loading-spinner'></span>
            </div>
          ) : (
            <div onContextMenu={() => { toolRef.current.stopDrawing(); setSelectedTool(9) }} ref={chartContainerRef} className={`rounded-lg overflow-hidden cursor-grab`} />
          )
        }
      </div>
    </div>
  );
};

export default ChartSection;