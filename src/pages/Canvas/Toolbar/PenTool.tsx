import { FC, useRef, useEffect, useCallback } from "react";

interface PenToolProps {
  activeTool: string;
  activeColor: string;
  lineWidth: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  history: ImageData[];
  setHistory: (history: ImageData[]) => void;
}

const PenTool: FC<PenToolProps> = ({
  activeTool,
  activeColor,
  lineWidth,
  canvasRef,
  history,
  setHistory,
}) => {
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctxRef.current = ctx;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = lineWidth;
      }
    }
  }, [canvasRef, activeColor, lineWidth]);

  const saveCanvasState = useCallback(() => {
    if (!canvasRef.current || !ctxRef.current) return;

    const ctx = ctxRef.current;
    const imageData = ctx.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    setHistory([...history, imageData]);
  }, [canvasRef, history, setHistory]);

  const getMousePosition = useCallback(
    (event: MouseEvent) => {
      if (!canvasRef.current) return { x: 0, y: 0 };

      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;

      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };
    },
    [canvasRef]
  );

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      if (!ctxRef.current || !canvasRef.current || activeTool !== "pen") return;

      saveCanvasState();
      const ctx = ctxRef.current;
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = lineWidth;
      ctx.globalCompositeOperation = "source-over";

      const { x, y } = getMousePosition(event);
      ctx.beginPath();
      ctx.moveTo(x, y);
      isDrawing.current = true;
    },
    [
      canvasRef,
      activeTool,
      activeColor,
      lineWidth,
      getMousePosition,
      saveCanvasState,
    ]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDrawing.current || !ctxRef.current) return;

      const { x, y } = getMousePosition(event);
      ctxRef.current.lineTo(x, y);
      ctxRef.current.stroke();
    },
    [getMousePosition]
  );

  const handleMouseUp = useCallback(() => {
    if (!ctxRef.current) return;
    ctxRef.current.closePath();
    isDrawing.current = false;
  }, []);

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

  return null; // Tool logic is now handled internally
};

export default PenTool;
