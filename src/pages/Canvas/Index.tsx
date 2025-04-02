import { useRef, useState } from "react";
import TopToolbar, { Sticker, Photo } from "./TopToolbar";
import CanvasContent from "./CanvasContent";
import Sidebar from "./SideToolbar";
import Physics from "../../hooks/Physics";

const Index = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeSideTool, setActiveSideTool] = useState("glue");
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);

  return (
    <div className="w-full h-screen flex flex-col">
      {/* 상단 툴바 */}
      <TopToolbar
        setStickers={setStickers}
        setPhotos={setPhotos}
        canvasRef={canvasRef}
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
          <Physics photos={photos} stickers={stickers} ref={canvasRef} />
        </div>
      </div>
    </div>
  );
};

export default Index;
