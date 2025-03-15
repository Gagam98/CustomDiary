import { Eraser } from "lucide-react";

interface EraserToolProps {
  activeTool: string;
  eraserSize: number;
  setActiveTool: (tool: string) => void;
  setEraserSize: (size: number) => void;
}

const EraserTool: React.FC<EraserToolProps> = ({
  activeTool,
  eraserSize,
  setActiveTool,
  setEraserSize,
}) => {
  const eraserSizes = [10, 20, 40];

  return (
    <>
      {/* Eraser button */}
      <button
        className={`p-2 rounded ml-4 ${
          activeTool === "eraser" ? "bg-gray-300" : ""
        }`}
        onClick={() => setActiveTool("eraser")}
      >
        <Eraser
          size={24}
          className={
            activeTool === "eraser" ? "text-gray-700" : "text-gray-500"
          }
          fill={activeTool === "eraser" ? "#6B7280" : "none"}
        />
      </button>

      {/* Eraser size options - only shown when eraser is active */}
      {activeTool === "eraser" && (
        <div className="flex items-center space-x-2 ml-3">
          {eraserSizes.map((size) => (
            <button
              key={`eraser-${size}`}
              className={`rounded-full border ${
                eraserSize === size
                  ? "border-blue-500 bg-blue-100"
                  : "border-gray-400 bg-white"
              } flex items-center justify-center`}
              style={{
                width: `${size / 2 + 20}px`,
                height: `${size / 2 + 20}px`,
              }}
              onClick={() => setEraserSize(size)}
            >
              <div
                className="bg-gray-300 rounded-full"
                style={{
                  width: `${size / 2}px`,
                  height: `${size / 2}px`,
                }}
              ></div>
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default EraserTool;
