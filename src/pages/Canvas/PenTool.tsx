import { FC, useRef, useEffect, useCallback } from "react";
import { Pen } from "lucide-react";
import { useCanvas } from "./CanvasContext";

const PenTool: FC = () => {
  const {
    activeTool,
    activeColor,
    lineWidth,
    canvasRef,
    setActiveTool,
    history,
    setHistory,
  } = useCanvas();
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (canvasRef.current) {
      ctxRef.current = canvasRef.current.getContext("2d");

      // 캔버스 크기 설정
      canvasRef.current.width = canvasRef.current.offsetWidth;
      canvasRef.current.height = canvasRef.current.offsetHeight;
    }
  }, [canvasRef]);

  // 캔버스 상태 저장
  const saveCanvasState = useCallback(() => {
    if (!canvasRef.current || !ctxRef.current) return;
    const imageData = ctxRef.current.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    setHistory([...history, imageData]);
  }, [canvasRef, history, setHistory]);

  // 마우스 좌표 변환
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

      // 캔버스 상태 저장 (Undo 기능을 위해)
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
