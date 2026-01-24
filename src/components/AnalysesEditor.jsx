import React, { useEffect, useRef, useState } from 'react';
import ChartSection from './ChartSection';
import ColorPicker from './ColorSelector'
import WidthSelector from './WidthSelector';
import StyleSelector from './StyleSelector';
import ModeSelector from './ModeSelector';
import CursorModeSelector from './CursorModeSelector';
import { initCanvas, resetCanvas, updateProperties } from '../canvas/canvas';
import { Menu } from 'lucide-react';
import { ImCancelCircle } from 'react-icons/im';
import { FaEraser } from 'react-icons/fa6';

const AnalysesEditor = ({ editorState, crypto, setEditorState }) => {
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [strokeStyle, setStrokeStyle] = useState('solid');
  const [drawingMode, setDrawingMode] = useState('freeDraw');
  const [cursorMode, setCursorMode] = useState('draw');
  const [initMode, setInitMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const ref = useRef(null);

  const handleClickOutSide = ({ target }) => {

    if (ref.current && !ref.current.contains(target)) {
      setShowSettings(false);
    }

  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutSide);

    return () => document.removeEventListener('mousedown', handleClickOutSide);
  }, [])

  useEffect(() => {
    initCanvas(strokeColor, strokeStyle, strokeWidth, drawingMode)
    setInitMode(true);
  }, [])

  useEffect(() => {
    if (cursorMode !== "draw" && showSettings) {
      setShowSettings(false);
    }
  }, [cursorMode, showSettings])

  useEffect(() => {
    if (initMode) {
      updateProperties(strokeColor, strokeStyle, strokeWidth, drawingMode);
    }
  }, [strokeColor, strokeStyle, strokeWidth, drawingMode, initMode])

  return (
    <div className='w-full rounded-sm z-50 bg-[#0f121a] gap-2 px-3 sm:px-4 py-7 relative fade-in animate-in'>

      {/* Main Toolbar */}
      <div ref={ref} className={`bg-[#0f1115] p-3 rounded-2xl shadow-xl flex flex-col items-start gap-2 justify-start border border-gray-700 transition-all duration-100 absolute z-[2000] ${showSettings ? "top-[0px]" : "top-[-1000px]"} left-[0]`}>

        <div className='w-full flex justify-between items-center'>
          {/* Section 1: Color Selection */}
          <ColorPicker
            strokeColor={strokeColor}
            setStrokeColor={setStrokeColor}
          />

          {/* Section 2: Width Selection */}
          <WidthSelector
            strokeWidth={strokeWidth}
            setStrokeWidth={setStrokeWidth}
            strokeColor={strokeColor}
          />
        </div>

        {/* Section 3: Stroke Style Selection */}
        <StyleSelector
          strokeStyle={strokeStyle}
          setStrokeStyle={setStrokeStyle}
        />

        {/* Section 4: Drawing Modes */}
        <ModeSelector
          drawingMode={drawingMode}
          setDrawingMode={setDrawingMode}
        />
      </div>

      <div className='w-full canvas-container relative'>
        <ChartSection setCursorMode={setCursorMode} crypto={crypto} setEditorState={setEditorState} editorState={editorState} />
        <canvas style={{ display: cursorMode === 'draw' ? "block" : "none" }} id="canvas" className='cursor-crosshair bg-transparent absolute bottom-8 left-0 z-[50]'>

        </canvas>
      </div>

      <div className='flex justify-around items-center bg-black/50 px-3 py-2 rounded-lg fixed bottom-3 left-0 w-full sm:w-1/2 sm:left-[50%] sm:translate-x-[-50%] z-[1000]'>
        <CursorModeSelector
          cursorMode={cursorMode}
          setCursorMode={setCursorMode}
        />

        <button onClick={() => resetCanvas()} className={`p-3 rounded-xl transition-all bg-[#0a0b0d] text-gray-300 hover:text-white hover:bg-blue-500 duration-200`} title={"Reset"} aria-label={"Reset"} >
          <FaEraser className="w-5 h-5" />
        </button>

        <button disabled={cursorMode !== "draw"} onClick={() => setShowSettings(!showSettings)} className={`p-3 rounded-xl ${showSettings ? "bg-blue-500 text-white" : "bg-[#0a0b0d] text-gray-300"} duration-200`} title={"More Settings"} aria-label={"More Settings"}>
          <Menu className='h-5 w-5' />
        </button>


        <button onClick={() => setEditorState(false)} className={`p-3 rounded-xl hover:bg-blue-500 hover:text-white bg-[#0a0b0d] text-gray-300 duration-200`} title={"Cancel"} aria-label={"Cancel"}>
          <ImCancelCircle className='w-5 h-5' />
        </button>
      </div>

    </div >
  )
}

export default AnalysesEditor