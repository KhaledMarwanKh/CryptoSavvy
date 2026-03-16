export default function Card({
    title, value, icon
}) {
    return (
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 p-6 rounded shadow-md flex justify-between items-center hover:border-blue-600 hover:scale-105 transition-all duration-150">
            <div>
                <p className="text-slate-400 text-sm">
                    {title}
                </p>
                <h3 className="text-2xl font-semibold">{value}</h3>
            </div>
            <div className="text-blue-600">
                {icon}
            </div>
        </div>
    );
}