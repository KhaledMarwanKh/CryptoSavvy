import { useEffect, useId, useMemo, useState } from 'react'
import {
    Area,
    AreaChart,
    CartesianGrid,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Cell,
} from 'recharts'
import {
    Bell,
    BriefcaseBusiness,
    LayoutDashboard,
    LineChart,
    Menu,
    MessageSquareMore,
    Repeat,
    Rocket,
    Search,
    Settings,
    TrendingDown,
    TrendingUp,
    X,
    Zap,
} from 'lucide-react'

import {
    getGlobalData,
    getGlobalMarketChart,
    getMarkets,
    searchAssets,
} from '../services/cryptoApi'
import {
    formatCompactCurrency,
    formatDateLabel,
    formatNumber,
    formatPercent,
    formatPrice,
    stripHtml,
    truncate,
} from '../utils/formattor'

const RANGE_LABELS = {
    '1M': '30 Days',
    '3M': '90 Days',
    '1Y': '1 Year',
}

const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, active: true },
    { label: 'Portfolio', icon: BriefcaseBusiness },
    { label: 'Market', icon: LineChart },
    { label: 'Exchange', icon: Repeat },
    { label: 'Settings', icon: Settings },
]

function cn(...classes) {
    return classes.filter(Boolean).join(' ')
}

