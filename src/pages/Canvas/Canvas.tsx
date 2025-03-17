import { type FC } from "react";
import { useEffect } from "react";
import { CanvasProvider, useCanvas } from "./CanvasContext";
import TopToolbar from "./TopToolbar";
import StickPanel from "./StickPanel";
import StickerPhysics from "../../hooks/StickerPhysics";

const CanvasContent: FC = () => {
  const { activeStickTool, canvasRef, setActiveStickTool, handleUndo } =
    useCanvas();

  // CMD + Z 또는 CTRL + Z 이벤트 리스너 추가
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        handleUndo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo]);

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
