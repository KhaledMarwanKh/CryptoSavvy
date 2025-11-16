import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

const SortableHeader = ({ title, sortKey, currentSort, onClick, className }) => {
    const isSorted = currentSort.key === sortKey;
    let Icon = ArrowUpDown;
    if (isSorted) {
        Icon = currentSort.direction === 'asc' ? ArrowUp : ArrowDown;
    }

    return (
        <th
            scope="col"
            className={`px-6 py-3 cursor-pointer select-none whitespace-nowrap ${className}`}
            onClick={() => onClick(sortKey)}
        >
            <div className="flex items-center justify-end group">
                <span className="group-hover:text-white transition duration-150">
                    {title}
                </span>
                <Icon className={`w-3 h-3 ml-1 ${isSorted ? 'text-white' : 'text-gray-500 group-hover:text-gray-400'}`} />
            </div>
        </th>
    );
};

export default SortableHeader;