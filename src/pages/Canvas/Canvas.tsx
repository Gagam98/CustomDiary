import { useState, useRef } from "react";
import TopToolbar from "./TopToolbar";
import Physics from "../../hooks/Physics";
import Sidebar from "./SideToolbar";
import { useLocation } from "react-router-dom";

interface Sticker {
  id: string;
  shape: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface Photo {
  id: string;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
}

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeSideTool, setActiveSideTool] = useState("glue");
  const [isGlueModeActive, setIsGlueModeActive] = useState(false);
  const location = useLocation();
  const title = location.state?.title || "Untitled";

  return (
    <div
      className={`relative w-full h-screen flex ${
        isGlueModeActive ? "cursor-grab" : ""
      }`}
    >
      <div className="w-16 bg-white border-r">
        <Sidebar
          activeSideTool={activeSideTool}
          setActiveSideTool={setActiveSideTool}
        />
      </div>
      <div className="flex-1">
        <TopToolbar
          setStickers={setStickers}
          setPhotos={setPhotos}
          canvasRef={canvasRef}
          title={title}
        />
        <Physics
          photos={photos}
          stickers={stickers}
          ref={canvasRef}
          activeSideTool={activeSideTool}
          setGlueModeActive={setIsGlueModeActive}
        />
      </div>
    </div>
  );
};

export default Canvas;
