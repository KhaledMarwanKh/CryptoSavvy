import React, { useState, useEffect, useRef } from 'react';
import { AreaSeries, CandlestickSeries, createChart, CrosshairMode } from 'lightweight-charts';
import { FiEdit3 } from 'react-icons/fi';
import { generateAreaData, generateChartData, updateChart } from '../data/cryptoData';
import {
  FibChannelDrawingTool,
  FibSpiralDrawingTool,
  FibWedgeDrawingTool,
  RectangleDrawingTool,
  TimeLineDrawingTool,
  TriangleDrawingTool,
  TrendLineDrawingTool,
  CurveDrawingTool,
  PolylineDrawingTool,
} from 'interactive-lw-charts-tools'
import { Activity, Download, EraserIcon, Fan, Layers, RotateCcw, Route, Square, TrendingUp, Triangle } from 'lucide-react';
import { FaRegHand, FaTimeline } from 'react-icons/fa6';
import toast from 'react-hot-toast';

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
  const [areaChartData, setAreaChartData] = useState([]);

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const toolRef = useRef(null);

  const [selectedPeriod, setSelectedPeriod] = useState('1m');
  const [chartType, setChartType] = useState('Candles');
  const [selectedTool, setSelectedTool] = useState(9);

  const periods = ['1m', '5m', '24h', '7d', '1M'];
  const chartTypes = ['Candles', 'Area'];

  const makeTool = (toolNum, chart, series) => {

    if (editorState) {
      setCursorMode('hand');
    }

    if (toolNum === 10 && toolRef.current) {
      toolRef.current.remove();
      setSelectedTool(9);
      return toolRef.current;
    }

    let tool = toolRef.current;

    switch (toolNum) {
      case 0:
        tool = new TrendLineDrawingTool(chart, series);
        break;
      case 1:
        tool = new TimeLineDrawingTool(chart, series);
        break;
      case 2:
        tool = new TriangleDrawingTool(chart, series);
        break;
      case 3:
        tool = new RectangleDrawingTool(chart, series, {
          fillColor: 'blue'
        });
        break;
      case 4:
        tool = new FibChannelDrawingTool(chart, series);
        break;
      case 5:
        tool = new FibSpiralDrawingTool(chart, series);
        break
      case 6:
        tool = new FibWedgeDrawingTool(chart, series);
        break;
      case 7:
        tool = new CurveDrawingTool(chart, series);
        break;
      case 8:
        tool = new PolylineDrawingTool(chart, series);
        break;
    }

    return tool;
  }

  const handleToolChange = (toolNum) => {
    const tool = makeTool(toolNum, chartRef.current, seriesRef.current);

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

  const handleDownloadChartImage = async () => {
    if (chartContainerRef.current) {

      try {

        const elements = chartContainerRef.current.querySelectorAll("*");

        let canvas;

        if (editorState) {
          const canvas1 = document.getElementById('canvas');
          const canvas2 = elements[6];

          const width = Math.max(canvas1.width, canvas2.width);
          const height = Math.max(canvas1.height, canvas2.height);

          // Create a new canvas
          const mergedCanvas = document.createElement('canvas');
          mergedCanvas.width = width;
          mergedCanvas.height = height;
          const ctx = mergedCanvas.getContext('2d');

          // Draw the first canvas
          ctx.drawImage(canvas2, 0, 0);

          // Draw the second canvas on top
          ctx.drawImage(canvas1, 0, 0);

          canvas = mergedCanvas;
        } else {
          canvas = elements[6];
        }

        const dataUrl = canvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.href = dataUrl;
        link.setAttributeNode(document.createAttribute('download'))
        link.click();

        toast.success("Download will starting soon");

      } catch (error) {
        toast.error("Something got wrong!\n Try Again", {
          className: 'font-bold'
        })

        console.log(error)
      }

    }
  }

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
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

    let series = null;

    // Add series based on chart type
    if (chartType === 'Candles') {
      series = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });
      series.setData(candleData);
      seriesRef.current = series;
    } else if (chartType === 'Area') {
      series = chart.addSeries(AreaSeries, {
        topColor: 'rgba(6, 182, 212, 0.4)',
        bottomColor: 'rgba(6, 182, 212, 0.0)',
        lineColor: '#06b6d4',
        lineWidth: 2,
      });

      series.setData(areaChartData);
      seriesRef.current = series;
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
    const candle = generateChartData(88000, 400);
    const area = generateAreaData(candle);

    setCandleData(candle);
    setAreaChartData(area);

    const interval = setInterval(() => {
      let lastClosePrice, time = Date.now();

      if (candleData.length > 0) {
        lastClosePrice = candleData[candleData.length - 1]?.close;
      } else {
        lastClosePrice = candle[candle.length - 1]?.close;
      }

      console.log(lastClosePrice)

      const newData = updateChart(lastClosePrice, time);

      if (seriesRef.current) {
        if (chartType === 'Candles') {
          seriesRef.current?.update({ ...newData });
        }

      }

    }, 1000)

    return () => {
      clearInterval(interval);
    }
  }, [crypto])

  useEffect(() => {
    handleToolChange(selectedTool);
  }, [selectedTool])

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
        <button onClick={handleDownloadChartImage} title='Download Chart as Image' className={`block p-2 bg-[#0a0b0d] justify-self-end rounded active:bg-[#0a0b0d]/50 duration-100 transition-all`}>
          <Download className='w-4 h-4' />
        </button>
      </div>

      {/* Chart Container */}
      <div onContextMenu={() => { toolRef.current.stopDrawing(); setSelectedTool(9) }} ref={chartContainerRef} className="rounded-lg overflow-hidden cursor-grab" />
    </div>
  );
};

export default ChartSection;