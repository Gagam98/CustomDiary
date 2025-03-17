import type { FC } from "react";
import { CanvasProvider } from "./CanvasContext";
import TopToolbar from "./TopToolbar";
import StickPanel from "./StickPanel";
import StickerPhysics from "../../hooks/StickerPhysics";
import { useCanvas } from "./CanvasContext";

const CanvasContent: FC = () => {
  const { activeStickTool, canvasRef, setActiveStickTool } = useCanvas();

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 헤더 및 툴바를 통합한 컴포넌트 */}
      <TopToolbar />

      {/* 캔버스 작업 영역 */}
      <div className="flex flex-1 bg-gray-100 relative">
        {/* 스티커 패널 */}
        <StickPanel
          activeStickTool={activeStickTool}
          setActiveStickTool={setActiveStickTool}
        />

        {/* 중앙 캔버스 영역 */}
        <div className="flex flex-1 bg-gray-100 justify-center items-center relative">
          <canvas
            ref={canvasRef}
            className="w-3/4 h-5/6 bg-white shadow-md border border-gray-300"
          />
          <div className="absolute inset-0 pointer-events-none w-3/4 h-5/6 mx-auto my-auto">
            <StickerPhysics shapes={[]} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Canvas: React.FC = () => {
  return (
    <CanvasProvider>
      <CanvasContent />
    </CanvasProvider>
  );
};

export default Canvas;
