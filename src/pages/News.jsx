import React from 'react';
import { newsData } from '../data/cryptoData';

const ArticleCard = ({ article }) => {
    return (
        <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-xl overflow-hidden shadow-2xl bg-[#0f1115] transition-all duration-300 transform hover:scale-[1.02] border border-gray-700 hover:border-blue-500/50"
        >
            <div className="flex flex-col h-full">
                {/* Article Image */}
                <div className="relative aspect-video overflow-hidden">
                    <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>

                {/* Article Content */}
                <div className="p-5 flex flex-col justify-between flex-grow">
                    <div>
                        {/* Title */}
                        <h2 className="text-xl font-bold text-gray-100 mb-2 leading-tight group-hover:text-blue-400 transition-colors">
                            {article.title}
                        </h2>
                        {/* Description */}
                        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                            {article.description}
                        </p>
                    </div>

                    {/* Metadata */}
                    <div className="pt-4 border-t border-gray-700 flex justify-between items-center text-xs">
                        <span className="font-semibold text-blue-400 bg-gray-700 px-3 py-1 rounded-full">
                            {article.source}
                        </span>
                        <span className="text-gray-500 ml-4">
                            {new Date(article.publishedAt).toLocaleDateString('en-US')}
                        </span>
                    </div>
                </div>
            </div>
        </a>
    );
};

/**
 * Filter Bar Component
 * This uses a flex container with horizontal scrolling for better mobile experience.
 */
const SourceFilter = ({ sources, selectedSource, onSelect }) => {
    return (
        // Custom scrollbar styling (works well in most modern browsers)
        <div className="flex space-x-3 overflow-x-auto pb-2 -mb-2 md:pb-0 md:flex-wrap md:space-x-4">
            {sources.map(source => (
                <button
                    key={source}
                    onClick={() => onSelect(source)}
                    // Tailwind classes for beautiful dark mode button
                    className={`
                        px-4 py-2 mb-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 
                        shadow-lg
                        ${selectedSource === source
                            ? 'bg-blue-500 text-white border-blue-500 border' // Active: Blue pill button
                            : 'bg-[#0a0b0d] text-gray-300 border border-gray-600 hover:bg-gray-600 hover:text-white hover:border-blue-400/50' // Inactive: Grey pill button
                        }
                    `}
                >
                    {source}
                </button>
            ))}
        </div>
    );
};


export default function News() {
    // 1. Calculate unique sources including 'All'
    const uniqueSources = React.useMemo(() => [
        'All',
        ...new Set(newsData.articles.map(a => a.source))
    ], []);

    // 2. State for the active filter
    const [selectedSource, setSelectedSource] = React.useState('All');

    // 3. Filter articles based on the selected source using useMemo for efficiency
    const filteredArticles = React.useMemo(() => {
        if (selectedSource === 'All') {
            return newsData.articles;
        }
        return newsData.articles.filter(article => article.source === selectedSource);
    }, [selectedSource]);

    return (
        <div className="min-h-screen bg-[#0f121a] font-sans p-4 sm:p-8 fade-in animate-in">
            <header className="max-w-7xl mx-auto mb-8 sm:mb-12">
                {/* Filter Bar Section */}
                <div className="mt-4 pt-4">
                    <h2 className="text-xl font-semibold text-gray-300 mb-4">
                        Browse by News Source
                    </h2>
                    <SourceFilter
                        sources={uniqueSources}
                        selectedSource={selectedSource}
                        onSelect={setSelectedSource}
                    />
                </div>
                {/* End Filter Bar Section */}
            </header >

            <main className="max-w-7xl mx-auto">
                {filteredArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredArticles.map((article, index) => (
                            <ArticleCard key={index} article={article} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-12 bg-gray-800 rounded-xl">
                        <p className="text-gray-400 text-xl">
                            No news articles found for the selected source:
                            <span className="text-blue-400 ml-2 font-semibold">{selectedSource}</span>
                        </p>
                        <button
                            onClick={() => setSelectedSource('All')}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
                        >
                            Show All Articles
                        </button>
                    </div>
                )}
            </main>
        </div >
    );
}