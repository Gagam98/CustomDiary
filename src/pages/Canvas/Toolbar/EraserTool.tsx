import { FC, useRef, useEffect, useCallback } from "react";
import { Eraser } from "lucide-react";

interface EraserToolProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  eraserSize: number;
  setEraserSize: React.Dispatch<React.SetStateAction<number>>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  saveCanvasState: () => void;
}

const EraserTool: FC<EraserToolProps> = ({
  activeTool,
  setActiveTool,
  eraserSize,
  setEraserSize,
  canvasRef,
  saveCanvasState,
}) => {
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isErasing = useRef(false);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      ctxRef.current = canvas.getContext("2d");
      if (ctxRef.current) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
    }
  }, [canvasRef]);

  const getMousePosition = useCallback(
    (event: MouseEvent) => {
      if (!canvasRef?.current) return { x: 0, y: 0 };
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

  return (
    <>
      <button
        className={`p-2 rounded w-10 h-10 flex items-center justify-center ${
          activeTool === "eraser" ? "bg-gray-300" : ""
        }`}
        onClick={() => setActiveTool("eraser")}
      >
        <Eraser
          size={24}
          className={
            activeTool === "eraser" ? "text-gray-700" : "text-gray-500"
          }
        />
      </button>

      <div className="absolute bottom-4 left-4 bg-white shadow p-2 rounded">
        <label className="block text-sm text-gray-600">지우개 크기</label>
        <input
          type="range"
          min={5}
          max={50}
          value={eraserSize}
          onChange={(e) => setEraserSize(parseInt(e.target.value))}
        />
      </div>
    </>
  );
};

export default EraserTool;
