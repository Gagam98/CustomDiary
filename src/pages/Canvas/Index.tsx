import TopToolbar from "./Toolbar/Index";
import CanvasContent from "./CanvasContent";
import Sidebar from "./Sidebar/Index";
import { useRef } from "react";

const Index = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  return (
    <div className="w-full h-full flex flex-col">
      {/* 상단 툴바 */}
      <TopToolbar />

      {/* 메인 레이아웃: Sidebar + Canvas */}
      <div className="flex flex-1 bg-gray-100">
        {/* 왼쪽 사이드바 */}
        <Sidebar />

        {/* 캔버스 영역 */}
        <CanvasContent
          handleUndo={() => console.log("Undo 실행")}
          canvasRef={canvasRef}
        />
      </div>
    </div>
  );
};

export default Index;
