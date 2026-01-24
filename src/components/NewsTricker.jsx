import { useEffect, useState } from "react";
import { newsData } from "../data/cryptoData";

const NewsTicker = () => {
    const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

    // Auto-rotate the news headline every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentNewsIndex((currentNewsIndex + 1) % newsData.articles.length)
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <a href={newsData.articles[currentNewsIndex].url} className="bg-[#0f1115] block p-2 rounded-xl shadow-lg border border-gray-700 space-y-3 overflow-hidden relative cursor-pointer group">
            <div className="h-full relative overflow-hidden">
                <img
                    src={newsData.articles[currentNewsIndex].image}
                    alt={newsData.articles[currentNewsIndex].title}
                    className="w-full h-full object-cover transition-transform duration-100 group-hover:scale-105 rounded-xl"
                />
            </div>

            <p className="font-bold text-wrap text-lg my-6 group-hover:text-gray-300 duration-100">{newsData.articles[currentNewsIndex].title}</p>
        </a>
    );
};

export default NewsTicker;