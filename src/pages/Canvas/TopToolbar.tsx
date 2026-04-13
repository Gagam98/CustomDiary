import { useState, ChangeEvent, FC, useRef, useEffect } from "react";
import Matter from "matter-js";
import {
  ChevronLeft,
  Bookmark,
  Pen,
  Eraser,
  Image as ImageIcon,
  Type,
  Settings,
  Save,
  Clock,
} from "lucide-react";
import { FiStar } from "react-icons/fi";
import PenTool from "./TopTools/PenTool";
import EraserTool from "./TopTools/EraserTool";
import StickerTool from "./TopTools/StickerTool";
import TextTool from "./TopTools/TextTool";
import PhotoTool from "./TopTools/PhotoTool";

export interface Sticker {
  id: string;
  shape: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

// Photo 타입 정의 - src와 isLoaded 속성 추가
export interface Photo {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  image: HTMLImageElement;
  src: string;
  isLoaded?: boolean;
}

interface TopToolbarProps {
  setStickers: React.Dispatch<React.SetStateAction<Sticker[]>>;
  setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  title: string;
  engineRef: React.RefObject<Matter.Engine | null>;
  onSave?: () => Promise<void>;
  isSaving?: boolean;
  lastSaved?: Date | null;
  onBackToHome?: () => void;
}

const TopToolbar: FC<TopToolbarProps> = ({
  setStickers,
  setPhotos,
  canvasRef,
  title,
  engineRef,
  onSave,
  isSaving = false,
  lastSaved,
  onBackToHome,
}) => {
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

  // 사진 업로드 핸들러 함수
  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const newPhoto: Photo = {
          id: `photo-${Date.now()}`,
          x: Math.random() * 400 + 100,
          y: Math.random() * 200 + 100,
          width: Math.min(img.width, 200),
          height: Math.min(img.height, 200),
          image: img,
          src: e.target?.result as string,
          isLoaded: true,
        };

        setPhotos((prev) => [...prev, newPhoto]);
      };

      img.onerror = () => {
        console.error("Failed to load image");
      };

      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // 캔버스 컨텍스트 초기화 - 투명 배경으로 수정
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
      if (
        tempCtx &&
        canvasRef.current.width > 0 &&
        canvasRef.current.height > 0
      ) {
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

      // 흰색 배경 제거 - 투명 배경 유지
      // ctx.fillStyle = "#ffffff";
      // ctx.fillRect(0, 0, width, height);

      ctxRef.current = ctx;

      // 이전 내용 복원
      if (tempCtx && tempCanvas.width > 0 && tempCanvas.height > 0) {
        ctx.drawImage(tempCanvas, 0, 0, width, height);
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
    setHistory((prev) => [...prev.slice(-9), imageData]); // 최대 10개 히스토리 유지
  };

  // 수동 저장 핸들러
  const handleSave = async () => {
    if (onSave && !isSaving) {
      await onSave();
    }
  };

  // 마지막 저장 시간 포맷팅
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "방금 저장됨";
    if (minutes < 60) return `${minutes}분 전 저장됨`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전 저장됨`;

    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="w-full h-12 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center px-4 justify-between relative z-20">
        <div className="flex items-center">
          <button
            className="text-slate-600 p-2 hover:bg-slate-100 hover:text-indigo-600 rounded transition-colors"
            onClick={onBackToHome}
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        <div className="text-slate-800 font-bold flex items-center">
          <span className="mr-4 tracking-tight">{title}</span>

          {/* 저장 상태 표시 */}
          <div className="flex items-center text-sm">
            {isSaving ? (
              <span className="text-indigo-500 flex items-center bg-indigo-50 px-2 py-0.5 rounded-full">
                <Save size={16} className="mr-1 animate-pulse" />
                저장 중...
              </span>
            ) : lastSaved ? (
              <span className="text-emerald-600 flex items-center bg-emerald-50 px-2 py-0.5 rounded-full">
                <Clock size={16} className="mr-1" />
                {formatLastSaved(lastSaved)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center">
          {/* 수동 저장 버튼 */}
          <button
            className={`text-slate-600 p-2 mr-2 rounded hover:bg-slate-100 hover:text-indigo-600 transition-colors ${
              isSaving ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save size={20} />
          </button>

          <button className="text-slate-600 p-2 hover:bg-slate-100 hover:text-amber-500 rounded transition-colors">
            <Bookmark size={20} />
          </button>
          <button className="text-slate-600 p-2 ml-2 hover:bg-slate-100 hover:text-indigo-600 rounded transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="w-full bg-white/95 backdrop-blur-sm border-b border-slate-100 p-2 shadow-sm relative z-20">
        <div className="flex items-center w-full relative">
          <div className="w-1/2 flex items-center justify-end pr-4 border-r border-slate-200/50">
            <div className="flex items-center space-x-2">
              <button
                className={`p-2 rounded transition-colors ${
                  activeTool === "pen"
                    ? "bg-indigo-50 text-indigo-600 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                }`}
                onClick={() => setActiveTool("pen")}
              >
                <Pen size={20} />
              </button>
              <button
                className={`p-2 rounded transition-colors ${
                  activeTool === "eraser"
                    ? "bg-indigo-50 text-indigo-600 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                }`}
                onClick={() => setActiveTool("eraser")}
              >
                <Eraser size={20} />
              </button>
              <button
                ref={stickerButtonRef}
                className={`p-2 rounded transition-colors ${
                  activeTool === "sticker"
                    ? "bg-indigo-50 text-indigo-600 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                }`}
                onClick={() => {
                  setActiveTool("sticker");
                  setShowStickerPopup((prev) => !prev);
                }}
              >
                <FiStar size={20} />
              </button>
              <button
                className={`p-2 rounded transition-colors ${
                  activeTool === "image"
                    ? "bg-indigo-50 text-indigo-600 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                }`}
                onClick={() => {
                  setActiveTool("image");
                  photoToolRef.current?.click();
                }}
              >
                <ImageIcon size={20} />
              </button>
              <button
                className={`p-2 rounded transition-colors ${
                  activeTool === "text"
                    ? "bg-indigo-50 text-indigo-600 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
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
                      className={`w-6 h-6 rounded-full transition-all shadow-sm ${
                        activeColor === color
                          ? "ring-2 ring-indigo-500 ring-offset-1 scale-110"
                          : "hover:scale-110"
                      } ${color === "#FFFFFF" ? "border border-slate-300" : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setActiveColor(color)}
                    />
                  ))}
                  <div className="flex items-center space-x-2 ml-4">
                    <span className="text-sm font-medium text-slate-600">굵기:</span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={lineWidth}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setLineWidth(parseInt(e.target.value))
                      }
                      className="w-20 accent-indigo-500"
                    />
                    <span className="text-sm font-bold text-indigo-600 w-6">
                      {lineWidth}
                    </span>
                  </div>
                </>
              )}

              {activeTool === "eraser" && (
                <div className="flex items-center space-x-2 ml-2">
                  <span className="text-sm font-medium text-slate-600">크기:</span>
                  <input
                    type="range"
                    min={5}
                    max={50}
                    value={eraserSize}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setEraserSize(parseInt(e.target.value))
                    }
                    className="w-20 accent-indigo-500"
                  />
                  <span className="text-sm font-bold text-indigo-600 w-8">
                    {eraserSize}
                  </span>
                </div>
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
          engineRef={engineRef}
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
          onPhotoUpload={handlePhotoUpload}
        />
      )}
      <TextTool activeTool={activeTool} canvasRef={canvasRef} />
    </>
  );
};

export default TopToolbar;
