import { useState, useRef, useEffect, useCallback, ChangeEvent } from "react";
import { FiChevronLeft, FiBookmark } from "react-icons/fi";
import PenTool from "./PenTool";
import EraserTool from "./EraserTool";
import StickPanel from "./StickPanel";
import StickerTool from "./Sticker";
import StickerPhysics from "../../hooks/StickerPhysics";

const Canvas: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string>("pen");
  const [activeColor, setActiveColor] = useState<string>("#000000");
  const [lineWidth, setLineWidth] = useState<number>(2);
  const [eraserSize, setEraserSize] = useState<number>(10);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Add sticker state
  const [stickers, setStickers] = useState<
    Array<{
      id: string;
      shape: string;
      x: number;
      y: number;
      size: number;
      color: string;
    }>
  >([]);

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

    // Handle sticker placement or drawing based on active tool
    if (activeTool === "sticker") {
      // We'll handle sticker placement separately
      return;
    }

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
    if (activeTool === "sticker") return; // Don't draw when sticker tool is active

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

  // Add sticker handling function
  const addSticker = (shape: string) => {
    if (!canvasRef.current) return;

    // Get canvas dimensions
    const rect = canvasRef.current.getBoundingClientRect();

    // Create a new sticker at the top of the canvas with random x position
    const newSticker = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      shape,
      x: Math.random() * (rect.width * 0.8) + rect.width * 0.1, // Random position within canvas width (with margin)
      y: 0, // Start at the top
      size: Math.random() * 20 + 40, // Random size between 40-60
      color: getRandomColor(),
    };

    setStickers((prev) => [...prev, newSticker]);
  };

  // Helper function to generate random colors
  const getRandomColor = () => {
    const colors = [
      "#FF5733",
      "#33FF57",
      "#3357FF",
      "#F3FF33",
      "#FF33F3",
      "#33FFF3",
      "#FF8333",
      "#8333FF",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const predefinedColors = [
    "#000000",
    "#666666",
    "#999999",
    "#CCCCCC",
    "#FFFFFF",
    "#800080",
    "#FF0000",
    "#FF6666",
    "#FFC0CB",
    "#FFA500",
    "#0000FF",
    "#003366",
    "#008000",
    "#90EE90",
    "#FFFF00",
    "#00BFFF",
  ];

  const selectColor = (color: string) => {
    setActiveColor(color);
    setShowColorPicker(false);
  };

  const eraserSizes = [10, 20, 40];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="w-full h-12 bg-gray-600 flex items-center px-4 text-white">
        <FiChevronLeft size={24} />
        <FiBookmark className="ml-auto" size={24} />
      </div>

      {/* Redesigned toolbar with centered controls */}
      <div className="w-full h-16 bg-gray-200 flex items-center justify-center border-b border-gray-300">
        <div className="flex items-center max-w-3xl w-full">
          {/* Left side - Tool buttons */}
          <div className="flex items-center">
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
            <div className="mx-2">
              <EraserTool
                activeTool={activeTool}
                eraserSize={eraserSize}
                setActiveTool={setActiveTool}
                setEraserSize={setEraserSize}
              />
            </div>
            <div className="mx-2">
              <StickerTool
                activeTool={activeTool}
                setActiveTool={setActiveTool}
                addSticker={addSticker}
              />
            </div>
          </div>

          {/* Vertical divider line */}
          <div className="h-8 border-l border-gray-400 mx-4"></div>

          {/* Right side - Tool settings */}
          <div className="flex items-center">
            {/* Color selection - only shown when pen is active */}
            {activeTool === "pen" && (
              <div className="relative">
                <button
                  className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setShowColorPicker(!showColorPicker);
                  }}
                  style={{ backgroundColor: activeColor }}
                >
                  {activeColor === "#FFFFFF" && (
                    <div className="w-7 h-7 rounded-full border-2 border-gray-300"></div>
                  )}
                </button>
                {/* Color picker popup */}
                {showColorPicker && (
                  <div
                    className="absolute top-10 left-0 bg-white shadow-lg rounded-md p-3 z-10 color-picker-popup"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    style={{ width: "280px" }}
                  >
                    <div className="text-center mb-2 text-gray-700 font-medium">
                      펜 색상
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                      {predefinedColors.map((color, index) => (
                        <button
                          key={`color-${index}`}
                          className={`w-8 h-8 rounded-full ${
                            color === "#FFFFFF" ? "border border-gray-300" : ""
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            selectColor(color);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pen size slider - only shown when pen is active */}
            {activeTool === "pen" && (
              <div className="flex items-center ml-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={lineWidth}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setLineWidth(Number(e.target.value))
                  }
                  className="w-24"
                />
              </div>
            )}

            {/* Eraser size options - only shown when eraser is active */}
            {activeTool === "eraser" && (
              <div className="flex items-center space-x-2">
                {eraserSizes.map((size) => (
                  <button
                    key={`eraser-${size}`}
                    className={`rounded-full border ${
                      eraserSize === size
                        ? "border-blue-500 bg-blue-100"
                        : "border-gray-400 bg-white"
                    } flex items-center justify-center`}
                    style={{
                      width: `${size / 2 + 20}px`,
                      height: `${size / 2 + 20}px`,
                    }}
                    onClick={() => setEraserSize(size)}
                  >
                    <div
                      className="bg-gray-300 rounded-full"
                      style={{
                        width: `${size / 2}px`,
                        height: `${size / 2}px`,
                      }}
                    ></div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 bg-gray-100 relative">
        <StickPanel activeTool={activeTool} handleToolClick={handleToolClick} />

        {/* Canvas container */}
        <div className="flex flex-1 bg-gray-100 justify-center items-center relative">
          <canvas
            ref={canvasRef}
            className="w-3/4 h-5/6 bg-white shadow-md border border-gray-300"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />

          {/* Physics engine for stickers */}
          <div className="absolute inset-0 pointer-events-none w-3/4 h-5/6 mx-auto my-auto">
            <StickerPhysics shapes={stickers} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Canvas;
