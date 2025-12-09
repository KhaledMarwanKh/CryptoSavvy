const CandlestickLoader = () => {
    const bullishColor = '#10B981';
    const bearishColor = '#EF4444';

    return (
        <div className={`h-[90%] flex items-center justify-center transition-opacity duration-500`}>
            <div className="flex flex-col items-center justify-center rounded-xl">

                <div className="w-24 h-24">
                    <svg viewBox="0 0 100 50" className="w-full h-full">
                        <line x1="10" y1="5" x2="10" y2="45" stroke="#374151" strokeWidth="0.1" />
                        <line x1="90" y1="5" x2="90" y2="45" stroke="#374151" strokeWidth="0.1" />
                        <line x1="5" y1="25" x2="95" y2="25" stroke="#374151" strokeWidth="0.1" />


                        <g className="candle" style={{ animationDelay: '0s' }}>
                            <rect x="10" y="25" width="8" height="15" fill={bullishColor} rx="1" ry="1" /> {/* Body */}
                            <line x1="14" y1="5" x2="14" y2="45" stroke={bullishColor} strokeWidth="1" /> {/* Wick */}
                        </g>

                        <g className="candle" style={{ animationDelay: '0.3s' }}>
                            <rect x="25" y="15" width="8" height="25" fill={bearishColor} rx="1" ry="1" /> {/* Body */}
                            <line x1="29" y1="5" x2="29" y2="45" stroke={bearishColor} strokeWidth="1" /> {/* Wick */}
                        </g>

                        <g className="candle" style={{ animationDelay: '0.6s' }}>
                            <rect x="40" y="30" width="8" height="10" fill={bullishColor} rx="1" ry="1" /> {/* Body */}
                            <line x1="44" y1="5" x2="44" y2="45" stroke={bullishColor} strokeWidth="1" /> {/* Wick */}
                        </g>

                        <g className="candle" style={{ animationDelay: '0.9s' }}>
                            <rect x="55" y="20" width="8" height="20" fill={bearishColor} rx="1" ry="1" /> {/* Body */}
                            <line x1="59" y1="5" x2="59" y2="45" stroke={bearishColor} strokeWidth="1" /> {/* Wick */}
                        </g>

                        <g className="candle" style={{ animationDelay: '1.2s' }}>
                            <rect x="70" y="28" width="8" height="12" fill={bullishColor} rx="1" ry="1" /> {/* Body */}
                            <line x1="74" y1="5" x2="74" y2="45" stroke={bullishColor} strokeWidth="1" /> {/* Wick */}
                        </g>
                    </svg>
                </div>

                {/* The "LOADING" Text with subtle glow */}
                <h1 className={`text-[0.7rem] font-black tracking-widest text-gray-400 drop-shadow-lg s`}>
                    <span className="">Loading</span><span className="dot">.</span><span style={{ animationDelay: '100ms' }} className="dot">.</span><span style={{ animationDelay: '200ms' }} className="dot">.</span>
                </h1>

            </div>
        </div>
    );
};

export default CandlestickLoader;