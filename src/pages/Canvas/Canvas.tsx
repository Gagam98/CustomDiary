import { useState, useRef, useEffect, useCallback } from "react";
import { FiChevronLeft, FiBookmark } from "react-icons/fi";
import PenTool from "./PenTool";
import EraserTool from "./EraserTool";
import StickPanel from "./StickPanel";

const Canvas: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string>("pen");
  const [activeColor, setActiveColor] = useState<string>("#000000");
  const [lineWidth, setLineWidth] = useState<number>(2);
  const [eraserSize, setEraserSize] = useState<number>(10);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const history = useRef<ImageData[]>([]);
  const historyIndex = useRef<number>(-1);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      ctxRef.current = canvas.getContext("2d");

      if (ctxRef.current) {
        ctxRef.current.lineCap = "round";
        ctxRef.current.strokeStyle = activeColor;
        ctxRef.current.lineWidth = lineWidth;

        if (history.current.length > 0 && historyIndex.current >= 0) {
          restoreCanvas(history.current[historyIndex.current]);
        }
      }
    }
  }, [activeColor, lineWidth]);

  const saveState = () => {
    if (ctxRef.current && canvasRef.current) {
      const imageData = ctxRef.current.getImageData(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      history.current = history.current.slice(0, historyIndex.current + 1);
      history.current.push(imageData);
      historyIndex.current++;
    }
  };

  const restoreCanvas = (imageData: ImageData) => {
    if (ctxRef.current) {
      ctxRef.current.putImageData(imageData, 0, 0);
    }
  };

  const handleUndo = useCallback(() => {
    if (historyIndex.current > 0) {
      historyIndex.current--;
      restoreCanvas(history.current[historyIndex.current]);
    }
  }, []);

  useEffect(() => {
    const keydownHandler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "z") {
        handleUndo();
      }
    };
    window.addEventListener("keydown", keydownHandler);
    return () => window.removeEventListener("keydown", keydownHandler);
  }, [handleUndo]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current || !ctxRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = ctxRef.current;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = lineWidth;
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !ctxRef.current || !canvasRef.current) return;

    const ctx = ctxRef.current;
    const rect = canvasRef.current.getBoundingClientRect();

    if (activeTool === "pen") {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    } else if (activeTool === "eraser") {
      ctx.clearRect(
        e.clientX - rect.left - eraserSize / 2,
        e.clientY - rect.top - eraserSize / 2,
        eraserSize,
        eraserSize
      );
    }
  };

  const handleMouseUp = useCallback(() => {
    if (isDrawing) {
      ctxRef.current?.closePath();
      saveState();
    }
    setIsDrawing(false);
  }, [isDrawing]);

  const handleToolClick = (tool: string) => {
    setActiveTool(tool);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="w-full h-12 bg-gray-600 flex items-center px-4 text-white">
        <FiChevronLeft size={24} />
        <FiBookmark className="ml-auto" size={24} />
      </div>

      <div className="w-full h-16 bg-gray-200 flex items-center px-6 border-b border-gray-300">
        <PenTool
          activeTool={activeTool}
          activeColor={activeColor}
          lineWidth={lineWidth}
          showColorPicker={showColorPicker}
          setActiveTool={setActiveTool}
          setActiveColor={setActiveColor}
          setLineWidth={setLineWidth}
          setShowColorPicker={setShowColorPicker}
        />
        <EraserTool
          activeTool={activeTool}
          eraserSize={eraserSize}
          setActiveTool={setActiveTool}
          setEraserSize={setEraserSize}
        />
      </div>

      <div className="flex flex-1 bg-gray-100">
        <StickPanel activeTool={activeTool} handleToolClick={handleToolClick} />

        {/* Canvas container */}
        <div className="flex flex-1 bg-gray-100 justify-center items-center">
          <canvas
            ref={canvasRef}
            className="w-3/4 h-5/6 bg-white shadow-md border border-gray-300"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
      </div>
    </div>
  );
};

export default Canvas;
