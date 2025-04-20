import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import TopToolbar, { Sticker, Photo } from "./TopToolbar";
import CanvasContent from "./CanvasContent";
import Sidebar from "./SideToolbar";
import Physics from "../../hooks/Physics";
import Matter from "matter-js";

const Index = () => {
  const location = useLocation();
  const title = location.state?.title || "Untitled";
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const physicsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const [activeSideTool, setActiveSideTool] = useState("");
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isGlueModeActive, setIsGlueModeActive] = useState(false);

  return (
    <div
      className={`w-full h-screen flex flex-col ${
        isGlueModeActive ? "cursor-grab" : ""
      }`}
    >
      {/* 상단 툴바 */}
      <TopToolbar
        setStickers={setStickers}
        setPhotos={setPhotos}
        canvasRef={canvasRef}
        title={title}
        engineRef={engineRef}
      />

      {/* 사이드바 + 캔버스 영역 */}
      <div className="flex flex-1 min-h-0">
        <div className="w-16 bg-white border-r">
          <Sidebar
            activeSideTool={activeSideTool}
            setActiveSideTool={setActiveSideTool}
          />
        </div>

        <div className="flex-1 relative bg-white">
          <CanvasContent handleUndo={() => console.log("Undo 실행")} />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
            style={{ zIndex: 15 }}
          />
          <Physics
            photos={photos}
            stickers={stickers}
            ref={physicsCanvasRef}
            activeSideTool={activeSideTool}
            setGlueModeActive={setIsGlueModeActive}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
