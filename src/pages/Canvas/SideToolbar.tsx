import { FiScissors, FiTool, FiType } from "react-icons/fi";

interface SideToolbarProps {
  activeSideTool: string;
  setActiveSideTool: (tool: string) => void;
}

const SideToolbar: React.FC<SideToolbarProps> = ({
  activeSideTool,
  setActiveSideTool,
}) => {
  const handleToolClick = (tool: string) => {
    setActiveSideTool(activeSideTool === tool ? "" : tool);
  };

  return (
    <div className="bg-white w-16 shadow-md border-r border-gray-200 flex flex-col justify-center items-center h-full z-10">
      <div className="flex flex-col gap-8">
        <div
          className={`w-12 h-12 flex items-center justify-center rounded-full cursor-pointer transition-all ${
            activeSideTool === "glue"
              ? "bg-blue-200 shadow-md transform translate-x-1"
              : "hover:bg-gray-100"
          }`}
          onClick={() => handleToolClick("glue")}
        >
          <FiTool size={22} />
        </div>

        <div
          className={`w-12 h-12 flex items-center justify-center rounded-full cursor-pointer transition-all ${
            activeSideTool === "scissors"
              ? "bg-gray-200 shadow-md transform translate-x-1"
              : "hover:bg-gray-100"
          }`}
          onClick={() => handleToolClick("scissors")}
        >
          <FiScissors size={22} />
        </div>

        <div
          className={`w-12 h-12 flex items-center justify-center rounded-full cursor-pointer transition-all ${
            activeSideTool === "tape"
              ? "bg-gray-200 shadow-md transform translate-x-1"
              : "hover:bg-gray-100"
          }`}
          onClick={() => handleToolClick("tape")}
        >
          <FiType size={22} />
        </div>
      </div>
    </div>
  );
};

export default SideToolbar;
