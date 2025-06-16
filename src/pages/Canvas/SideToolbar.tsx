import { encodedSvgs } from "../../components/encodedSvgs";

interface SideToolbarProps {
  activeSideTool: string;
  setActiveSideTool: (tool: string) => void;
}

const SideToolbar: React.FC<SideToolbarProps> = ({
  activeSideTool,
  setActiveSideTool,
}) => {
  const tools = [
    {
      id: "glue",
      image: encodedSvgs.glue,
      alt: "접착제",
      tooltip: "접착제 - 오브젝트를 고정시킵니다",
    },
    {
      id: "ruler",
      image: encodedSvgs.ruler,
      alt: "자",
      tooltip: "자 - 측정과 정렬에 사용합니다",
    },
    {
      id: "tape",
      image: encodedSvgs.tape,
      alt: "테이프",
      tooltip: "테이프 - 오브젝트들을 연결합니다",
    },
  ];

  const handleToolClick = (tool: string) => {
    setActiveSideTool(tool === activeSideTool ? "" : tool);
  };

  const handleKeyDown = (event: React.KeyboardEvent, tool: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToolClick(tool);
    }
  };

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 flex flex-col gap-1 -translate-x-12 z-50">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => handleToolClick(tool.id)}
          onKeyDown={(e) => handleKeyDown(e, tool.id)}
          onMouseDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.preventDefault()}
          style={{ userSelect: "none", WebkitUserSelect: "none" }}
          className={`w-24 h-24 transition-all duration-300 ease-in-out flex items-center justify-center
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-lg
            ${
              activeSideTool === tool.id
                ? "translate-x-8 scale-110 shadow-lg"
                : "translate-x-4 hover:translate-x-6 hover:scale-105"
            }`}
          title={tool.tooltip}
          aria-label={tool.tooltip}
          aria-pressed={activeSideTool === tool.id}
          tabIndex={0}
        >
          <img
            src={tool.image}
            alt={tool.alt}
            className={`w-20 h-20 object-contain transition-all duration-200 ${
              activeSideTool === tool.id ? "brightness-110" : ""
            }`}
            style={{
              pointerEvents: "none",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
            draggable="false"
          />
        </button>
      ))}
    </div>
  );
};

export default SideToolbar;
