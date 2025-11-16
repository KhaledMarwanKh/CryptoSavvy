import { Zap } from "lucide-react";
import { useEffect, useState } from "react";

const NewsTicker = ({ headlines }) => {
    const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

    // Auto-rotate the news headline every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentNewsIndex(prevIndex => (prevIndex + 1) % headlines.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [headlines.length]);

    return (
        <div className="bg-[#0f1115] p-4 rounded-xl shadow-lg border border-gray-700 space-y-3">
            <h2 className="text-lg font-semibold text-white flex items-center border-b border-gray-700 pb-2">
                <Zap className="w-5 h-5 text-yellow-400 mr-2" />
                Crypto News
            </h2>
            <div className="flex items-center overflow-hidden">
                <div
                    key={currentNewsIndex}
                    className="text-sm text-gray-300 transition-opacity duration-1000 ease-in-out opacity-100"
                >
                    {headlines[currentNewsIndex]}
                </div>
            </div>
        </div>
    );
};

export default NewsTicker;