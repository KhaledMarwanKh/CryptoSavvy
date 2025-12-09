import React from 'react'
import { BsCursorFill } from "react-icons/bs";
import { FaRegHand } from "react-icons/fa6";
import { MdDraw } from 'react-icons/md';
import { RxReset } from 'react-icons/rx';

const CursorModeSelector = ({ cursorMode, setCursorMode }) => {
    const cursorModes = [
        { key: 'hand', icon: FaRegHand, label: 'Pull' },
        { key: 'draw', icon: MdDraw, label: 'Draw' },
    ];

    return (
        <div className="flex gap-1 py-1">
            {cursorModes.map((mode) => (
                <button
                    key={mode.key}
                    onClick={() => setCursorMode(mode.key)}
                    className={`
                        p-3 rounded-xl transition-all
                        ${cursorMode === mode.key
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
    )
}

export default CursorModeSelector