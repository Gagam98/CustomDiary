import { FC, ChangeEvent } from "react";
import { useCanvas } from "./CanvasContext";
import PenTool from "./PenTool";
import EraserTool from "./EraserTool";
import StickerTool from "./Sticker";
import { FiMinus } from "react-icons/fi";

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

  const colorOptions = ["#FF0000", "#000000", "#0000FF"];

  return (
    <div className="w-full h-14 bg-white flex items-center px-4 border-b border-gray-300">
      {/* 왼쪽 - 도구 선택 (펜, 지우개, 스티커) */}
      <div className="flex items-center space-x-3">
        <PenTool activeTool={activeTool} setActiveTool={setActiveTool} />
        <EraserTool
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          eraserSize={eraserSize}
        />
        <StickerTool activeTool={activeTool} setActiveTool={setActiveTool} />
      </div>

      {/* 중앙 구분선 */}
      <div className="flex-grow flex justify-center">
        <FiMinus size={20} className="text-gray-400" />
      </div>

      {/* 오른쪽 - 색상 선택 및 크기 조절 */}
      <div className="flex items-center space-x-4">
        {/* 색상 선택 */}
        {activeTool === "pen" && (
          <div className="flex space-x-2">
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
        )}

        {/* 선 굵기 조절 */}
        {activeTool === "pen" && (
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="1"
              max="10"
              value={lineWidth}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setLineWidth(parseInt(e.target.value))
              }
              className="w-20"
            />
            <span className="text-sm">{lineWidth}px</span>
          </div>
        )}

        {/* 지우개 크기 조절 */}
        {activeTool === "eraser" && (
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="5"
              max="50"
              value={eraserSize}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEraserSize(parseInt(e.target.value))
              }
              className="w-20"
            />
            <span className="text-sm">{eraserSize}px</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopToolbar;
