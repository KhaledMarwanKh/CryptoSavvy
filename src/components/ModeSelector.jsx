import { ArrowDown, ArrowRight, Circle, Pencil, Plus, Square, Triangle } from "lucide-react";

const ModeSelector = ({ drawingMode, setDrawingMode }) => {
    const modes = [
        { key: 'freeDraw', icon: Pencil, label: 'Freehand Draw' },
        { key: 'line', icon: Plus, label: 'Straight Line (2 Pts)' }, // Using ArrowRightLeft for line segment
        { key: 'h_line', icon: ArrowRight, label: 'Horizontal Line' },
        { key: 'v_line', icon: ArrowDown, label: 'Vertical Line' },
        { key: 'rectangle', icon: Square, label: 'Rectangle' },
        { key: 'circle', icon: Circle, lable: 'Circle' },
        { key: 'triangle', icon: Triangle, label: 'Triangle' }
    ];

    return (
        <div className="flex gap-1 flex-wrap">
            <p className="w-full text-sm text-gray-500 mb-3">Draw Mode</p>

            {modes.map((mode) => (
                <button
                    key={mode.key}
                    onClick={() => setDrawingMode(mode.key)}
                    className={`
                        p-3 rounded-xl transition-all
                        ${drawingMode === mode.key
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-[#0a0b0d] text-gray-300 hover:text-white'
                        }
                    `}
                    title={mode.label}
                    aria-label={mode.label}
                >
                    <mode.icon className="w-5 h-5" />
                </button>
            ))}
        </div>
    );
};

export default ModeSelector