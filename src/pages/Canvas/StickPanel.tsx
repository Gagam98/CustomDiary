import { FiScissors, FiTool, FiType } from "react-icons/fi";

interface StickPanelProps {
  activeStickTool: string;
  setActiveStickTool: (tool: string) => void;
}

const StickPanel: React.FC<StickPanelProps> = ({
  activeStickTool,
  setActiveStickTool,
}) => {
  return (
    <div className="bg-white w-16 shadow-md border-r border-gray-200 flex flex-col items-center py-4 z-10">
      <div
        className={`w-12 h-12 mb-4 flex items-center justify-center rounded-full cursor-pointer transition-all ${
          activeStickTool === "glue"
            ? "bg-gray-200 shadow-md transform translate-x-1"
            : "hover:bg-gray-100"
        }`}
        onClick={() => setActiveStickTool("glue")}
      >
        <FiTool size={22} />
      </div>

      <div
        className={`w-12 h-12 mb-4 flex items-center justify-center rounded-full cursor-pointer transition-all ${
          activeStickTool === "scissors"
            ? "bg-gray-200 shadow-md transform translate-x-1"
            : "hover:bg-gray-100"
        }`}
        onClick={() => setActiveStickTool("scissors")}
      >
        <FiScissors size={22} />
      </div>

      <div
        className={`w-12 h-12 mb-4 flex items-center justify-center rounded-full cursor-pointer transition-all ${
          activeStickTool === "tape"
            ? "bg-gray-200 shadow-md transform translate-x-1"
            : "hover:bg-gray-100"
        }`}
        onClick={() => setActiveStickTool("tape")}
      >
        <FiType size={22} />
      </div>
    </div>
  );
};

export default StickPanel;