function dayKey(timestamp) {
    const date = new Date(timestamp)
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function downsample(items, maxPoints = 90) {
    if (items.length <= maxPoints) return items
    const step = Math.ceil(items.length / maxPoints)
    return items.filter((_, index) => index % step === 0 || index === items.length - 1)
}

function normalizeChartData(rawChart, range) {
    const marketCapSeries =
        rawChart?.market_cap_chart?.market_cap ||
        rawChart?.market_cap_chart?.market_caps ||
        rawChart?.market_caps ||
        rawChart?.market_cap ||
        []

    const volumeSeries =
        rawChart?.market_cap_chart?.volume ||
        rawChart?.market_cap_chart?.total_volumes ||
        rawChart?.total_volumes ||
        rawChart?.volumes ||
        []

    if (!Array.isArray(marketCapSeries)) return []

    const volumeMap = new Map()

    if (Array.isArray(volumeSeries)) {
        volumeSeries.forEach(([timestamp, value]) => {
            volumeMap.set(dayKey(timestamp), value)
        })
    }

    const mapped = marketCapSeries.map(([timestamp, marketCap]) => ({
        timestamp,
        label: formatDateLabel(timestamp, range),
        marketCap,
        volume: volumeMap.get(dayKey(timestamp)) ?? 0,
    }))

    return downsample(mapped, range === 'ALL' ? 100 : 60)
}

function getCoinChange(coin) {
    return Number(
        coin?.price_change_percentage_24h_in_currency ??
        coin?.price_change_percentage_24h ??
        0
    )
}

function Panel({ className = '', children }) {
    return <div className={cn('glass-card', className)}>{children}</div>
}

function SkeletonLine({ className = '' }) {
    return <div className={cn('animate-pulse rounded-xl bg-slate-800/80', className)} />
}

function Sidebar({ open, onClose }) {
    return (
        <>
            <div
                className={cn(
                    'fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden',
                    open ? 'block' : 'hidden'
                )}
                onClick={onClose}
            />

            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-slate-950/95 px-5 py-6 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
                    open ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-md">
                            <Rocket className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-white">
                                CryptoAnalytics
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="icon-btn lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="space-y-3">
                    {navItems.map((item) => {
                        const Icon = item.icon

                        return (
                            <button
                                key={item.label}
                                className={cn(
                                    'flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left text-lg transition',
                                    item.active
                                        ? 'bg-blue-600/15 text-blue-500'
                                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                                )}
                            >
                                <Icon className="h-6 w-6" />
                                <span>{item.label}</span>
                            </button>
                        )
                    })}
                </nav>

                <div className="my-8 border-t border-slate-800" />

                <div className="mt-auto rounded-3xl bg-slate-900/80 p-5">
                    <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                        Pro Plan
                    </p>
                    <p className="mt-3 text-xl leading-9 text-white">
                        Unlock advanced market metrics and alerts.
                    </p>
                    <button className="mt-5 w-full rounded-2xl bg-blue-600 px-4 py-3 text-lg font-semibold text-white transition hover:bg-blue-700">
                        Upgrade Now
                    </button>
                </div>
            </aside>
        </>
    )
}

function SearchBar({
    query,
    setQuery,
    results,
    loading,
}) {
    return (
        <div className="relative w-full max-w-3xl">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-700/50 bg-slate-950/60 px-4 py-3 text-slate-300 backdrop-blur-xl focus-within:ring-2 focus-within:ring-blue-500">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search assets, news, or traders..."
                    className="w-full bg-transparent text-base text-white outline-none placeholder:text-slate-400"
                />
            </div>

            {query.trim().length >= 2 && (
                <div className="absolute left-0 right-0 z-40 mt-3 overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/95 shadow-md backdrop-blur-xl">
                    {loading ? (
                        <div className="p-4 text-sm text-slate-400">Searching assets...</div>
                    ) : results.length ? (
                        <div className="max-h-80 overflow-y-auto">
                            {results.map((coin) => (
                                <a
                                    key={coin.id}
                                    href={`https://www.coingecko.com/en/coins/${coin.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-3 border-b border-slate-800 px-4 py-3 transition last:border-b-0 hover:bg-slate-800/70"
                                >
                                    <img
                                        src={coin.thumb}
                                        alt={coin.name}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-white">{coin.name}</p>
                                        <p className="text-sm text-slate-400">
                                            {coin.symbol?.toUpperCase()} · Rank #{coin.market_cap_rank ?? '--'}
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-sm text-slate-400">No assets found.</div>
                    )}
                </div>
            )}
        </div>
    )
}

function Topbar({ onMenuClick, searchQuery, setSearchQuery, searchResults, searchLoading }) {
    return (
        <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 xl:px-10">
                <div className="flex items-center gap-3 lg:hidden">
                    <button onClick={onMenuClick} className="icon-btn" aria-label="Open sidebar">
                        <Menu className="h-5 w-5" />
                    </button>
                    <h2 className="text-xl font-semibold text-white">Dashboard</h2>
                </div>

                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <SearchBar
                        query={searchQuery}
                        setQuery={setSearchQuery}
                        results={searchResults}
                        loading={searchLoading}
                    />

                    <div className="flex items-center justify-end gap-3">
                        <button className="icon-btn" aria-label="Notifications">
                            <Bell className="h-5 w-5" />
                            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500" />
                        </button>

                        <button className="icon-btn" aria-label="Messages">
                            <MessageSquareMore className="h-5 w-5" />
                        </button>

                        <div className="hidden h-10 w-px bg-slate-700 lg:block" />

                        <div className="flex items-center gap-3 rounded-2xl border border-slate-700/50 bg-slate-900/70 px-3 py-2">
                            <div className="text-right">
                                <p className="font-semibold text-white">Alex Rivera</p>
                                <p className="text-sm text-slate-400">Analytics Pro</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-blue-500 bg-gradient-to-br from-orange-100 to-orange-200 text-sm font-bold text-slate-900">
                                JI
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

function StatSparkline({ data, color = '#22c55e' }) {
    const id = useId().replace(/:/g, '')
    const gradientId = `spark-${id}`

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    fill={`url(#${gradientId})`}
                    strokeWidth={4}
                    dot={false}
                    isAnimationActive={false}
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}

function StatCard({
    title,
    value,
    badgeText,
    badgeTone = 'success',
    series = [],
    color,
    progress = null,
    footerLabel,
    loading,
}) {
    const badgeClasses = {
        success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
        danger: 'bg-red-500/10 text-red-400 border border-red-500/30',
        brand: 'bg-blue-600/10 text-blue-400 border border-blue-500/30',
        neutral: 'bg-slate-800/80 text-slate-300 border border-slate-700/70',
    }

    return (
        <Panel className="h-full p-6 sm:p-8">
            {loading ? (
                <>
                    <SkeletonLine className="h-5 w-40" />
                    <SkeletonLine className="mt-4 h-10 w-32" />
                    <SkeletonLine className="mt-10 h-24 w-full" />
                </>
            ) : (
                <>
                    <div className="mb-8 flex items-start justify-between gap-3">
                        <div>
                            <p className="text-lg text-slate-400">{title}</p>
                            <h3 className="mt-2 text-4xl font-semibold tracking-tight text-white">{value}</h3>
                        </div>

                        {badgeText ? (
                            <span
                                className={cn(
                                    'rounded-xl px-3 py-2 text-sm font-semibold',
                                    badgeClasses[badgeTone]
                                )}
                            >
                                {badgeText}
                            </span>
                        ) : null}
                    </div>

                    {progress !== null ? (
                        <div className="pt-8">
                            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
                                <div
                                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                                <span>{footerLabel}</span>
                                <span className="font-semibold text-slate-300">{progress}%</span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-24">
                            {series.length ? (
                                <StatSparkline data={series} color={color} />
                            ) : (
                                <div className="h-full rounded-2xl bg-slate-950/40" />
                            )}
                        </div>
                    )}
                </>
            )}
        </Panel>
    )
}

function TrendTooltip({ active, payload }) {
    if (!active || !payload?.length) return null

    const point = payload[0].payload

    return (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-950/95 p-3 shadow-md backdrop-blur-xl">
            <p className="text-sm text-slate-400">{point.label}</p>
            <p className="mt-1 font-semibold text-white">{formatCompactCurrency(point.marketCap)}</p>
            {!!point.volume && (
                <p className="mt-1 text-xs text-slate-400">
                    Volume {formatCompactCurrency(point.volume)}
                </p>
            )}
        </div>
    )
}

function MarketTrendChart({ data, range, onRangeChange, loading, error }) {
    const id = useId().replace(/:/g, '')
    const gradientId = `market-${id}`

    return (
        <Panel className="p-6 sm:p-8">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-white">Market Trend</h2>
                    <p className="mt-1 text-lg text-slate-400">
                        Historical market capitalization ({RANGE_LABELS[range]})
                    </p>
                </div>

                <div className="inline-flex w-fit rounded-2xl bg-slate-800/80 p-1">
                    {['1M', '3M', '1Y', 'ALL'].map((item) => (
                        <button
                            key={item}
                            onClick={() => onRangeChange(item)}
                            className={cn(
                                'pill-btn',
                                item === range
                                    ? 'bg-slate-700 text-white'
                                    : 'text-slate-400 hover:bg-slate-700/60 hover:text-white'
                            )}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[420px] w-full">
                {loading ? (
                    <div className="flex h-full items-center justify-center rounded-2xl bg-slate-950/35">
                        <span className="text-slate-400">Loading chart...</span>
                    </div>
                ) : error ? (
                    <div className="flex h-full items-center justify-center rounded-2xl bg-slate-950/35 text-center text-slate-400">
                        {error}
                    </div>
                ) : !data.length ? (
                    <div className="flex h-full items-center justify-center rounded-2xl bg-slate-950/35 text-center text-slate-400">
                        No historical data available.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 20, right: 12, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                vertical={false}
                                stroke="#1e293b"
                                strokeDasharray="3 3"
                            />
                            <XAxis
                                dataKey="label"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                minTickGap={26}
                            />
                            <YAxis
                                tickFormatter={(value) => formatCompactCurrency(value)}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                width={90}
                            />
                            <Tooltip content={<TrendTooltip />} cursor={{ stroke: '#2563eb', strokeOpacity: 0.25 }} />
                            <Area
                                type="monotone"
                                dataKey="marketCap"
                                stroke="#2563eb"
                                fill={`url(#${gradientId})`}
                                strokeWidth={4}
                                dot={false}
                                activeDot={{ r: 5, fill: '#60a5fa', stroke: '#0f172a', strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </Panel>
    )
}

function DominanceCard({ data, btcDominance, loading }) {
    return (
        <Panel className="h-full p-6 sm:p-8">
            <h2 className="text-3xl font-semibold tracking-tight text-white">Market Dominance</h2>

            {loading ? (
                <div className="mt-8">
                    <SkeletonLine className="mx-auto h-72 w-72 rounded-full" />
                </div>
            ) : (
                <>
                    <div className="relative mx-auto mt-6 h-80 w-full max-w-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="value"
                                    innerRadius={86}
                                    outerRadius={120}
                                    paddingAngle={2}
                                    startAngle={90}
                                    endAngle={-270}
                                >
                                    {data.map((item) => (
                                        <Cell key={item.name} fill={item.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-semibold text-white">
                                {btcDominance.toFixed(0)}%
                            </span>
                            <span className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                                BTC Dominance
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        {data.map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span
                                        className="h-4 w-4 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-xl text-white">{item.name}</span>
                                </div>
                                <span className="text-xl font-semibold text-white">
                                    {item.value.toFixed(1)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </Panel>
    )
}

function CoinAvatar({ coin }) {
    if (coin?.image) {
        return (
            <img
                src={coin.image}
                alt={coin.name}
                className="h-12 w-12 rounded-full border border-slate-700 object-cover"
            />
        )
    }

    return (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-slate-200">
            {coin?.symbol?.slice(0, 4)?.toUpperCase() || 'COIN'}
        </div>
    )
}

function CoinRow({ coin, positive }) {
    const change = getCoinChange(coin)

    return (
        <div className="flex items-center justify-between rounded-2xl bg-slate-950/35 p-3">
            <div className="flex min-w-0 items-center gap-4">
                <CoinAvatar coin={coin} />
                <div className="min-w-0">
                    <p className="truncate text-xl font-semibold text-white">{coin.name}</p>
                    <p className="text-lg text-slate-400">{formatPrice(coin.current_price)}</p>
                </div>
            </div>

            <span
                className={cn(
                    'text-xl font-semibold',
                    positive ? 'text-emerald-400' : 'text-red-400'
                )}
            >
                {formatPercent(change)}
            </span>
        </div>
    )
}

function CoinListCard({ title, coins, positive = true, loading }) {
    const Icon = positive ? TrendingUp : TrendingDown

    return (
        <Panel className="h-full p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
                <Icon className={cn('h-6 w-6', positive ? 'text-emerald-400' : 'text-red-400')} />
                <h3 className="text-2xl font-semibold text-white">{title}</h3>
            </div>

            <div className="space-y-4">
                {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="rounded-2xl bg-slate-950/35 p-3">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <SkeletonLine className="h-12 w-12 rounded-full" />
                                    <div className="space-y-2">
                                        <SkeletonLine className="h-5 w-28" />
                                        <SkeletonLine className="h-4 w-20" />
                                    </div>
                                </div>
                                <SkeletonLine className="h-5 w-16" />
                            </div>
                        </div>
                    ))
                ) : coins.length ? (
                    coins.map((coin) => (
                        <CoinRow key={coin.id} coin={coin} positive={positive} />
                    ))
                ) : (
                    <div className="rounded-2xl bg-slate-950/35 p-4 text-slate-400">
                        No market movers available right now.
                    </div>
                )}
            </div>
        </Panel>
    )
}

function BreakingAlertCard({ news, loading }) {
    const publishedDate =
        news?.published_on
            ? new Intl.DateTimeFormat('en-US', {
                day: '2-digit',
                month: 'short',
                hour: 'numeric',
                minute: '2-digit',
            }).format(new Date(news.published_on * 1000))
            : null

    const title = news?.title || 'Market alert feed is temporarily unavailable.'
    const description =
        truncate(stripHtml(news?.body || ''), 160) ||
        'Stay cautious around macroeconomic releases and sudden volatility spikes across crypto markets.'
    const link = news?.url || 'https://www.cryptocompare.com/news/'

    return (
        <div className="h-full rounded-3xl border border-blue-500/30 bg-blue-600 p-6 shadow-md sm:p-8">
            <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-white" />
                <h3 className="text-2xl font-semibold text-white">Breaking Alert</h3>
            </div>

            {loading ? (
                <div className="mt-8 space-y-3">
                    <div className="h-6 w-2/3 animate-pulse rounded bg-blue-500/40" />
                    <div className="h-5 w-full animate-pulse rounded bg-blue-500/40" />
                    <div className="h-5 w-5/6 animate-pulse rounded bg-blue-500/40" />
                </div>
            ) : (
                <>
                    {publishedDate && (
                        <p className="mt-5 text-sm font-medium text-blue-100/80">{publishedDate}</p>
                    )}

                    <p className="mt-4 text-2xl font-semibold leading-9 text-white">
                        {truncate(title, 110)}
                    </p>

                    <p className="mt-5 text-xl leading-9 text-blue-50/95">{description}</p>

                    <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-8 block w-full rounded-2xl bg-white px-5 py-3 text-center text-lg font-semibold text-blue-600 transition hover:bg-slate-100"
                    >
                        Read Full Report
                    </a>
                </>
            )}
        </div>
    )
}

function Dashboard_2() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [range, setRange] = useState('1M')

    const [globalData, setGlobalData] = useState(null)
    const [markets, setMarkets] = useState([])
    const [chartRaw, setChartRaw] = useState(null)

    const [baseLoading, setBaseLoading] = useState(true)
    const [chartLoading, setChartLoading] = useState(true)

    const [error, setError] = useState('')
    const [chartError, setChartError] = useState('')

    const [searchQuery, setSearchQuery] = useState('')
    const [searchLoading, setSearchLoading] = useState(false)
    const [searchResults, setSearchResults] = useState([])

    useEffect(() => {
        let cancelled = false

        async function loadBaseData() {
            setBaseLoading(true)
            setError('')

            const [globalRes, marketsRes] = await Promise.allSettled([
                getGlobalData(),
                getMarkets(),
            ])

            if (cancelled) return

            const globalOk = globalRes.status === 'fulfilled'
            const marketsOk = marketsRes.status === 'fulfilled'

            if (globalOk) setGlobalData(globalRes.value)
            if (marketsOk) setMarkets(marketsRes.value)

            if (!globalOk && !marketsOk) {
                setError('Unable to load market overview data. Please try again in a moment.')
            }

            setBaseLoading(false)
        }

        loadBaseData()

        return () => {
            cancelled = true
        }
    }, [])

    useEffect(() => {
        let cancelled = false

        async function loadChartData() {
            setChartLoading(true)
            setChartError('')

            try {
                const data = await getGlobalMarketChart(range)
                if (!cancelled) {
                    setChartRaw(data)
                }
            } catch (err) {
                if (!cancelled) {
                    setChartRaw(null)
                    setChartError('Historical chart is unavailable right now due to API limit or network issue.')
                }
            } finally {
                if (!cancelled) {
                    setChartLoading(false)
                }
            }
        }

        loadChartData()

        return () => {
            cancelled = true
        }
    }, [range])

    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([])
            setSearchLoading(false)
            return
        }

        let cancelled = false

        setSearchLoading(true)

        const timer = setTimeout(async () => {
            try {
                const results = await searchAssets(searchQuery)
                if (!cancelled) setSearchResults(results)
            } catch (err) {
                if (!cancelled) setSearchResults([])
            } finally {
                if (!cancelled) setSearchLoading(false)
            }
        }, 350)

        return () => {
            cancelled = true
            clearTimeout(timer)
        }
    }, [searchQuery])

    const chartData = useMemo(() => normalizeChartData(chartRaw, range), [chartRaw, range])

    const miniMarketCapSeries = useMemo(
        () => chartData.slice(-16).map((item) => ({ value: item.marketCap })),
        [chartData]
    )

    const miniVolumeSeries = useMemo(
        () => chartData.slice(-16).map((item) => ({ value: item.volume })),
        [chartData]
    )

    const volumeChange = useMemo(() => {
        if (chartData.length < 2) return 0
        const last = chartData[chartData.length - 1]?.volume || 0
        const prev = chartData[chartData.length - 2]?.volume || 0
        return prev ? ((last - prev) / prev) * 100 : 0
    }, [chartData])

    const dominanceData = useMemo(() => {
        const btc = Number(globalData?.market_cap_percentage?.btc || 0)
        const eth = Number(globalData?.market_cap_percentage?.eth || 0)
        const alt = Math.max(0, 100 - btc - eth)

        return [
            { name: 'Bitcoin (BTC)', value: btc, color: '#2563eb' },
            { name: 'Ethereum (ETH)', value: eth, color: '#60a5fa' },
            { name: 'Altcoins', value: alt, color: '#475569' },
        ]
    }, [globalData])

    const sortedMarkets = useMemo(() => {
        return [...markets].sort((a, b) => getCoinChange(b) - getCoinChange(a))
    }, [markets])

    const gainers = useMemo(
        () => sortedMarkets.filter((coin) => getCoinChange(coin) > 0).slice(0, 3),
        [sortedMarkets]
    )

    const losers = useMemo(
        () =>
            [...sortedMarkets]
                .sort((a, b) => getCoinChange(a) - getCoinChange(b))
                .filter((coin) => getCoinChange(coin) < 0)
                .slice(0, 3),
        [sortedMarkets]
    )

    const assetCoverage = useMemo(() => {
        const assets = Number(globalData?.active_cryptocurrencies || 0)
        const totalMarkets = Number(globalData?.markets || 0)

        if (!assets || !totalMarkets) return 0
        return Math.min(100, Math.round((assets / (assets + totalMarkets)) * 100))
    }, [globalData])

    const marketCapChange = Number(globalData?.market_cap_change_percentage_24h_usd || 0)
    const btcDominance = Number(globalData?.market_cap_percentage?.btc || 0)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
            <div className="mx-auto flex min-h-screen max-w-[1700px]">
                <Sidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

                <main className="min-w-0 flex-1">
                    <Topbar
                        onMenuClick={() => setMobileMenuOpen(true)}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        searchResults={searchResults}
                        searchLoading={searchLoading}
                    />

                    <div className="p-4 sm:p-6 xl:p-10">
                        {error && (
                            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                            <div className="xl:col-span-4">
                                <StatCard
                                    title="Total Market Cap"
                                    value={formatCompactCurrency(globalData?.total_market_cap?.usd)}
                                    badgeText={formatPercent(marketCapChange)}
                                    badgeTone={marketCapChange >= 0 ? 'success' : 'danger'}
                                    series={miniMarketCapSeries}
                                    color="#22c55e"
                                    loading={baseLoading || chartLoading}
                                />
                            </div>

                            <div className="xl:col-span-4">
                                <StatCard
                                    title="Total Volume 24h"
                                    value={formatCompactCurrency(globalData?.total_volume?.usd)}
                                    badgeText={formatPercent(volumeChange)}
                                    badgeTone={volumeChange >= 0 ? 'success' : 'danger'}
                                    series={miniVolumeSeries}
                                    color="#ef4444"
                                    loading={baseLoading || chartLoading}
                                />
                            </div>

                            <div className="xl:col-span-4">
                                <StatCard
                                    title="Available Assets"
                                    value={formatNumber(globalData?.active_cryptocurrencies)}
                                    badgeText={
                                        globalData
                                            ? `${formatNumber(globalData?.upcoming_icos || 0)} upcoming`
                                            : ''
                                    }
                                    badgeTone="brand"
                                    progress={assetCoverage}
                                    footerLabel={`Across ${formatNumber(globalData?.markets || 0)} markets`}
                                    loading={baseLoading}
                                />
                            </div>

                            <div className="xl:col-span-8">
                                <MarketTrendChart
                                    data={chartData}
                                    range={range}
                                    onRangeChange={setRange}
                                    loading={chartLoading}
                                    error={chartError}
                                />
                            </div>

                            <div className="xl:col-span-4">
                                <DominanceCard
                                    data={dominanceData}
                                    btcDominance={btcDominance}
                                    loading={baseLoading}
                                />
                            </div>

                            <div className="xl:col-span-4">
                                <CoinListCard
                                    title="Top Gainers"
                                    coins={gainers}
                                    positive
                                    loading={baseLoading}
                                />
                            </div>

                            <div className="xl:col-span-4">
                                <CoinListCard
                                    title="Top Losers"
                                    coins={losers}
                                    positive={false}
                                    loading={baseLoading}
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Dashboard_2