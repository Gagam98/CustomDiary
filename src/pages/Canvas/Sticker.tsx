import { useState } from "react";
import { FiStar } from "react-icons/fi";
import { BsCircle, BsSquare, BsTriangle, BsHeart } from "react-icons/bs";

interface StickerToolProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  addSticker: (shape: string) => void;
}

const StickerTool: React.FC<StickerToolProps> = ({
  activeTool,
  setActiveTool,
  addSticker,
}) => {
  const [showStickerPicker, setShowStickerPicker] = useState(false);

  const handleClick = () => {
    setActiveTool("sticker");
    setShowStickerPicker(!showStickerPicker);
  };

  const selectSticker = (shape: string) => {
    addSticker(shape);
    setShowStickerPicker(false);
  };

  const stickers = [
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
        <div className="absolute top-12 left-0 bg-white shadow-lg rounded-md p-3 z-10 sticker-picker-popup">
          <div className="text-center mb-2 text-gray-700 font-medium">
            스티커 모양
          </div>
          <div className="grid grid-cols-3 gap-3">
            {stickers.map((sticker, index) => (
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
