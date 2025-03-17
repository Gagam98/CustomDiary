import { FC, useRef, useEffect, useCallback } from "react";
import { Eraser } from "lucide-react";
import { useCanvas } from "./CanvasContext";

const EraserTool: FC = () => {
  const { activeTool, eraserSize, canvasRef, setActiveTool } = useCanvas();
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isErasing = useRef(false);

  useEffect(() => {
    if (canvasRef.current) {
      ctxRef.current = canvasRef.current.getContext("2d");
    }
  }, [canvasRef]);

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      if (!ctxRef.current || !canvasRef.current || activeTool !== "eraser")
        return;

      ctxRef.current.globalCompositeOperation = "destination-out";
      ctxRef.current.lineWidth = eraserSize;

      ctxRef.current.beginPath();
      ctxRef.current.moveTo(event.offsetX, event.offsetY);
      isErasing.current = true;
    },
    [canvasRef, activeTool, eraserSize]
  );

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isErasing.current || !ctxRef.current) return;
    ctxRef.current.lineTo(event.offsetX, event.offsetY);
    ctxRef.current.stroke();
  }, []);

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
      className={`p-2 rounded w-10 h-10 flex items-center justify-center ${
        activeTool === "eraser" ? "bg-gray-300" : ""
      }`}
      onClick={() => setActiveTool("eraser")}
    >
      <Eraser
        size={24}
        className={activeTool === "eraser" ? "text-gray-700" : "text-gray-500"}
        fill={activeTool === "eraser" ? "#6B7280" : "none"}
      />
    </button>
  );
};

export default EraserTool;
