import { useEffect, useRef, useState } from "react";
import { colorPellets } from "../assets/assets";
import { Palette } from "lucide-react";

const ColorPicker = ({ strokeColor, setStrokeColor }) => {
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

    const handleColorSelect = (hex) => {
        setStrokeColor(hex);
        setIsOpen(false);
    };

    return (
        <div ref={ref} className="relative flex flex-wrap justify-start z-[1100]">
            <p className="w-full text-sm text-gray-500 mb-3">Line Color</p>
            <div
                className="flex items-center gap-2 cursor-pointer rounded-full transition-colors hover:bg-gray-700"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Select stroke color"
            >
                {/* Color circle preview */}
                <div
                    className="w-[100px] h-11 rounded-lg border-2 border-gray-500 shadow-md"
                    style={{ backgroundColor: strokeColor }}
                ></div>
            </div>

            {isOpen && (
                // Floating popover for color selection
                <div className="absolute top-full mt-2 z-[1100] w-64 bg-[#0f121a] p-4 rounded-xl shadow-2xl border border-gray-700">
                    <h3 className="text-sm font-semibold mb-3 text-gray-200 border-b pb-2 border-gray-700">
                        Select Stroke Color (<Palette className="inline w-4 h-4 ml-1" />)
                    </h3>
                    <div className="grid grid-cols-2 gap-3 h-[300px] overflow-y-scroll">
                        {colorPellets.map((color) => (
                            <div
                                key={color.hex}
                                className="flex items-center p-1 rounded-lg cursor-pointer transition-all hover:bg-gray-700/50"
                                onClick={() => handleColorSelect(color.hex)}
                            >
                                <div
                                    className="w-5 h-5 rounded-full mr-2 border-2 border-gray-600"
                                    style={{ backgroundColor: color.hex }}
                                ></div>
                                <span className={`text-[0.7rem] font-medium ${strokeColor === color.hex ? 'text-blue-400' : 'text-gray-300'} text-wrap`}>
                                    {color.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColorPicker;

