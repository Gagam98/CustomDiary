// CanvasContent.tsx
import { type FC, useEffect, useCallback } from "react";

interface CanvasContentProps {
  handleUndo: () => void;
  onSave?: () => Promise<void>;
}

const CanvasContent: FC<CanvasContentProps> = ({ handleUndo, onSave }) => {
  // 키보드 단축키 처리
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Undo: Ctrl+Z (또는 Cmd+Z on Mac)
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "z" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        handleUndo();
        return;
      }

      // Save: Ctrl+S (또는 Cmd+S on Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        if (onSave) {
          onSave();
        }
        return;
      }
    },
    [handleUndo, onSave]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // 모눈종이 그리기는 Physics 컴포넌트에서 처리할 것이므로 여기서는 제거
  // 추가적인 캔버스 관련 유틸리티 함수들을 여기에 구현할 수 있습니다.

  return null;
};

export default CanvasContent;
