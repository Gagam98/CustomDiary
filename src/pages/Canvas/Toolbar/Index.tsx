import { useState, useRef, ChangeEvent } from "react";
import {
  ChevronLeft,
  Bookmark,
  Pen,
  Eraser,
  Image as ImageIcon,
  Type,
  Settings,
} from "lucide-react";
import { FiStar } from "react-icons/fi";
import PenTool from "./PenTool";
import EraserTool from "./EraserTool";
import StickerTool from "./StickerTool";

const Index = () => {
  const [activeTool, setActiveTool] = useState<string>("pen");
  const [activeColor, setActiveColor] = useState<string>("#000000");
  const [eraserSize, setEraserSize] = useState<number>(10);
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [history, setHistory] = useState<ImageData[]>([]);
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
  const [pages, setPages] = useState([
    { id: 1, thumbnail: "colorful-thumbnail" },
    { id: 2, thumbnail: "blank-page" },
  ]);
  const [currentPage, setCurrentPage] = useState(1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const colorOptions = ["#FF0000", "#0000FF", "#000000", "#FFFFFF"];

  // 되돌리기 기능
  const handleUndo = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      newHistory.pop();
      setHistory(newHistory);
    }
  };

  // 새로운 페이지 추가 기능
  const addNewPage = () => {
    setPages([...pages, { id: pages.length + 1, thumbnail: "blank-page" }]);
  };

  const renderToolbar = () => {
    return (
      <div className="flex items-center space-x-2">
        <button
          className={`p-2 rounded ${activeTool === "pen" ? "bg-blue-100" : ""}`}
          onClick={() => setActiveTool("pen")}
        >
          <Pen size={20} />
        </button>
        <button
          className={`p-2 rounded ${
            activeTool === "eraser" ? "bg-blue-100" : ""
          }`}
          onClick={() => setActiveTool("eraser")}
        >
          <Eraser size={20} />
        </button>
        <button
          className={`p-2 rounded ${
            activeTool === "sticker" ? "bg-blue-100" : ""
          }`}
          onClick={() => setActiveTool("sticker")}
        >
          <FiStar size={20} />
        </button>
        <button
          className={`p-2 rounded ${
            activeTool === "image" ? "bg-blue-100" : ""
          }`}
          onClick={() => setActiveTool("image")}
        >
          <ImageIcon size={20} />
        </button>
        <button
          className={`p-2 rounded ${
            activeTool === "text" ? "bg-blue-100" : ""
          }`}
          onClick={() => setActiveTool("text")}
        >
          <Type size={20} />
        </button>
        <div className="h-6 w-px bg-gray-300 mx-2"></div>
        {colorOptions.map((color) => (
          <button
            key={color}
            className={`w-6 h-6 rounded-full ${
              activeColor === color ? "ring-2 ring-gray-700" : ""
            } ${color === "#FFFFFF" ? "border border-gray-300" : ""}`}
            style={{ backgroundColor: color }}
            onClick={() => setActiveColor(color)}
          />
        ))}
        <div className="h-6 w-px bg-gray-300 mx-2"></div>
        {activeTool === "pen" && (
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="1"
              max="10"
              value={lineWidth}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setLineWidth(parseInt(e.target.value))
              }
              className="w-20"
            />
          </div>
        )}
        <button className="p-2 rounded bg-gray-200" onClick={handleUndo}>
          Undo
        </button>
      </div>
    );
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Top header */}
      <div className="w-full h-12 bg-gray-700 flex items-center px-4 justify-between">
        <div className="flex items-center">
          <button className="text-white p-2">
            <ChevronLeft size={20} />
          </button>
          <div className="text-white font-medium ml-4">test</div>
        </div>
        <div className="flex items-center">
          <button className="text-white p-2">
            <Bookmark size={20} />
          </button>
          <button className="text-white p-2 ml-2">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="w-full bg-white border-b border-gray-200 p-2 flex justify-center">
        {renderToolbar()}
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar with thumbnails */}
        <div className="w-24 bg-gray-100 border-r border-gray-200 flex flex-col overflow-y-auto">
          {pages.map((page) => (
            <div
              key={page.id}
              className={`p-2 cursor-pointer ${
                currentPage === page.id ? "border-2 border-blue-500" : ""
              }`}
              onClick={() => setCurrentPage(page.id)}
            >
              <div
                className={`w-full aspect-[3/4] ${
                  page.thumbnail === "colorful-thumbnail"
                    ? "bg-gradient-to-b from-blue-500 via-blue-300 to-yellow-500"
                    : "bg-gray-50 border border-gray-300"
                } rounded`}
              />
              <div className="text-center text-xs mt-1">{page.id}</div>
            </div>
          ))}
          <div className="p-2 cursor-pointer" onClick={addNewPage}>
            <div className="w-full aspect-[3/4] border border-gray-300 border-dashed rounded flex items-center justify-center">
              <span className="text-blue-500 text-2xl">+</span>
            </div>
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 bg-gray-50 flex justify-center items-center p-4">
          <div className="w-full h-full bg-white shadow-md">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* Active tool components */}
      {activeTool === "pen" && (
        <PenTool
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          activeColor={activeColor}
          lineWidth={lineWidth}
          canvasRef={canvasRef}
          history={history}
          setHistory={setHistory}
        />
      )}

      {activeTool === "eraser" && (
        <EraserTool
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          eraserSize={eraserSize}
          setEraserSize={setEraserSize}
          canvasRef={canvasRef}
          saveCanvasState={() => setHistory([...history])}
        />
      )}

      {activeTool === "sticker" && (
        <StickerTool
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          setStickers={setStickers}
          stickers={stickers}
          canvasRef={canvasRef}
        />
      )}
    </div>
  );
};

export default Index;
