import { Brain } from 'lucide-react';
import React, { useState } from 'react';

// Mock data as provided by the user (translated to English structure)
const mockAnalysisData = {
  confidence: 87,
  timeframe: '7-14 days',
  expectedReturn: 15.5,
  riskLevel: 'Medium',
  reasons: [
    'Strong upward trend in the past week with 12.3% increase',
    'Trading volume increasing significantly showing market interest',
    'Technical indicators point to continued upward momentum',
    'Positive news about network developments and new partnerships',
    'Strong support at $140 level with resistance at $155'
  ],
  technicalAnalysis: {
    rsi: 65,
    macd: 'Positive',
    movingAverage: 'Above MA50 & MA200',
    support: '$140',
    resistance: '$155',
    trend: 'Bullish'
  }
};

// --- Custom Icons (Inline SVG) ---

// Glowing Brain Icon
const GlowingBrainIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* This path creates the "glow" effect using a text shadow/filter on the container class */}
    <path
      d="M12 2a10 10 0 0 0-7 3c-1 3-1 7 1 9s4 4 8 4 7-2 8-4 2-6 0-9a10 10 0 0 0-7-3z"
      className="text-blue-500 fill-current opacity-20 filter blur-xl"
    />
    {/* Main brain shape */}
    <path
      d="M12 2a10 10 0 0 0-7 3c-1 3-1 7 1 9s4 4 8 4 7-2 8-4 2-6 0-9a10 10 0 0 0-7-3z"
      className="text-white fill-current"
    />
    {/* Lobes (internal structure) */}
    <path
      d="M12 2v20M8 5c-3 1-3 5-1 7s4 4 5 4M16 5c3 1 3 5 1 7s-4 4-5 4"
      className="text-blue-400"
    />
  </svg>
);

// Check Icon
const CheckIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Gauge Icon for Confidence
const GaugeIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 14v4" />
    <path d="M10 20v2" />
    <path d="M14 20v2" />
    <circle cx="12" cy="12" r="10" />
    <path d="M16 16l-3-3" />
  </svg>
);

// Dollar Sign Icon for Return
const DollarIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

// Clock Icon for Timeframe
const ClockIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// Shield Icon for Risk
const ShieldIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// Arrow Up Icon for Bullish Trend
const ArrowUpIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

// --- Component Functions ---

// Card to display a single metric
const MetricCard = ({ icon: Icon, title, value, className = '' }) => (
  <div
    className={`bg-gray-700/50 p-4 rounded-xl flex flex-col items-start space-y-2 border border-gray-600 hover:bg-gray-700 cursor-pointer transition-all ${className}`}
  >
    <div className="flex items-center space-x-2 text-blue-400">
      <Icon className="w-6 h-6" />
      <span className="text-sm font-medium uppercase text-gray-300 tracking-wider">
        {title}
      </span>
    </div>
    <p className="text-3xl font-extrabold text-white">{value}</p>
  </div>
);

// Main Application Component
const AIAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateAnalysis = () => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setAnalysis(mockAnalysisData);
      setLoading(false);
    }, 1500);
  };

  const getRiskColor = (risk) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'text-green-400 bg-green-900/50 border-green-600';
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/50 border-yellow-600';
      case 'high':
        return 'text-red-400 bg-red-900/50 border-red-600';
      default:
        return 'text-gray-400 bg-gray-600/50 border-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-[#0f121a] text-white font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header/Introduction Section */}
        <div className="text-center mb-12 py-8 bg-[#0f1115] rounded-2xl shadow-2xl shadow-gray-900/30 border border-gray-700">
          <Brain className="w-16 h-16 mx-auto mb-4 text-blue-400 shadow-blue-500/50" />
          <h1 className="text-4xl font-extrabold mb-2 text-white">
            AI Financial Analyst
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Our data-driven assistant performs a comprehensive technical and fundamental analysis of market assets to provide actionable, forward-looking recommendations.
          </p>
        </div>

        {/* Action Button */}
        <div className="mb-12 text-center">
          <button
            onClick={handleGenerateAnalysis}
            disabled={loading}
            className="px-10 py-4 text-xl font-bold rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-blue-500/50 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Generate Analysis'
            )}
          </button>
        </div>

        {/* Analysis Results Section */}
        {analysis && (
          <div className="bg-[#0f1115] p-6 sm:p-8 rounded-2xl border border-blue-500/30 animate-in fade-in duration-500">
            <h2 className="text-3xl font-extrabold mb-8 border-b border-gray-700 pb-4 text-white">
              Investment Recommendation Summary
            </h2>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <MetricCard
                icon={GaugeIcon}
                title="Confidence"
                value={`${analysis.confidence}%`}
              />
              <MetricCard
                icon={DollarIcon}
                title="Expected Return"
                value={`+${analysis.expectedReturn}%`}
                className="text-green-400"
              />
              <MetricCard
                icon={ClockIcon}
                title="Timeframe"
                value={analysis.timeframe}
              />
              <MetricCard
                icon={ShieldIcon}
                title="Risk Level"
                value={analysis.riskLevel}
                className={getRiskColor(analysis.riskLevel)}
              />
            </div>

            {/* Reasons for Recommendation */}
            <div className="mb-10 p-6 bg-gray-700/50 rounded-xl border border-gray-600">
              <h3 className="text-2xl font-bold mb-4 text-white flex items-center">
                <CheckIcon className="w-6 h-6 mr-2 text-green-400" />
                Key Drivers
              </h3>
              <ul className="space-y-3">
                {analysis.reasons.map((reason, index) => (
                  <li key={index} className="flex items-start text-gray-300">
                    <CheckIcon className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-green-500" />
                    <span className="text-base">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical Analysis Snapshot */}
            <div className="p-6 bg-gray-700/50 rounded-xl border border-gray-600">
              <h3 className="text-2xl font-bold mb-4 text-white flex items-center">
                <ArrowUpIcon className="w-6 h-6 mr-2 text-red-400" />
                Technical Analysis Snapshot
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {Object.entries(analysis.technicalAnalysis).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center pb-2 border-b border-gray-600">
                    <span className="text-gray-400 capitalize font-medium">{key.split(/(?=[A-Z])/).join(" ")}:</span>
                    <span className="text-white font-semibold">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No analysis message */}
        {!analysis && !loading && (
          <div className="text-center p-12 bg-[#0f1115] rounded-xl border border-gray-700">
            <p className="text-gray-400 text-lg">
              Click "Generate Analysis" to receive a real-time, data-backed financial recommendation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysis;