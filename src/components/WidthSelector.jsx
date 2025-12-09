import { PenTool } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const WidthSelector = ({ strokeWidth, setStrokeWidth, strokeColor }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    // Close the popover when clicking outside its boundaries
    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleRangeChange = (e) => {
        setStrokeWidth(Number(e.target.value));
    };

    return (
        <div ref={ref} className="relative flex flex-wrap justify-center z-[1000]">
            <p className="w-full text-sm text-gray-500 mb-3">Line Width</p>
            <div
                className="p-3 flex items-center gap-2 cursor-pointer rounded-xl transition-colors hover:bg-gray-700 justify-center bg-[#0a0b0d] w-full"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Select stroke width"
            >
                <PenTool className="w-5 h-5 text-gray-300" />
                <span className="font-bold text-lg text-gray-100">{strokeWidth}</span>
            </div>

            {isOpen && (
                // Floating popover for width selection
                <div className="absolute top-full mt-2 z-[1000]  w-64 bg-[#0f121a] p-4 rounded-xl shadow-2xl border border-gray-700">
                    <h3 className="text-sm font-semibold mb-3 text-gray-200 border-b pb-2 border-gray-700">
                        Stroke Width (1-20)
                    </h3>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={strokeWidth}
                        onChange={handleRangeChange}
                        // Styled range input for dark mode
                        className="w-full h-2  rounded-lg appearance-none cursor-pointer range-lg bg-gray-700 accent-blue-400"
                    />
                    <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className="text-xs text-gray-400 mb-2">Stroke Preview:</p>
                        <div className="h-4 flex items-center justify-center">
                            {/* Simulate stroke appearance using an hr element, changing its height and color */}
                            <hr
                                className="w-full rounded-full"
                                style={{
                                    height: `${strokeWidth}px`,
                                    backgroundColor: strokeColor,
                                    border: 'none',
                                    transition: 'height 0.1s ease-out', // To make the preview smooth
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WidthSelector