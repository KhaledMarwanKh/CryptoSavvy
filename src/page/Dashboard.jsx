import React, {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";
import {
    Newspaper,
    Search,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    BarChart3,
    DollarSign,
    Coins,
    X,
    ExternalLink,
    Clock,
    Filter,
} from "lucide-react";
import { useNavigate } from "react-router"
import CurrencyConverter from "../components/CurrencyConventor";
import Card from "../components/Dashboard/Card";
import socket from "../libs/socket";
import { formatLargeNumbers } from "../utils/formattor";
import newsHandler from "../libs/NewsHandler";

function Dashboard() {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [artNum, setArtNum] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [page, setPage] = useState(1);
    const [cryptoList, setCryptoList] = useState([]);
    const [pageSize, setPageSize] = useState(4);
    const [news, setNews] = useState({
        "title": "Novo imposto sobre renda na Bolsa atrai investidor para ETFs de dividendos; veja o que gestoras e analistas projetam para 2026",
        "description": "Com proventos de ações taxados, ETFs de dividendos ganham espaço no radar dos investidores. Gestores e analistas explicam se 2026 será o ano dos ETFs de renda e quais produtos podem se destacar.",
        "url": "https://einvestidor.estadao.com.br/investimentos/etfs-de-dividendos-2026-tributacao-renda-projecoes/",
        "publishedAt": "2025-12-03T08:30:41Z",
        "source": "Estadão E-Investidor",
        "image": "https://einvestidor.estadao.com.br/wp-content/themes/e-investidor/assets/img/card-share-large-1200x631.jpg"
    });
    const [filters, setFilters] = useState({
        minVolume: 0,
        minMarketCap: 0,
        minPrice: 0,
        sortBy: "index",
        sortOrder: "asc"
    });

    const filteredData = useMemo(() => {
        const filtered = cryptoList.filter(
            (coin) =>
                coin.symbol.toLowerCase().includes(search.toLowerCase()) ||
                coin.baseSymbol.toLowerCase().includes(search.toLowerCase())
        ).filter(coin => coin.price >= filters.minPrice && coin.marketCap >= filters.minMarketCap && coin.volume >= filters.minVolume).sort((a, b) => filters.sortOrder === "asc" ? a[filters.sortBy] - b[filters.sortBy] : b[filters.sortBy] - a[filters.sortBy]).slice(
            (page - 1) * pageSize,
            page * pageSize
        );

        return filtered;
    }, [cryptoList, search, filters, page, pageSize]);

    // --- Calculations for Stat Cards ---
    const totalCoins = useMemo(() => {
        return cryptoList.length;
    }, [cryptoList]);

    const totalMarketCap = useMemo(() => {
        if (cryptoList) {
            return cryptoList?.reduce((sum, crypto) => sum + crypto?.marketCap, 0)
        }

        return 0;
    }, [cryptoList]);

    const totalVolume = useMemo(() => {
        if (cryptoList) {
            return cryptoList?.reduce((sum, crypto) => sum + crypto?.volume, 0)
        }

        return 0;
    }, [cryptoList]);

    const checkInput = (e) => {
        const regex = new RegExp(/[a-zA-Z]+/g);
        if (regex.test(e.target.value)) {
            e.target.value = 0;
        }
    }

    const applyFilters = (form) => {
        form.preventDefault();

        setIsLoading(true);
        setShowFilter(false);

        const minVolume = parseFloat(form.target.minVolume);
        const minMarketCap = parseFloat(form.target.minMarketCap);
        const minPrice = parseFloat(form.target.price);
        const sortBy = form.target.sortBy;
        const sortOrder = form.target.sortOrder;

        setFilters({
            minMarketCap,
            minPrice,
            minVolume,
            sortBy,
            sortOrder
        });

        setIsLoading(false);
    }

    const onConnect = useCallback(() => {
        console.log("Connected");
    }, []);

    const onDisconnect = useCallback(() => {
        console.log("Disconnected");
    }, [])

    const onData = useCallback((data) => {
        console.log("Data for dashboard");

        if (!data) {
            console.table(data);
            return;
        }

        const newData = Object.values(data).map(value => value.meta);

        const newDataLength = newData.length;

        if (newDataLength === 8) {
            socket.setSocketData(newData);
            setCryptoList(newData);
            setIsLoading(false);
            return;
        }

        setCryptoList([]);
    }, [pageSize])

    useEffect(() => {
        socket.connect();

        socket.setMode("all");

        socket.on("cryptoData", onData);

        socket.on("connect", onConnect);

        socket.on("disconnect", onDisconnect);

        return () => {
            socket.off("cryptoData", onData);

            socket.off("connect", onConnect);

            socket.off("disconnect", onDisconnect);
        }

    }, [pageSize, onConnect, onDisconnect, onData]);

    useEffect(() => {
        const params = {
            apikey: import.meta.env.VITE_GNEWS_API,
            lang: "en",
            q: "bitcoin OR ethereum OR crypto OR blockchain",
            max: 20,
        }

        newsHandler.getNews(params).then((res) => {
            setNews(res?.articles);
        });

        const delay = 1000 * 60 * 1;

        const interval = setInterval(() => {
            setArtNum(prev => (prev + 1) % 20);
        }, delay)

        return () => clearInterval(interval);
    }, [])

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">

            {/* ================= SIDEBAR ================= */}
            <aside className="hidden lg:flex flex-col w-72 p-3 border-r border-slate-700/50 bg-slate-900/70 backdrop-blur-xl overflow-y-scroll">

                {/* News Section */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4 text-slate-300">
                        <Newspaper size={18} />
                        <span>Latest News</span>
                    </div>
                    <article
                        key={news[artNum]?.title}
                        className="group flex flex-col bg-slate-900/70 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-xl shadow-md hover:shadow-2xl hover:shadow-blue-900/10 hover:border-slate-600 transition-all duration-300"
                    >
                        <div className="relative h-52 overflow-hidden">
                            <img
                                src={news[artNum]?.image}
                                alt={news[artNum]?.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-md text-white text-xs font-semibold rounded-full shadow-lg">
                                    {news[artNum]?.source.name}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 flex flex-col flex-1">
                            <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(news[artNum]?.publishedAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </div>

                            <h3 className="text-sm font-bold text-slate-100 mb-3 group-hover:text-blue-400 transition-colors">
                                {news[artNum]?.title}
                            </h3>

                            <p className="text-slate-400 text-xs leading-relaxed mb-6 flex-1 line-clamp-3">
                                {news[artNum]?.description}
                            </p>

                            <a
                                href={news[artNum]?.url}
                                className="inline-flex items-center gap-2 text-blue-500 font-semibold text-sm hover:text-blue-400 transition-colors group/link"
                            >
                                Read Full Story
                                <ExternalLink className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                            </a>
                        </div>
                    </article>
                </div>

                {/* Converter */}
                <div>
                    <CurrencyConverter cryptoList={cryptoList} />
                </div>
            </aside>

            {/* ================= MAIN CONTENT ================= */}
            <main className="flex-1 p-6">

                {/* ===== HEADER CARDS ===== */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card
                        title="Total Market Cap"
                        value={formatLargeNumbers(totalMarketCap)?.toLocaleString()}
                        icon={<DollarSign />}
                    />
                    <Card
                        title="Total Volume"
                        value={formatLargeNumbers(totalVolume)?.toLocaleString()}
                        icon={<BarChart3 />}
                    />
                    <Card
                        title="Total Coins"
                        value={totalCoins.toLocaleString()}
                        icon={<Coins />}
                    />
                </div>

                {/* ===== SEARCH & FILTER ===== */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="relative w-full md:w-96">
                        <Search
                            size={18}
                            className="absolute left-3 top-2.5 text-slate-400"
                        />
                        <input
                            type="text"
                            placeholder="Search coin..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded bg-slate-950/60 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        onClick={() => setShowFilter(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                    >
                        <Filter className="w-5 h-5" />
                        Filter
                    </button>
                </div>

                {/* ===== TABLE (DESKTOP) ===== */}
                <div className="hidden md:block overflow-x-auto bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded">
                    <table className="w-full text-sm">
                        <thead className="border-b border-slate-700/50 text-slate-400">
                            <tr>
                                <th className="p-3 text-left">#</th>
                                <th className="p-3 text-left">Coin</th>
                                <th className="p-3 text-left">Price</th>
                                <th className="p-3 text-left">Market Cap</th>
                                <th className="p-3 text-left">Volume</th>
                                <th className="p-3 text-left">24h %</th>
                                <th className="p-3 text-left">High</th>
                                <th className="p-3 text-left">Low</th>
                                <th className="p-3 text-left">Supply</th>
                            </tr>
                        </thead>
                        {
                            !isLoading && (
                                <tbody>
                                    {filteredData.map((coin, index) => (
                                        <tr
                                            onClick={() => navigate(`/coin/info/${coin.symbol}`)}
                                            key={coin.id}
                                            className="border-b border-slate-800 hover:bg-slate-800/40 cursor-pointer"
                                        >
                                            <td className="p-3">{index + 1}</td>
                                            <td className="p-3 flex items-center gap-3">
                                                <img
                                                    src={coin.logo}
                                                    alt="logo"
                                                    className="w-6 h-6"
                                                />
                                                <div>
                                                    <div>
                                                        {coin.symbol}
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {coin.baseSymbol}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3">${coin.price.toLocaleString()}</td>
                                            <td className="p-3">${formatLargeNumbers(coin.marketCap)?.toLocaleString() ?? 0}</td>
                                            <td className="p-3">${formatLargeNumbers(coin.volume)?.toLocaleString() ?? 0}</td>
                                            <td
                                                className={`p-3 flex items-center gap-1 ${coin.changePercent > 0
                                                    ? "text-emerald-400" : "text-red-400"
                                                    }`}
                                            >
                                                {coin.change24h > 0 ? (
                                                    <TrendingUp size={16} />
                                                ) : (
                                                    <TrendingDown size={16} />
                                                )}
                                                {coin?.changePercent}%
                                            </td>
                                            <td className="p-3">${coin.high24h}</td>
                                            <td className="p-3">${coin.low24h}</td>
                                            <td className="p-3">
                                                {formatLargeNumbers(coin.circulatingSupply)?.toLocaleString() ?? 0}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            )
                        }
                    </table>
                    {
                        isLoading && (
                            <div className="w-full h-[300px] flex items-center justify-center">
                                <span className="loading loading-spinner"></span>
                            </div>
                        )
                    }
                </div>

                {/* ===== MOBILE CARDS ===== */}
                <div className="grid md:hidden gap-4">
                    {!isLoading && (filteredData.map((coin) => (
                        <div
                            onClick={() => navigate(`/coin/info/${coin.symbol}`)}
                            key={coin.symbol}
                            className="bg-slate-900/70 border border-slate-700/50 rounded p-4 hover:border-blue-500 hover:scale-105 hover:bg-slate-900 duration-200 transition-all cursor-pointer"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-3">
                                    <img src={coin.logo} className="w-6 h-6" />
                                    <div>
                                        <div>
                                            {coin.symbol}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {coin.baseSymbol}
                                        </div>
                                    </div>
                                </div>
                                <span
                                    className={
                                        coin.changePercent > 0
                                            ? "text-emerald-400" : "text-red-400"
                                    }
                                >
                                    {coin.changePercent}%
                                </span>
                            </div>
                            <div className="text-sm text-slate-400 space-y-1">
                                <div className="font-bold text-slate-100">
                                    Price: ${coin.price.toLocaleString()}
                                </div>
                                <div>
                                    Market Cap: ${coin.marketCap.toLocaleString()}
                                </div>
                                <div>
                                    Volume: ${coin.volume.toLocaleString()}
                                </div>
                                <div>
                                    High: ${coin.high24h}
                                </div>
                                <div>
                                    Low: ${coin.low24h}
                                </div>
                            </div>
                        </div>
                    )))}

                    {
                        isLoading && (
                            <div className="w-full h-[100px] flex items-center justify-center">
                                <span className="loading loading-spinner"></span>
                            </div>
                        )
                    }
                </div>

                {/* ===== PAGINATION ===== */}
                <div className="flex justify-end items-center gap-4 mt-6">
                    <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        className="p-2 bg-slate-800 rounded hover:bg-slate-700"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={() =>
                            setPage((p) =>
                                p * pageSize < cryptoList?.length ? p + 1 : p
                            )
                        }
                        className="p-2 bg-slate-800 rounded hover:bg-slate-700"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </main>

            {/* ===== FILTER MODAL ===== */}
            {showFilter && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-slate-900 border border-slate-700 rounded p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold">Advanced Filters</h3>
                            <X
                                className="cursor-pointer"
                                onClick={() => setShowFilter(false)}
                            />
                        </div>

                        <form onSubmit={applyFilters} className="space-y-4">
                            <input
                                onChange={checkInput}
                                name="minMarketCap"
                                type="number"
                                defaultValue={0}
                                placeholder="Min Market Cap"
                                className="w-full px-3 py-2 rounded bg-slate-950/60 border border-slate-700"
                            />
                            <input
                                onChange={checkInput}
                                name="minVolume"
                                type="number"
                                defaultValue={0}
                                placeholder="Min Volume"
                                className="w-full px-3 py-2 rounded bg-slate-950/60 border border-slate-700"
                            />
                            <input
                                onChange={checkInput}
                                name="minPrice"
                                type="number"
                                defaultValue={0}
                                placeholder="Min Price"
                                className="w-full px-3 py-2 rounded bg-slate-950/60 border border-slate-700"
                            />
                            <select
                                name="sortBy"
                                className="w-full px-3 py-2 rounded bg-slate-950/60 border border-slate-700"
                            >
                                <option value="index">Rank</option>
                                <option value="marketCap">Market Cap</option>
                                <option value="volume">Volume</option>
                                <option value="change24h">24h Change</option>
                                <option value="price">Price</option>
                                <option value="low24h">Low</option>
                                <option value="high24h">High</option>
                                <option value="circulatingSupply">Supply</option>
                            </select>
                            <select
                                name="sortOrder"
                                className="w-full px-3 py-2 rounded bg-slate-950/60 border border-slate-700"
                            >
                                <option value="desc">Descending</option>
                                <option value="asc">Ascending</option>
                            </select>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded"
                            >
                                Apply Filters
                            </button>
                        </form>
                    </div>
                </div>
            )
            }
        </div >
    );
}

export default Dashboard;