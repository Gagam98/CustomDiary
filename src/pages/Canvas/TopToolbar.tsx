import { useState, ChangeEvent, FC, useRef, useEffect } from "react";
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
import PenTool from "./tools/PenTool";
import EraserTool from "./tools/EraserTool";
import StickerTool from "./tools/StickerTool";
import TextTool from "./tools/TextTool";

export interface Sticker {
  id: string;
  shape: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface TopToolbarProps {
  setStickers: React.Dispatch<React.SetStateAction<Sticker[]>>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const TopToolbar: FC<TopToolbarProps> = ({ setStickers, canvasRef }) => {
  const [activeTool, setActiveTool] = useState<string>("pen");
  const [activeColor, setActiveColor] = useState<string>("#000000");
  const [eraserSize, setEraserSize] = useState<number>(10);
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [showStickerPopup, setShowStickerPopup] = useState<boolean>(false);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const stickerButtonRef = useRef<HTMLButtonElement | null>(null);
  const colorOptions = ["#FF0000", "#0000FF", "#000000", "#FFFFFF"];

  // 캔버스 컨텍스트 초기화
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d", { alpha: true });
    if (ctx) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctxRef.current = ctx;
    }
  }, [canvasRef]);

  // 상태 저장 함수
  const saveCanvasState = () => {
    if (!canvasRef.current || !ctxRef.current) return;
    const imageData = ctxRef.current.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    setHistory((prev) => [...prev, imageData]);
  };

  return (
    <>
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

      <div className="w-full bg-white border-b border-gray-200 p-2">
        <div className="flex items-center w-full relative">
          <div className="w-1/2 flex items-center justify-end pr-4">
            <div className="flex items-center space-x-2">
              <button
                className={`p-2 rounded ${
                  activeTool === "pen" ? "bg-blue-100" : ""
                }`}
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
                ref={stickerButtonRef}
                className={`p-2 rounded ${
                  activeTool === "sticker" ? "bg-blue-100" : ""
                }`}
                onClick={() => {
                  setActiveTool("sticker");
                  setShowStickerPopup((prev) => !prev);
                }}
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
            </div>
          </div>

          <div className="w-1/2 flex items-center pl-4">
            <div className="flex items-center space-x-2 flex-grow">
              {activeTool === "pen" && (
                <>
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
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={lineWidth}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setLineWidth(parseInt(e.target.value))
                    }
                    className="w-20"
                  />
                </>
              )}

              {activeTool === "eraser" && (
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={eraserSize}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEraserSize(parseInt(e.target.value))
                  }
                  className="w-20"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {activeTool === "pen" && (
        <PenTool
          activeTool={activeTool}
          activeColor={activeColor}
          lineWidth={lineWidth}
          canvasRef={canvasRef}
          history={history}
          setHistory={setHistory}
          ctxRef={ctxRef}
          saveCanvasState={saveCanvasState}
        />
      )}
      {activeTool === "eraser" && (
        <EraserTool
          activeTool={activeTool}
          eraserSize={eraserSize}
          canvasRef={canvasRef}
          ctxRef={ctxRef}
          saveCanvasState={saveCanvasState}
        />
      )}
      {activeTool === "sticker" && showStickerPopup && (
        <StickerTool
          setStickers={setStickers}
          canvasRef={canvasRef}
          anchorRef={stickerButtonRef}
          onRequestClose={() => setShowStickerPopup(false)}
        />
      )}
      <TextTool activeTool={activeTool} canvasRef={canvasRef} />
    </>
  );
};

export default TopToolbar;
