import { Eraser } from "lucide-react";

interface EraserToolProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  setEraserSize: (size: number) => void;
}

const EraserTool: React.FC<EraserToolProps> = ({
  activeTool,
  setActiveTool,
  setEraserSize,
}) => {
  return (
    <div className="relative">
      {/* Eraser button */}
      <button
        className={`p-2 rounded w-10 h-10 flex items-center justify-center ${
          activeTool === "eraser" ? "bg-gray-300" : ""
        }`}
        onClick={() => {
          setActiveTool("eraser");
          setEraserSize(20);
        }}
      >
        <Eraser
          size={24}
          className={
            activeTool === "eraser" ? "text-gray-700" : "text-gray-500"
          }
          fill={activeTool === "eraser" ? "#6B7280" : "none"}
        />
      </button>
    </div>
  );
};

export default EraserTool;
