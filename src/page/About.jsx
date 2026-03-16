import React from 'react';
import {
  Cpu,
  TrendingUp,
  ShieldCheck,
  Zap,
  BarChart3,
  Globe,
  Activity,
  Search
} from 'lucide-react';

const About = () => {
  const features = [{
    icon: <Cpu className="w-6 h-6 text-blue-600" />,
    title: "AI Price Prediction",
    desc: "Advanced ML models forecasting market moves."
  },
  {
    icon: <Activity className="w-6 h-6 text-blue-600" />,
    title: "Real-time Monitoring",
    desc: "Live tracking of global exchange data 24/7."
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
    title: "Technical Indicators",
    desc: "Deep dives into RSI, MACD, and EMA trends."
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
    title: "Risk Assessment",
    desc: "Volatility scoring to protect your capital."
  },
  {
    icon: <Zap className="w-6 h-6 text-blue-600" />,
    title: "High Speed",
    desc: "Cloud-optimized infrastructure for zero lag."
  },
  {
    icon: <Globe className="w-6 h-6 text-blue-600" />,
    title: "Multi-Asset Support",
    desc: "BTC, ETH, and all major altcoins included."
  },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans selection:bg-blue-600/30">

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-blue-600/10 blur-[120px] rounded-full" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-600/20 mb-6">
            <Zap size={16} className="text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Smart Crypto Market Insights</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-white">CryptoSavvy</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Empowering traders with AI-driven analysis to navigate the volatility of the blockchain with confidence.
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold border-l-4 border-blue-600 pl-4">What is CryptoSavvy?</h2>
            <p className="text-slate-400 leading-relaxed">
              CryptoSavvy is an advanced crypto-analysis platform that leverages cutting-edge AI and machine-learning models. We help traders make smarter, more confident decisions by turning noise into actionable intelligence.
            </p>
            <ul className="space-y-3">
              {['Real-time market data', 'Price movements', 'Trading volume', 'Technical indicators'].map((item) => (
                <li key={item} className="flex items-center space-x-3 text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-900/70 border border-slate-700/50 backdrop-blur-xl p-8 rounded-3xl shadow-2xl relative">
            <div className="absolute -top-4 -right-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl flex items-center gap-2">
              <TrendingUp size={18} />
              <span className="font-mono font-bold">+12.4% Predicted</span>
            </div>
            <div className="space-y-4">
              <div className="h-4 w-3/4 bg-slate-800 rounded-full animate-pulse" />
              <div className="h-4 w-1/2 bg-slate-800 rounded-full animate-pulse" />
              <div className="h-32 w-full bg-slate-950/60 border border-slate-700 rounded-2xl flex items-center justify-center">
                <Search className="text-slate-700 w-12 h-12" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-slate-950/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Key Features</h2>
            <p className="text-slate-400">
              Everything you need to master the market in one dashboard.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="group p-8 bg-slate-900/70 border border-slate-700/50 backdrop-blur-xl rounded-2xl hover:border-blue-500/50 transition-all duration-300 shadow-md">
                <div className="mb-4 p-3 bg-slate-950/60 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-100">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center bg-blue-600 rounded-[3rem] p-12 md:p-20 shadow-2xl shadow-blue-900/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">Why CryptoSavvy?</h2>
          <p className="text-blue-100 text-lg mb-10 relative z-10">
            We transform complex blockchain & market data into easy-to-understand insights. Stay ahead of volatility and make data-driven decisions with a platform built for speed and security.
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold hover:bg-slate-100 transition-colors shadow-xl relative z-10">
            Start Trading Smarter
          </button>
        </div>
      </section>
    </div>
  );
};

export default About;