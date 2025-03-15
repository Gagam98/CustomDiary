import { FiPenTool, FiSquare } from "react-icons/fi";

interface StickPanelProps {
  activeTool: string;
  handleToolClick: (tool: string) => void;
}

const StickPanel: React.FC<StickPanelProps> = ({
  activeTool,
  handleToolClick,
}) => {
  return (
    <div className="bg-white w-16 shadow-md border-r border-gray-200 flex flex-col items-center py-4 z-10">
      <div
        className={`w-12 h-12 mb-4 flex items-center justify-center rounded-full cursor-pointer transition-all ${
          activeTool === "pen"
            ? "bg-gray-200 shadow-md transform translate-x-1"
            : "hover:bg-gray-100"
        }`}
        onClick={() => handleToolClick("pen")}
      >
        <div className="w-8 h-8 rounded-full bg-black" />
      </div>

      <div
        className={`w-12 h-12 mb-4 flex items-center justify-center rounded cursor-pointer transition-all ${
          activeTool === "eraser"
            ? "bg-gray-200 shadow-md transform translate-x-1"
            : "hover:bg-gray-100"
        }`}
        onClick={() => handleToolClick("eraser")}
      >
        <FiSquare size={22} />
      </div>

      <div
        className={`w-12 h-12 mb-4 flex items-center justify-center rounded cursor-pointer transition-all ${
          activeTool === "brush"
            ? "bg-gray-200 shadow-md transform translate-x-1"
            : "hover:bg-gray-100"
        }`}
        onClick={() => handleToolClick("brush")}
      >
        <FiPenTool size={22} />
      </div>
    </div>
  );
};

export default StickPanel;
