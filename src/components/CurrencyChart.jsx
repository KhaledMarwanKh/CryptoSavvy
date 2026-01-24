import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, AreaSeries, CrosshairMode } from 'lightweight-charts';

export const CurrencyChart = ({
  data,
  colors: {
    backgroundColor = 'transparent',
    lineColor = '#2962FF',
    textColor = 'black',
    areaTopColor = '#2962FF',
    areaBottomColor = 'rgba(41, 98, 255, 0.28)',
  } = {}
}) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const seriesRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      crosshair: {
        mode: CrosshairMode.Normal
      },
      grid: {
        vertLines: { color: 'rgba(197, 203, 206, 0.1)' },
        horzLines: { color: 'rgba(197, 203, 206, 0.1)' },
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.2)',
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.2)',
        timeVisible: true,
      },
      localization: {
        // Fix locale issues by using simple date formatting
        timeFormatter: (timestamp) => {
          const date = new Date(timestamp * 1000);
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: timestamp > 1000000000000 ? 'numeric' : undefined,
            minute: timestamp > 1000000000000 ? '2-digit' : undefined
          });
        }
      }
    });

    const newSeries = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
      lineWidth: 2,
    });

    chartRef.current = chart;
    seriesRef.current = newSeries;

    if (data && data.length > 0) {
      newSeries.setData(data);
      chart.timeScale().fitContent();
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]);

  // Update data separately to avoid re-creating chart
  useEffect(() => {
    if (seriesRef.current && data && data.length > 0) {
      seriesRef.current.setData(data);
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }, [data]);

  return <div ref={chartContainerRef} className="w-full h-[400px]" />;
};
