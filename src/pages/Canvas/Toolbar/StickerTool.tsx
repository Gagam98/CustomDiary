import { useState } from "react";
import { FiStar } from "react-icons/fi";
import { BsCircle, BsSquare, BsTriangle, BsHeart } from "react-icons/bs";

interface StickerToolProps {
  activeTool: "pen" | "eraser" | "sticker" | "image" | "text";
  setActiveTool: (
    tool: "pen" | "eraser" | "sticker" | "image" | "text"
  ) => void;
  setStickers: React.Dispatch<
    React.SetStateAction<
      Array<{
        id: string;
        shape: string;
        x: number;
        y: number;
        size: number;
        color: string;
      }>
    >
  >;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const StickerTool: React.FC<StickerToolProps> = ({
  activeTool,
  setActiveTool,
  setStickers,
  canvasRef,
}) => {
  const [showStickerPicker, setShowStickerPicker] = useState(false);

  const handleClick = () => {
    setActiveTool("sticker");
    setShowStickerPicker(!showStickerPicker);
  };

  const selectSticker = (shape: string) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newSticker = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      shape,
      x: Math.random() * (rect.width * 0.8) + rect.width * 0.1,
      y: Math.random() * (rect.height * 0.8) + rect.height * 0.1, // 캔버스 안에서 위치 설정
      size: Math.random() * 20 + 40,
      color: getRandomColor(),
    };

    setStickers((prev) => [...prev, newSticker]);
    setShowStickerPicker(false);
  };

  const getRandomColor = () => {
    const colors = [
      "#FF5733",
      "#33FF57",
      "#3357FF",
      "#F3FF33",
      "#FF33F3",
      "#33FFF3",
      "#FF8333",
      "#8333FF",
      "#FF5733",
      "#57FF33",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const stickersList = [
    { name: "circle", icon: <BsCircle size={20} /> },
    { name: "square", icon: <BsSquare size={20} /> },
    { name: "triangle", icon: <BsTriangle size={20} /> },
    { name: "heart", icon: <BsHeart size={20} /> },
    { name: "star", icon: <FiStar size={20} /> },
  ];

  return (
    <div className="relative">
      <button
        className={`flex flex-col items-center justify-center p-2 ${
          activeTool === "sticker" ? "bg-blue-100 text-blue-500 rounded" : ""
        }`}
        onClick={handleClick}
      >
        <FiStar size={24} />
        <span className="text-xs mt-1">스티커</span>
      </button>

      {showStickerPicker && (
        <div className="absolute top-12 left-0 bg-white shadow-lg rounded-md p-3 z-20 sticker-picker-popup">
          <div className="text-center mb-2 text-gray-700 font-medium">
            스티커 모양 선택
          </div>
          <div className="grid grid-cols-3 gap-3">
            {stickersList.map((sticker, index) => (
              <button
                key={`sticker-${index}`}
                className="w-12 h-12 border border-gray-300 rounded flex items-center justify-center hover:bg-blue-50"
                onClick={() => selectSticker(sticker.name)}
              >
                {sticker.icon}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StickerTool;
