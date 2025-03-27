import { useEffect, useState } from "react";
import { FiStar } from "react-icons/fi";
import { BsCircle, BsSquare, BsTriangle, BsHeart } from "react-icons/bs";

interface StickerToolProps {
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
  stickers: Array<{
    id: string;
    shape: string;
    x: number;
    y: number;
    size: number;
    color: string;
  }>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  anchorRef: React.RefObject<HTMLElement | null>;
}

const StickerTool: React.FC<StickerToolProps> = ({
  setStickers,
  stickers,
  canvasRef,
  anchorRef,
}) => {
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPopupStyle({
        position: "absolute",
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        zIndex: 100,
      });
    }
  }, [anchorRef]);

  const TOOLBAR_HEIGHT = 88;

  const selectSticker = (shape: string) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newSticker = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      shape,
      x: Math.random() * (rect.width * 0.8) + rect.width * 0.1,
      y: TOOLBAR_HEIGHT + Math.random() * (rect.height - TOOLBAR_HEIGHT - 100),
      size: Math.random() * 20 + 40,
      color: getRandomColor(),
    };
    setStickers((prev) => [...prev, newSticker]);
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

  useEffect(() => {
    console.log("현재 스티커 개수:", stickers.length);
  }, [stickers]);

  return (
    <div style={popupStyle} className="bg-white shadow-lg rounded-md p-3">
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
  );
};

export default StickerTool;
