import { FC, useRef, useEffect, useCallback } from "react";
import { Pen } from "lucide-react";
import { useCanvas } from "./CanvasContext";

const PenTool: FC = () => {
  const { activeTool, activeColor, lineWidth, canvasRef, setActiveTool } =
    useCanvas();
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (canvasRef.current) {
      ctxRef.current = canvasRef.current.getContext("2d");
    }
  }, [canvasRef]);

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      if (!ctxRef.current || !canvasRef.current || activeTool !== "pen") return;

      const ctx = ctxRef.current;
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = lineWidth;
      ctx.globalCompositeOperation = "source-over";

      ctx.beginPath();
      ctx.moveTo(event.offsetX, event.offsetY);
      isDrawing.current = true;
    },
    [canvasRef, activeTool, activeColor, lineWidth]
  );

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDrawing.current || !ctxRef.current) return;
    ctxRef.current.lineTo(event.offsetX, event.offsetY);
    ctxRef.current.stroke();
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!ctxRef.current) return;
    ctxRef.current.closePath();
    isDrawing.current = false;
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
        activeTool === "pen" ? "bg-gray-300" : ""
      }`}
      onClick={() => setActiveTool("pen")}
    >
      <Pen
        size={24}
        className={activeTool === "pen" ? "text-gray-700" : "text-gray-500"}
        fill={activeTool === "pen" ? "#6B7280" : "none"}
      />
    </button>
  );
};

export default PenTool;
