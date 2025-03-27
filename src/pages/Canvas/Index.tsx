import { useRef, useState } from "react";
import TopToolbar, { Sticker } from "./TopToolbar";
import CanvasContent from "./CanvasContent";
import Sidebar from "./SideToolbar";
import StickerPhysics from "../../hooks/StickerPhysics";

const Index = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeSideTool, setActiveSideTool] = useState("glue");
  const [stickers, setStickers] = useState<Sticker[]>([]);

  return (
    <div className="w-full h-screen flex flex-col">
      {/* 상단 툴바 */}
      <TopToolbar
        stickers={stickers}
        setStickers={setStickers}
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
          <CanvasContent
            handleUndo={() => console.log("Undo 실행")}
            canvasRef={canvasRef}
          />
          <canvas
            ref={canvasRef}
            className="w-full h-full absolute top-0 left-0"
          />
          <StickerPhysics shapes={stickers} />
        </div>
      </div>
    </div>
  );
};

export default Index;
