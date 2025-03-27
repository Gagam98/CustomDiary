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
      saveCanvasState();
      const ctx = ctxRef.current;
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = eraserSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const { x, y } = getMousePosition(event);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y);
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
    if (!ctxRef.current) return;
    ctxRef.current.closePath();
    ctxRef.current.globalCompositeOperation = "source-over";
    isErasing.current = false;
  }, [ctxRef]);

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
