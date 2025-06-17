import { FC, useEffect, useCallback, RefObject, useRef } from "react";

interface EraserToolProps {
  activeTool: string;
  eraserSize: number;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  ctxRef: RefObject<CanvasRenderingContext2D | null>;
  saveCanvasState: () => void;
}

const EraserTool: FC<EraserToolProps> = ({
  activeTool,
  eraserSize,
  canvasRef,
  ctxRef,
  saveCanvasState,
}) => {
  const isErasing = useRef(false);

  const getMousePosition = useCallback(
    (event: MouseEvent) => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    },
    [canvasRef]
  );

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      if (!ctxRef.current || activeTool !== "eraser") return;

      // 상태 저장
      saveCanvasState();

      const ctx = ctxRef.current;
      const { x, y } = getMousePosition(event);

      // 지우개 모드로 설정 - 투명하게 지우기
      ctx.save(); // 현재 상태 저장
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = eraserSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y); // 점 하나만 찍어도 지워지도록
      ctx.stroke();

      isErasing.current = true;
    },
    [activeTool, eraserSize, getMousePosition, saveCanvasState, ctxRef]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isErasing.current || !ctxRef.current) return;

      const { x, y } = getMousePosition(event);
      const ctx = ctxRef.current;

      ctx.lineTo(x, y);
      ctx.stroke();
    },
    [getMousePosition, ctxRef]
  );

  const handleMouseUp = useCallback(() => {
    if (!ctxRef.current || !isErasing.current) return;

    const ctx = ctxRef.current;
    ctx.closePath();
    ctx.restore(); // 이전 상태로 복원 (globalCompositeOperation 포함)

    isErasing.current = false;
  }, [ctxRef]);

  // 마우스 이벤트 리스너 등록
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, canvasRef]);

  return null;
};

export default EraserTool;
