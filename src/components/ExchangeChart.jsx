import React, { useEffect, useRef } from 'react';
import { AreaSeries, createChart, CrosshairMode } from 'lightweight-charts';

const ExchangeChart = ({ data, isPositive }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      localization: {
        locale: 'en-US',
      },
      layout: {
        background: {
          color: "transparent"
        },
        textColor: '#9ca3af',
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: {
          color: 'rgba(55, 65, 81, 0.3)',
          style: 1,
        },
        horzLines: {
          color: 'rgba(55, 65, 81, 0.3)',
          style: 1,
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: 'rgba(55, 65, 81, 0.5)',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: 'rgba(55, 65, 81, 0.5)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // Create area series
    const areaSeries = chart.addSeries(AreaSeries, {
      topColor: 'rgba(6, 182, 212, 0.4)',
      bottomColor: 'rgba(6, 182, 212, 0.0)',
      lineColor: '#06b6d4',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 6,
      crosshairMarkerBackgroundColor: '#1a1a24',
    });

    seriesRef.current = areaSeries;

    // Set data
    if (data && data.length > 0) {
      areaSeries.setData(data);
      chart.timeScale().fitContent();
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, isPositive]);

  // Update data when it changes
  useEffect(() => {
    if (seriesRef.current && data && data.length > 0) {
      seriesRef.current.setData(data);

      // Update colors based on trend
      seriesRef.current.applyOptions({
        topColor: 'rgba(6, 182, 212, 0.4)',
        bottomColor: 'rgba(6, 182, 212, 0.0)',
        lineColor: '#06b6d4',
        lineWidth: 2,
      });

      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }, [data, isPositive]);

  return (
    <div className="relative w-full h-full">
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
};

export default ExchangeChart;
