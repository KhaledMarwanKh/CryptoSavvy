

const StatCard = ({ title, value, icon: Icon, colorClass }) => {

    return (
        <div className={`bg-[#0f1115] p-6 rounded-xl shadow-xl border border-gray-700 transition duration-300 hover:border-blue-500 hover:scale-105`}>
            <div className="flex items-center justify-between">
                <div className='text-left'>
                    <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
                    <p className="text-2xl font-extrabold text-white">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${colorClass} bg-opacity-20`}>
                    <Icon className={`w-6 h-6 ${colorClass}`} />
                </div>
            </div>
        </div>
    );
}

export default StatCard;