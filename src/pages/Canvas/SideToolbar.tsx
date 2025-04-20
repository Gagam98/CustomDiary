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
    { id: "glue", image: encodedSvgs.glue, alt: "glue" },
    { id: "ruler", image: encodedSvgs.ruler, alt: "ruler" },
    { id: "tape", image: encodedSvgs.tape, alt: "tape" },
  ];

  const handleToolClick = (tool: string) => {
    setActiveSideTool(tool === activeSideTool ? "" : tool);
  };

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 flex flex-col gap-1 -translate-x-12 z-50">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => handleToolClick(tool.id)}
          onMouseDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.preventDefault()}
          style={{ userSelect: "none", WebkitUserSelect: "none" }}
          className={`w-24 h-24 transition-all duration-300 ease-in-out flex items-center justify-center
            ${
              activeSideTool === tool.id
                ? "translate-x-8 scale-110"
                : "translate-x-4 hover:translate-x-6"
            }`}
        >
          <img
            src={tool.image}
            alt={tool.alt}
            className="w-20 h-20 object-contain"
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
