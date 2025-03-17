import { FC, useRef, useEffect, useCallback } from "react";
import { Eraser } from "lucide-react";
import { useCanvas } from "./CanvasContext";

const EraserTool: FC = () => {
  const { activeTool, eraserSize, canvasRef, setActiveTool, saveCanvasState } =
    useCanvas();
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isErasing = useRef(false);

  useEffect(() => {
    if (canvasRef.current) {
      ctxRef.current = canvasRef.current.getContext("2d");
      canvasRef.current.width = canvasRef.current.offsetWidth;
      canvasRef.current.height = canvasRef.current.offsetHeight;
    }
  }, [canvasRef]);

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
      if (!ctxRef.current || !canvasRef.current || activeTool !== "eraser")
        return;

      // 캔버스 상태 저장 (Undo 기능을 위해)
      saveCanvasState();

      ctxRef.current.globalCompositeOperation = "destination-out";
      ctxRef.current.lineWidth = eraserSize;

      const { x, y } = getMousePosition(event);
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(x, y);
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
    const canvas = canvasRef.current;
    if (!canvas) return;

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

  return (
    <button
      className="p-2 rounded w-10 h-10 flex items-center justify-center"
      onClick={() => setActiveTool("eraser")}
    >
      <Eraser
        size={24}
        className={activeTool === "eraser" ? "text-gray-700" : "text-gray-500"}
      />
    </button>
  );
};

export default EraserTool;
