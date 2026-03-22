import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    Calendar,
    SortAsc,
    ChevronLeft,
    ChevronRight,
    X,
    ExternalLink,
    Clock
} from 'lucide-react';
import newsHandler from '../libs/NewsHandler';
import { useTranslation } from 'react-i18next';

const News = () => {
    const { t, i18n } = useTranslation();
    // State Management
    const [searchQuery, setSearchQuery] = useState("bitcoin OR ethereum OR crypto OR blockchain");
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    // Filter States
    const [filters, setFilters] = useState({
        dateFrom: new Date().toISOString(),
        dateTo: new Date().toISOString(),
        sortBy: "publishedAt"
    });

    const [activeFilters, setActiveFilters] = useState({
        dateFrom: "",
        dateTo: "",
        sortBy: "publishedAt"
    });

    const [totalNumber, setTotalNumber] = useState(0);

    // Derived Data
    const [filteredNews, setFilteredNews] = useState([]);

    const onLoading = useCallback((flag) => {
        setIsLoading(flag)
    }, [])


    const handleApplyFilters = () => {
        setActiveFilters(filters);
        setShowFilters(false);
    };

    const handleResetFilters = () => {
        const reset = {
            dateFrom: "",
            dateTo: "",
            sortBy: "publishedAt"
        };
        setFilters(reset);
        setActiveFilters(reset);
        setShowFilters(false);
    };

    useEffect(() => {
        setIsLoading(true);

        const params = {
            apikey: import.meta.env.VITE_GNEWS_API,
            lang: "en",
            q: searchQuery ? searchQuery : "bitcoin OR ethereum OR crypto OR blockchain",
            max: 20,
            sortBy: activeFilters.sortBy,
            page: currentPage
        }

        if (activeFilters.dateFrom) {
            params.from = new Date(activeFilters.dateFrom).toISOString()
        }

        if (activeFilters.dateTo) {
            params.to = new Date(activeFilters.dateTo).toISOString()
        }

        newsHandler.getNews(params).then((res) => {
            setTotalNumber(res?.totalArticles);
            setFilteredNews(res?.articles);
            setIsLoading(false);
        })

    }, [searchQuery, currentPage, activeFilters])

    return (
        <div className="min-h-screen font-sans bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 selection:bg-blue-500/30">

            {/* Header Section */}
            <header className="sticky top-0 z-40 border-b border-slate-700/50 bg-slate-950/60 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col gap-6">

                        {/* Logo and Search Row */}
                        <div className="flex flex-col md:flex-row md:items-center justify-center gap-4">
                            <div className="flex flex-1 max-w-2xl gap-2">
                                <div className="relative flex-1 group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder={t("news.search")}
                                        onKeyDown={(e) => {
                                            if (e.code === "Enter") {
                                                setSearchQuery(e.target.value)
                                            }
                                        }}
                                        className="w-full bg-slate-950/60 border border-slate-700 rounded-xl py-2.5 pl-11 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowFilters(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 border border-slate-700 rounded-xl text-slate-200 hover:font-bold transition-all"
                                >
                                    <Filter className="w-5 h-5" />
                                    <span className="hidden sm:inline">{t("news.filter")}</span>
                                </button>
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between border-t border-slate-800/50 pt-4">
                            <div className="text-sm text-slate-400">
                                {t("news.showing")} <span className="text-slate-200">{totalNumber ?? 0}</span> {t("news.results")}
                            </div>
                            <div className={`flex items-center gap-2 ${i18n.language === "ar" ? "flex-row-reverse" : ""}`}>
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    className="p-2 rounded-lg bg-slate-900/70 border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-300"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="mx-1 text-slate-300">
                                    {currentPage}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="p-2 rounded-lg bg-slate-900/70 border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-300"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* News Grid Section */}
            {
                isLoading ? (
                    <div className='w-full h-[250px] flex items-center justify-center'>

                        <span className='loading loading-spinner'></span>

                    </div>
                ) : (
                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                        {filteredNews?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredNews.map((news) => (
                                    <article
                                        key={news.id}
                                        className="group flex flex-col bg-slate-900/70 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-xl shadow-md hover:shadow-2xl hover:shadow-blue-900/10 hover:border-slate-600 transition-all duration-300"
                                    >
                                        <div className="relative h-52 overflow-hidden">
                                            <img
                                                src={news.image}
                                                alt={news.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-md text-white text-xs font-semibold rounded-full shadow-lg">
                                                    {news.source.name}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-6 flex flex-col flex-1">
                                            <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(news.publishedAt).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>

                                            <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-blue-400 transition-colors">
                                                {news.title}
                                            </h3>

                                            <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                                                {news.description}
                                            </p>

                                            <a
                                                href={news.url}
                                                className="inline-flex items-center gap-2 text-blue-500 font-semibold text-sm hover:text-blue-400 transition-colors group/link"
                                            >
                                                Read Full Story
                                                <ExternalLink className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                                            </a>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mb-6 border border-slate-800">
                                    <Search className="text-slate-600 w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-200">{t("news.NotFound.no")}</h2>
                                <p className="text-slate-500 mt-2 max-w-sm">
                                    {t("news.NotFound.weCant")}
                                </p>
                                <button
                                    onClick={handleResetFilters}
                                    className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-medium"
                                >
                                    {t("news.NotFound.clear")}
                                </button>
                            </div>
                        )}
                    </main>
                )
            }

            {/* Filter Dialog Overlay */}
            {showFilters && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Filter className="text-blue-500 w-5 h-5" />
                                <h2 className="text-xl font-bold">{t("news.filter")}</h2>
                            </div>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Date Filter */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> {t("news.filterDialog.range")}
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-500 ml-1">{t("news.filterDialog.from")}</span>
                                        <input
                                            type="date"
                                            value={filters.dateFrom}
                                            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                            className="w-full bg-slate-950/60 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-500 ml-1">{t("news.filterDialog.to")}</span>
                                        <input
                                            type="date"
                                            value={filters.dateTo}
                                            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                            className="w-full bg-slate-950/60 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sort By Filter */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                    <SortAsc className="w-4 h-4" /> {t("news.filterDialog.sortBy")}
                                </label>
                                <div className="flex gap-2">
                                    {['publishedAt', 'Relevance'].map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => setFilters({ ...filters, sortBy: option })}
                                            className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${filters.sortBy === option
                                                ? "bg-blue-600/20 border-blue-500 text-blue-400 shadow-[inset_0_0_8px_rgba(37,99,235,0.2)]"
                                                : "bg-slate-950/60 border-slate-700 text-slate-500 hover:border-slate-500"
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-950/40 border-t border-slate-800 flex gap-3">
                            <button
                                onClick={handleResetFilters}
                                className="flex-1 py-2.5 border border-slate-700 text-slate-400 rounded-xl hover:bg-slate-800 transition-colors font-medium text-sm"
                            >
                                {t("news.reset")}
                            </button>
                            <button
                                onClick={handleApplyFilters}
                                className="flex-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20 font-bold text-sm"
                            >
                                {t("news.apply")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default News;

