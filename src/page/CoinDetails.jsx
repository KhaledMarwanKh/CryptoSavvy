import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import {
  createChart,
  AreaSeries,
  CandlestickSeries,
  CrosshairMode
} from "lightweight-charts";
import { toast } from "react-toastify"
import { useNavigate, useParams } from "react-router";
import chartHandler from "../libs/ChartDataHandler";
import socket from "../libs/socket";
import analyzeCoinBinance from "../services/indecators";
import MarketCard from "../components/CoinDetails/AnalyzeSection";
import { INTERVALS } from "../data/constants";
import { useTranslation } from "react-i18next"

const mockCoin = {
  logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=029",
  index: 1,
  symbol: "BTC",
  baseSymbol: "USDT",
  change24h: 2.41,
  high24h: 68450,
  low24h: 66220,
  marketCap: 1345000000000,
  volume: 38500000000,
  price: 67520,
};

function CoinDetails() {
  const { i18n, t } = useTranslation();
  const { coinId } = useParams();
  const navigate = useNavigate();

  const chartRef = useRef(null);
  const chartApiRef = useRef(null);
  const areaSeriesRef = useRef(null);
  const candleSeriesRef = useRef(null);

  const [coin,
    setCoin] = useState(mockCoin);
  const [mode,
    setMode] = useState("area"); // area | candle
  const [interval,
    setIntervalTf] = useState("1m");
  const [candles,
    setCandles] = useState([]);
  const [orderBook,
    setOrderBook] = useState([
      {
        asks: [{}],
        bids: [{}]
      }
    ]);
  const [isLoading, setIsLoading] = useState(false);
  const [indecatorsData, setIndecatorsData] = useState({
    meta: {

    },
    classification: {

    },
    market: {},
    indicators: {}
  })
  const [isAddedToWatchlist, setIsAddedToWatchlist] = useState(false);

  const update = useCallback(async (flag) => {
    setIsAddedToWatchlist(flag);
  }, [])

  const updateSeries = (data,
    currentMode) => {
    if (!areaSeriesRef.current || !candleSeriesRef.current) return;

    const areaData = data.map((c) => ({
      time: c.time,
      value: c.close,
    }));

    if (currentMode === "area") {
      areaSeriesRef.current.setData(areaData);
      candleSeriesRef.current.setData([]);
    } else {
      candleSeriesRef.current.setData(data);
      areaSeriesRef.current.setData([]);
    }

  };

  const updateChart = (coin) => {
    if (chartHandler.isChartDataArrived && (areaSeriesRef.current || candleSeriesRef.current)) {
      const price = coin?.price;

      const time = new Date(coin?.lastUpdate).getMilliseconds();

      const lastCandle = candles.at(candles.length - 1);

      const lastCandleTime = lastCandle.time;

      if (lastCandleTime < time) {
        setCandles((prev) => [...prev, {
          time,
          open: price,
          high: price,
          low: price,
          close: price
        }]);
      }

      if (mode === "area") {
        areaSeriesRef.current.update(
          {
            close: price,
            time: lastCandle.time
          }
        )
      } else {
        candleSeriesRef.current.update(
          {
            ...lastCandle,
            high: Math.max(lastCandle.high, price),
            low: Math.min(lastCandle.low, price),
            close: price,
          }
        )
      }
    }
  }

  const onData = (data) => {
    if (!data) {
      return;
    }

    const { meta, orderBook } = data[coinId];

    setCoin(meta);
    setOrderBook(orderBook);

    setIsLoading(false);
  }

  const onConnect = () => {
    console.log("connected")
  }

  const onDisconnect = () => {
    console.log("disconnected")
  }

  const onAddToWatchlist = () => {
    let watchlist = localStorage.watchlist;

    if (watchlist) {
      watchlist = JSON.parse(watchlist);
    } else {
      watchlist = {
        list: []
      };
    }

    watchlist.list.push({
      symbol: coinId,
      baseSymbol: coin.baseSymbol
    });

    localStorage.setItem("watchlist", JSON.stringify(watchlist));

    toast.success(`Coin ${coinId} added to watchlist`);

    setIsAddedToWatchlist(true);
  }

  const removeFromWatchlist = () => {
    const { watchlist } = localStorage;

    if (watchlist) {
      let list = JSON.parse(watchlist)?.list;

      list = list?.filter(coin => coin.symbol !== coinId);

      localStorage.setItem("watchlist", JSON.stringify(
        {
          list
        }
      ))
    }

    setIsAddedToWatchlist(false);
  }

  useEffect(() => {

    const { watchlist } = localStorage;

    if (watchlist) {
      const list = JSON.parse(watchlist).list ?? [];

      update(Boolean(list?.filter(coin => coin.symbol === coinId)));

      return;
    }

    update(false);

  }, [coinId, update])

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      layout: {
        background: {
          color: "transparent"
        },
        textColor: "#cbd5f5",
      },
      crosshair: {
        mode: CrosshairMode.Normal
      },
      grid: {
        vertLines: {
          color: "rgba(148,163,184,0.05)"
        },
        horzLines: {
          color: "rgba(148,163,184,0.05)"
        },
      },
      rightPriceScale: {
        borderColor: "rgba(148,163,184,0.1)"
      },
      timeScale: {
        borderColor: "rgba(148,163,184,0.1)"
      },
      height: 360,
    });

    const area = chart.addSeries(AreaSeries, {
      topColor: "rgba(37,99,235,0.4)",
      bottomColor: "rgba(37,99,235,0.05)",
      lineColor: "rgba(37,99,235,1)",
      lineWidth: 2,
    });

    const candle = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderDownColor: "#ef4444",
      borderUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      wickUpColor: "#22c55e",
    });

    chartApiRef.current = chart;
    areaSeriesRef.current = area;
    candleSeriesRef.current = candle;

    updateSeries(candles, mode);

    const resize = () => {
      chart.applyOptions({
        width: chartRef.current.clientWidth
      });
    };
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      chart.remove();
    };
  }, [mode, candles]);

  useEffect(() => {
    chartHandler.setInterval(interval);
    chartHandler.setSymbol(coinId);
    chartHandler.getChartData().then((res) => {
      console.log(res.candles);
      setCandles(res.candles);
    });
    analyzeCoinBinance({
      symbol: coinId,
      limit: 1000,
      interval: interval,
      quoteDepth: 50
    }).then((res) => {
      setIndecatorsData(res);
    })
  }, [interval, coinId, mode]);

  useEffect(() => {
    socket.on("cryptoData", onData);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("connect", onConnect);
      socket.off("cryptoData", onData);
      socket.off("disconnect", onDisconnect);
    }
  }, []);

  useEffect(() => {
    updateChart(coin);
  }, [coin])

  if (isLoading) {
    return (
      <div className="h-screen text-slate-200 flex items-center justify-center flex-col gap-2 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <span className="loading loading-spinner"></span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* ================= Header ================= */}
        <div className="bg-slate-900/70 border border-slate-700/50 backdrop-blur-xl shadow-md rounded-xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-center gap-4">
            <img
              src={coin?.logo}
              alt=""
              className="w-12 h-12 rounded-full"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">
                  {coin?.symbol}/{coin?.baseSymbol}
                </span>
                <span className="text-slate-400 text-sm">
                  #{coin?.index}
                </span>
              </div>
              <div className="text-slate-400 text-sm">
                {t("coinDetails.labels.price")}
              </div>
              <div className="text-2xl font-bold">
                ${coin?.price?.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <Stat label={t("coinDetails.labels.change")} value={`${coin?.changePercent}%`} positive={coin.change24h >= 0} />
            <Stat label={t("coinDetails.labels.high")} value={`$${coin?.high24h?.toLocaleString()}`} />
            <Stat label={t("coinDetails.labels.low")} value={`$${coin?.low24h?.toLocaleString()}`} />
            <Stat label={t("coinDetails.labels.volume")} value={`$${(coin?.volume / 1e9)?.toFixed(2)}B`} />
            <Stat label={t("coinDetails.labels.market")} value={`$${(coin?.marketCap / 1e9)?.toFixed(2)}B`} />
          </div>

          <div className="flex gap-2">
            <button onClick={() => {
              window.location.href = `https://www.binance.com/en/trade/${coinId}?_from=markets&type=spot`
            }} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm">
              {t("coinDetails.trade")}
            </button>
            <button onClick={isAddedToWatchlist ? onAddToWatchlist : removeFromWatchlist} className="px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800">
              {
                isAddedToWatchlist ? t("coinDetails.watch") : "-" + t("coinDetails.watch").slice(1)
              }
            </button>
          </div>
        </div>

        {/* ================= Chart ================= */}
        <div className="bg-slate-900/70 border border-slate-700/50 backdrop-blur-xl shadow-md rounded-xl p-4 space-y-4">

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <ToggleButton
                active={mode === "area"}
                onClick={() => setMode("area")}
              >
                Area
              </ToggleButton>
              <ToggleButton
                active={mode === "candle"}
                onClick={() => setMode("candle")}
              >
                Candles
              </ToggleButton>
            </div>

            <div className={`flex flex-wrap gap-2 ${i18n.language === "ar" ? "flex-row-reverse" : ""}`}>
              {INTERVALS.map((tf) => (
                <ToggleButton
                  key={tf}
                  active={interval === tf}
                  onClick={() => setIntervalTf(tf)}
                >
                  {tf}
                </ToggleButton>
              ))}
            </div>

            <button
              onClick={() => navigate(`/ coin / analyze - chart / ${coinId}`)}
              className="px-3 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t("coinDetails.analyze")}
            </button>
          </div>

          <div ref={chartRef} className="w-full h-[360px]" />
        </div>

        {/* ================= Order Book + Indicators ================= */}
        <div className="grid grid-cols-1 gap-4">

          {/* -------- Order Book -------- */}
          <div className="lg:col-span-2 bg-slate-900/70 border border-slate-700/50 backdrop-blur-xl shadow-md rounded-xl p-4">
            <h3 className="text-sm text-slate-300 mb-3">
              {t("coinDetails.book.title")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

              {/* -------- Asks -------- */}
              <div>
                <div className="text-xs text-red-400 mb-2">
                  {t("coinDetails.asks")}
                </div>

                <table className="w-full">
                  <thead className="text-slate-400 border-b border-slate-700/50">
                    <tr>
                      <th className="py-1">{t("coinDetails.book.price")}</th>
                      <th className="py-1">{t("coinDetails.book.amount")}</th>
                      <th className="py-1">{t("coinDetails.book.total")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderBook?.asks
                      ?.slice()
                      ?.reverse()
                      ?.map((row, i) => (
                        <tr key={i} className="border-b border-slate-800 last:border-0">
                          <td className="py-1 text-red-400">
                            {row?.price.toLocaleString()}
                          </td>
                          <td className="py-1 text-right text-slate-300">
                            {row?.quantity}
                          </td>
                          <td className="py-1 text-right text-slate-300">
                            {(row.price * row.quantity)?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* -------- Bids -------- */}
              <div>
                <div className="text-xs text-emerald-400 mb-2">
                  {t("coinDetails.bids")}
                </div>

                <table className="w-full">
                  <thead className="text-slate-400 border-b border-slate-700/50">
                    <tr>
                      <th className="py-1">{t("coinDetails.book.price")}</th>
                      <th className="py-1">{t("coinDetails.book.amount")}</th>
                      <th className="py-1">{t("coinDetails.book.total")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderBook?.bids?.map((row, i) => (
                      <tr key={i} className="border-b border-slate-800 last:border-0">
                        <td className="py-1 text-emerald-400">
                          {row?.price.toLocaleString()}
                        </td>
                        <td className="py-1 text-right text-slate-300">
                          {row?.quantity}
                        </td>
                        <td className="py-1 text-right text-slate-300">
                          {(row.price * row.quantity)?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>

          <MarketCard data={indecatorsData} />
        </div>
      </div>
    </div>
  );
}

/* -------------------- Small Components -------------------- */

function Stat({
  label, value, positive
}) {
  return (
    <div>
      <div className="text-slate-400 text-xs">
        {label}
      </div>
      <div
        className={`text-sm font-semibold ${positive === undefined
          ? "text-slate-200" : positive
            ? "text-emerald-400" : "text-red-400"
          }`}
      >
        {value}
      </div>
    </div>
  );
}

function ToggleButton({
  active, children, onClick
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm border transition ${active
        ? "bg-blue-600 border-blue-600 text-white" : "border-slate-700 text-slate-300 hover:bg-slate-800"
        }`}
    >
      {children}
    </button>
  );
}
export default CoinDetails;