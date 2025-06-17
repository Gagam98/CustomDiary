import { useEffect, useState, useRef } from "react";
import { FiStar } from "react-icons/fi";
import { BsCircle, BsSquare, BsTriangle, BsHeart } from "react-icons/bs";
import { stickerSvgs } from "../../../components/stickerSvgs";
import { catStickers } from "../../../components/catStickers";

// TopToolbar의 Sticker 타입과 일치하도록 수정
interface Sticker {
  id: string;
  shape: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface StickerToolProps {
  setStickers: React.Dispatch<React.SetStateAction<Sticker[]>>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  anchorRef: React.RefObject<HTMLElement | null>;
  onRequestClose: () => void;
}

const StickerTool: React.FC<StickerToolProps> = ({
  setStickers,
  canvasRef,
  anchorRef,
  onRequestClose,
}) => {
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    "shapes" | "basic" | "cats"
  >("shapes");

  // 고양이 이미지 캐시
  const catImageCache = useRef(new Map<string, HTMLImageElement>()).current;

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onRequestClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popupRef, anchorRef, onRequestClose]);

  const TOOLBAR_HEIGHT = 88;

  // 고양이 스티커 이미지 사전 로드
  useEffect(() => {
    catStickers.forEach((cat, index) => {
      if (!catImageCache.has(`cat${index + 1}`)) {
        const img = new Image();
        img.onload = () => {
          catImageCache.set(`cat${index + 1}`, img);
        };
        img.onerror = (error) => {
          console.error(`Failed to load cat sticker ${index + 1}:`, error);
        };
        img.src = cat.src;
      }
    });
  }, [catImageCache]);

  const selectSticker = (shape: string) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();

    // 스티커 크기 최적화
    const size = shape.startsWith("cat")
      ? 80 // 고양이 스티커 크기
      : shape.startsWith("sticker")
      ? 60 // 기본 스티커 크기
      : Math.random() * 20 + 40; // 도형 스티커 크기

    const newSticker: Sticker = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      shape,
      x: Math.random() * (rect.width * 0.8) + rect.width * 0.1,
      y: TOOLBAR_HEIGHT + Math.random() * (rect.height - TOOLBAR_HEIGHT - 100),
      size,
      color: getRandomColor(),
    };

    setStickers((prev) => [...prev, newSticker]);
    onRequestClose();
  };

  const getRandomColor = () => {
    const colors = [
      "#0079FF",
      "#00DFA2",
      "#F6FA70",
      "#FF0060",
      "#FF76CE",
      "#B1AFFF",
      "#A3D8FF",
      "#B2A4FF",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const stickersList = [
    { name: "circle", icon: <BsCircle size={20} /> },
    { name: "square", icon: <BsSquare size={20} /> },
    { name: "triangle", icon: <BsTriangle size={20} /> },
    { name: "heart", icon: <BsHeart size={20} /> },
    { name: "star", icon: <FiStar size={20} /> },
    ...stickerSvgs.map((sticker, i) => ({
      name: `sticker${i + 1}`,
      icon: (
        <img
          src={sticker.src}
          alt={`sticker${i + 1}`}
          width="20"
          height="20"
          style={{ objectFit: "contain" }}
          onError={(e) => {
            console.error(`Failed to load sticker image: sticker${i + 1}`);
            e.currentTarget.style.display = "none";
          }}
        />
      ),
    })),
  ];

  const categories = [
    { id: "shapes", name: "도형" },
    { id: "basic", name: "기본 스티커" },
    { id: "cats", name: "고양이 스티커" },
  ];

  const getStickersForCategory = () => {
    if (selectedCategory === "shapes") return stickersList.slice(0, 5);
    if (selectedCategory === "basic") return stickersList.slice(5, 16);
    if (selectedCategory === "cats") {
      return catStickers.map((cat, i) => ({
        name: `cat${i + 1}`,
        icon: (
          <img
            src={cat.src}
            alt={`cat${i + 1}`}
            width="20"
            height="20"
            style={{ objectFit: "contain" }}
            onError={(e) => {
              console.error(`Failed to load cat sticker image: cat${i + 1}`);
              e.currentTarget.style.display = "none";
            }}
          />
        ),
      }));
    }
    return [];
  };

  const addAllStickers = () => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const currentStickers = getStickersForCategory();

    // 현재 선택된 카테고리의 모든 스티커를 순차적으로 추가
    currentStickers.forEach((sticker, index) => {
      const size = sticker.name.startsWith("cat")
        ? 80
        : sticker.name.startsWith("sticker")
        ? 60
        : (Math.random() * 10 + 25) * 1.5;

      // 스티커들을 격자 형태로 배치
      const columns = 4;
      const spacing = 100;
      const column = index % columns;
      const row = Math.floor(index / columns);

      const newSticker: Sticker = {
        id: `sticker-${Date.now()}-${index}-${Math.random()
          .toString(36)
          .substring(2, 9)}`,
        shape: sticker.name,
        x: rect.width * 0.3 + column * spacing,
        y: TOOLBAR_HEIGHT + 100 + row * spacing,
        size,
        color: getRandomColor(),
      };

      setStickers((prev) => [...prev, newSticker]);
    });
    onRequestClose();
  };

  return (
    <div
      ref={popupRef}
      style={popupStyle}
      className="bg-white shadow-lg rounded-md p-3 min-w-[280px]"
    >
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <div className="text-gray-700 font-medium">스티커 선택</div>
        <button
          onClick={onRequestClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>

      {/* 카테고리 선택 탭 */}
      <div className="flex space-x-2 mb-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() =>
              setSelectedCategory(category.id as "shapes" | "basic" | "cats")
            }
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${
                selectedCategory === category.id
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* 스티커 그리드 */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {getStickersForCategory().map((sticker, index) => (
          <button
            key={`${selectedCategory}-${sticker.name}-${index}`}
            className="w-12 h-12 border border-gray-300 rounded flex items-center justify-center hover:bg-blue-50 transition-colors"
            onClick={() => selectSticker(sticker.name)}
            aria-label={`${sticker.name} 스티커 추가`}
          >
            {sticker.icon}
          </button>
        ))}
      </div>

      {/* 모든 스티커 추가 버튼 */}
      <div>
        <button
          onClick={addAllStickers}
          className="w-full py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors text-sm"
        >
          {selectedCategory === "shapes"
            ? "모든 도형 추가"
            : selectedCategory === "basic"
            ? "모든 기본 스티커 추가"
            : "모든 고양이 스티커 추가"}
        </button>
      </div>
    </div>
  );
};

export default StickerTool;
