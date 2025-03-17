import type { FC, ChangeEvent } from "react";
import { FiChevronLeft, FiBookmark } from "react-icons/fi";
import { useCanvas } from "./CanvasContext";
import PenTool from "./PenTool";
import EraserTool from "./EraserTool";
import StickerTool from "./Sticker";

const TopToolbar: FC = () => {
  const {
    activeColor,
    eraserSize,
    lineWidth,
    setActiveColor,
    setEraserSize,
    setLineWidth,
    activeTool,
    setActiveTool,
  } = useCanvas();

  const colorOptions = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
  ];

  return (
    <>
      {/* 상단 헤더 */}
      <div className="w-full h-12 bg-gray-600 flex items-center px-4 text-white">
        <FiChevronLeft size={24} />
        <span className="ml-4 text-lg font-semibold">캔버스 작업</span>
        <FiBookmark className="ml-auto" size={24} />
      </div>

      {/* 툴바 (색상, 선 굵기, 지우개, 도구 선택) */}
      <div className="w-full h-16 bg-gray-200 flex items-center justify-center border-b border-gray-300">
        <div className="flex items-center max-w-4xl w-full justify-between">
          {/* 색상 선택 */}
          <div className="flex items-center space-x-2">
            {colorOptions.map((color) => (
              <div
                key={color}
                className={`w-6 h-6 rounded-full cursor-pointer ${
                  activeColor === color
                    ? "ring-2 ring-offset-2 ring-gray-400"
                    : ""
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setActiveColor(color)}
              />
            ))}
          </div>

          {/* 선 굵기 조절 */}
          <div className="flex items-center">
            <span className="mr-2 text-sm">Line Width:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={lineWidth}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setLineWidth(parseInt(e.target.value))
              }
              className="w-32"
            />
            <span className="ml-2 text-sm">{lineWidth}px</span>
          </div>

          {/* 지우개 크기 조절 */}
          <div className="flex items-center">
            <span className="mr-2 text-sm">Eraser Size:</span>
            <input
              type="range"
              min="5"
              max="50"
              value={eraserSize}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEraserSize(parseInt(e.target.value))
              }
              className="w-32"
            />
            <span className="ml-2 text-sm">{eraserSize}px</span>
          </div>

          {/* 도구 선택 */}
          <div className="flex items-center space-x-4">
            <PenTool
              activeTool={activeTool}
              activeColor={activeColor}
              setActiveTool={setActiveTool}
              setActiveColor={setActiveColor}
            />
            <EraserTool
              activeTool={activeTool}
              eraserSize={eraserSize}
              setActiveTool={setActiveTool}
              setEraserSize={setEraserSize}
            />
            <StickerTool
              activeTool={activeTool}
              setActiveTool={setActiveTool}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default TopToolbar;
