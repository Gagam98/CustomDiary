// CanvasContent.tsx
import { type FC, useEffect } from "react";

interface CanvasProps {
  handleUndo: () => void;
}

const CanvasContent: FC<CanvasProps> = ({ handleUndo }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        handleUndo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo]);

  // 모눈종이 그리기는 Physics 컴포넌트에서 처리할 것이므로 여기서는 제거
  return null;
};

export default CanvasContent;
