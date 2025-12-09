import { Divide, Minus, MoreHorizontal } from "lucide-react";

const StyleSelector = ({ strokeStyle, setStrokeStyle }) => {
    const styles = [
        { key: 'solid', icon: "Solid", label: 'Solid (Continuous)' },
        { key: 'dashed', icon: "Dashed", label: 'Dashed' }, // Using Divide (visually represents separation)
        { key: 'dotted', icon: "Dotted", label: 'Dotted' },     // Using MoreHorizontal
    ];

    return (
        <div className="flex gap-1 w-fit flex-wrap py-1">
            <p className="w-full text-sm text-gray-500 mb-3">Line Styles</p>
            {styles.map((style) => (
                <button
                    key={style.key}
                    onClick={() => setStrokeStyle(style.key)}
                    className={`
                        p-3 rounded-xl transition-all
                        ${strokeStyle === style.key
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-[#0a0b0d] text-gray-300 hover:text-white '
                        }
                    `}
                    title={style.label}
                    aria-label={style.label}
                >

                    <span>{style.icon}</span>
                </button>
            ))}
        </div>
    );
};

export default StyleSelector
