import { FC, useRef, useEffect, useCallback } from "react";

interface EraserToolProps {
  activeTool: string;
  eraserSize: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  saveCanvasState: () => void;
}

const EraserTool: FC<EraserToolProps> = ({
  activeTool,
  eraserSize,
  canvasRef,
  saveCanvasState,
}) => {
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isErasing = useRef(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const dpr = window.devicePixelRatio || 1;

      ctx.setTransform(1, 0, 0, 1, 0, 0); // transform 초기화
      ctx.scale(dpr, dpr); // DPR 적용

      ctxRef.current = ctx;
    }
  }, [canvasRef]);

  const getMousePosition = useCallback(
    (event: MouseEvent) => {
      if (!canvasRef?.current) return { x: 0, y: 0 };
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
      if (!ctxRef.current || !canvasRef?.current || activeTool !== "eraser")
        return;
      saveCanvasState();
      const ctx = ctxRef.current;

      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = eraserSize;
      ctx.lineCap = "round";

      const { x, y } = getMousePosition(event);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.stroke();
      isErasing.current = true;
    },
    [canvasRef, activeTool, eraserSize, saveCanvasState, getMousePosition]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isErasing.current || !ctxRef.current) return;
      const { x, y } = getMousePosition(event);
      ctxRef.current.lineTo(x, y);
      ctxRef.current.stroke();
    },
    [getMousePosition]
  );

  const handleMouseUp = useCallback(() => {
    if (!ctxRef.current) return;
    ctxRef.current.closePath();
    isErasing.current = false;
  }, []);

  useEffect(() => {
    if (!canvasRef?.current) return;
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
