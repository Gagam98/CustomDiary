import { Pen } from "lucide-react";

interface PenToolProps {
  activeTool: string;
  activeColor: string;
  setActiveTool: (tool: string) => void;
  setActiveColor: (color: string) => void;
}

const PenTool: React.FC<PenToolProps> = ({
  activeTool,
  activeColor,
  setActiveTool,
  setActiveColor,
}) => {
  return (
    <>
      {/* Pen button */}
      <button
        className={`p-2 rounded ${activeTool === "pen" ? "bg-gray-300" : ""}`}
        onClick={() => {
          setActiveTool("pen");
          setActiveColor(activeColor);
        }}
      >
        <Pen
          size={24}
          className={activeTool === "pen" ? "text-gray-700" : "text-gray-500"}
          color={activeTool === "pen" ? activeColor : "#6B7280"}
          fill={activeTool === "pen" ? activeColor : "none"}
        />
      </button>
    </>
  );
};

export default PenTool;
