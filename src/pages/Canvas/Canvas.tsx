import { useState, useRef } from "react";
import TopToolbar from "./TopToolbar";
import Physics from "../../hooks/Physics";
import Sidebar from "./SideToolbar";
import { useLocation } from "react-router-dom";
import Matter from "matter-js";

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
  const engineRef = useRef<Matter.Engine | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeSideTool, setActiveSideTool] = useState("glue");
  const [isGlueModeActive, setIsGlueModeActive] = useState(false);
  const location = useLocation();
  const title = location.state?.title || "Untitled";

  return (
    <div className="relative w-full h-screen">
      <div className="absolute left-0 top-0 w-16 z-50">
        <Sidebar
          activeSideTool={activeSideTool}
          setActiveSideTool={setActiveSideTool}
        />
      </div>
      <div className={`w-full h-full ${isGlueModeActive ? "cursor-grab" : ""}`}>
        <TopToolbar
          setStickers={setStickers}
          setPhotos={setPhotos}
          canvasRef={canvasRef}
          title={title}
          engineRef={engineRef}
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
