import { useRef, useState } from "react";
import TopToolbar from "./TopToolbar";
import CanvasContent from "./CanvasContent";
import Sidebar from "./SideToolbar";

const Index = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // ✅ null 허용
  const [activeSideTool, setActiveSideTool] = useState("glue"); // ✅ 사이드툴 상태

  return (
    <div className="w-full h-screen flex flex-col">
      {/* 상단 Toolbar */}
      <div className="w-full">
        <TopToolbar />
      </div>

      {/* 메인 레이아웃: Sidebar + Canvas */}
      <div className="flex flex-1 overflow-hidden bg-gray-100">
        {/* 왼쪽 사이드바 */}
        <div className="w-16">
          <Sidebar
            activeSideTool={activeSideTool}
            setActiveSideTool={setActiveSideTool}
          />
        </div>

        {/* 캔버스 영역 */}
        <div className="flex-1 relative bg-white">
          <CanvasContent
            handleUndo={() => console.log("Undo 실행")}
            canvasRef={canvasRef}
          />
          <canvas
            ref={canvasRef}
            className="w-full h-full absolute top-0 left-0"
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
