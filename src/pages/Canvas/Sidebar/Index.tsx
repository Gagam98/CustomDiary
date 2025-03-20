import { FiScissors, FiTool, FiType } from "react-icons/fi";

interface SideStickbarProps {
  activeSideTool: string;
  setActiveSideTool: (tool: string) => void;
}

const SideStickbar: React.FC<SideStickbarProps> = ({
  activeSideTool,
  setActiveSideTool,
}) => {
  return (
    <div className="bg-white w-16 shadow-md border-r border-gray-200 flex flex-col items-center py-4 z-10">
      <div
        className={`w-12 h-12 mb-4 flex items-center justify-center rounded-full cursor-pointer transition-all ${
          activeSideTool === "glue"
            ? "bg-gray-200 shadow-md transform translate-x-1"
            : "hover:bg-gray-100"
        }`}
        onClick={() => setActiveSideTool("glue")}
      >
        <FiTool size={22} />
      </div>

      <div
        className={`w-12 h-12 mb-4 flex items-center justify-center rounded-full cursor-pointer transition-all ${
          activeSideTool === "scissors"
            ? "bg-gray-200 shadow-md transform translate-x-1"
            : "hover:bg-gray-100"
        }`}
        onClick={() => setActiveSideTool("scissors")}
      >
        <FiScissors size={22} />
      </div>

      <div
        className={`w-12 h-12 mb-4 flex items-center justify-center rounded-full cursor-pointer transition-all ${
          activeSideTool === "tape"
            ? "bg-gray-200 shadow-md transform translate-x-1"
            : "hover:bg-gray-100"
        }`}
        onClick={() => setActiveSideTool("tape")}
      >
        <FiType size={22} />
      </div>
    </div>
  );
};

export default SideStickbar;
