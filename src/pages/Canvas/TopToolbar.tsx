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
import PenTool from "./TopTools/PenTool";
import EraserTool from "./TopTools/EraserTool";
import StickerTool from "./TopTools/StickerTool";
import TextTool from "./TopTools/TextTool";
import PhotoTool from "./TopTools/PhotoTool";
import { useNavigate } from "react-router-dom";

export interface Sticker {
  id: string;
  shape: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

export interface Photo {
  id: string;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TopToolbarProps {
  setStickers: React.Dispatch<React.SetStateAction<Sticker[]>>;
  setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  title: string;
}

const TopToolbar: FC<TopToolbarProps> = ({
  setStickers,
  setPhotos,
  canvasRef,
  title,
}) => {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState<string>("pen");
  const [activeColor, setActiveColor] = useState<string>("#000000");
  const [eraserSize, setEraserSize] = useState<number>(10);
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [showStickerPopup, setShowStickerPopup] = useState<boolean>(false);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const stickerButtonRef = useRef<HTMLButtonElement | null>(null);
  const colorOptions = ["#FF0000", "#0000FF", "#000000", "#FFFFFF"];
  const photoToolRef = useRef<HTMLInputElement>(null);

  // 캔버스 컨텍스트 초기화 - 이전 상태 유지하도록 수정
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      // 캔버스 크기 설정
      const container = canvasRef.current.parentElement;
      if (!container) return;

      const { width, height } = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // 현재 캔버스 내용 백업
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvasRef.current.width;
      tempCanvas.height = canvasRef.current.height;
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        tempCtx.drawImage(canvasRef.current, 0, 0);
      }

      // 캔버스 크기 설정
      canvasRef.current.width = width * dpr;
      canvasRef.current.height = height * dpr;
      canvasRef.current.style.width = `${width}px`;
      canvasRef.current.style.height = `${height}px`;

      // 컨텍스트 설정
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctxRef.current = ctx;

      // 이전 내용 복원
      if (tempCtx) {
        ctx.drawImage(tempCanvas, 0, 0);
      }
    }
  }, [canvasRef]);

  // 색상/선 굵기 변경 시에도 이전 상태 유지
  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = activeColor;
      ctxRef.current.lineWidth = lineWidth;
    }
  }, [activeColor, lineWidth]);

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
          <button className="text-white p-2" onClick={() => navigate("/")}>
            <ChevronLeft size={20} />
          </button>
        </div>
        <div className="text-white font-medium">{title}</div>
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
                onClick={() => {
                  setActiveTool("image");
                  photoToolRef.current?.click();
                }}
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
      {activeTool === "image" && (
        <PhotoTool
          setPhotos={setPhotos}
          canvasRef={canvasRef}
          ref={photoToolRef}
        />
      )}
      <TextTool activeTool={activeTool} canvasRef={canvasRef} />
    </>
  );
};

export default TopToolbar;
