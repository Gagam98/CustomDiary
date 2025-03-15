import { ChangeEvent } from "react";
import { Pen } from "lucide-react";

interface PenToolProps {
  activeTool: string;
  activeColor: string;
  lineWidth: number;
  showColorPicker: boolean;
  setActiveTool: (tool: string) => void;
  setActiveColor: (color: string) => void;
  setLineWidth: (width: number) => void;
  setShowColorPicker: (show: boolean) => void;
}

const PenTool: React.FC<PenToolProps> = ({
  activeTool,
  activeColor,
  lineWidth,
  showColorPicker,
  setActiveTool,
  setActiveColor,
  setLineWidth,
  setShowColorPicker,
}) => {
  const predefinedColors = [
    "#000000",
    "#666666",
    "#999999",
    "#CCCCCC",
    "#FFFFFF",
    "#800080",
    "#FF0000",
    "#FF6666",
    "#FFC0CB",
    "#FFA500",
    "#0000FF",
    "#003366",
    "#008000",
    "#90EE90",
    "#FFFF00",
    "#00BFFF",
  ];

  const selectColor = (color: string) => {
    setActiveColor(color);
    setShowColorPicker(false);
  };

  return (
    <>
      {/* Pen button */}
      <button
        className={`p-2 rounded ${activeTool === "pen" ? "bg-gray-300" : ""}`}
        onClick={() => {
          setActiveTool("pen");
          setShowColorPicker(false);
        }}
      >
        <Pen
          size={24}
          className={activeTool === "pen" ? "text-gray-700" : "text-gray-500"}
          color={activeTool === "pen" ? activeColor : "#6B7280"}
          fill={activeTool === "pen" ? activeColor : "none"}
        />
      </button>

      {/* Color selection button - only shown when pen is active */}
      {activeTool === "pen" && (
        <div className="relative">
          <button
            className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
            }}
            style={{ backgroundColor: activeColor }}
          >
            {activeColor === "#FFFFFF" && (
              <div className="w-7 h-7 rounded-full border-2 border-gray-300"></div>
            )}
          </button>

          {/* Color picker popup */}
          {showColorPicker && (
            <div
              className="absolute top-10 left-0 bg-white shadow-lg rounded-md p-3 z-10 color-picker-popup"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              style={{ width: "280px" }}
            >
              <div className="text-center mb-2 text-gray-700 font-medium">
                펜 색상
              </div>
              <div className="grid grid-cols-5 gap-3">
                {predefinedColors.map((color, index) => (
                  <button
                    key={`color-${index}`}
                    className={`w-8 h-8 rounded-full ${
                      color === "#FFFFFF" ? "border border-gray-300" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      selectColor(color);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pen size slider - only shown when pen is active */}
      {activeTool === "pen" && (
        <div className="flex items-center ml-3">
          <input
            type="range"
            min="1"
            max="10"
            value={lineWidth}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setLineWidth(Number(e.target.value))
            }
            className="w-24"
          />
        </div>
      )}
    </>
  );
};

export default PenTool;
