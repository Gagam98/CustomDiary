import { FC, useEffect, useCallback, RefObject, useRef } from "react";

interface PenToolProps {
  activeTool: string;
  activeColor: string;
  lineWidth: number;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  history: ImageData[];
  setHistory: (history: ImageData[]) => void;
  ctxRef: RefObject<CanvasRenderingContext2D | null>;
  saveCanvasState: () => void;
}

const PenTool: FC<PenToolProps> = ({
  activeTool,
  activeColor,
  lineWidth,
  canvasRef,
  history,
  setHistory,
  ctxRef,
}) => {
  const isDrawing = useRef(false);

  const setupCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // 현재 캔버스 내용 백업
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (tempCtx) {
      tempCtx.drawImage(canvas, 0, 0);
    }

    // 캔버스 크기 설정
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = lineWidth;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctxRef.current = ctx;

      // 이전 내용 복원
      if (tempCtx) {
        ctx.drawImage(tempCanvas, 0, 0);
      }
    }
  }, [canvasRef, activeColor, lineWidth, ctxRef]);

  // resize 이벤트 핸들러 수정
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !ctxRef.current) return;
      setupCanvas();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setupCanvas]);

  // 초기 설정은 한 번만 실행
  useEffect(() => {
    if (!ctxRef.current) {
      setupCanvas();
    }
  }, [setupCanvas]);

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = activeColor;
      ctxRef.current.lineWidth = lineWidth;
    }
  }, [activeColor, lineWidth, ctxRef]);

  const saveCanvasState = useCallback(() => {
    if (!canvasRef.current || !ctxRef.current) return;
    const imageData = ctxRef.current.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    setHistory([...history, imageData]);
  }, [canvasRef, ctxRef, history, setHistory]);

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
      if (!ctxRef.current || !canvasRef.current || activeTool !== "pen") return;
      saveCanvasState();
      const ctx = ctxRef.current;
      const { x, y } = getMousePosition(event);
      ctx.beginPath();
      ctx.moveTo(x, y);
      isDrawing.current = true;
    },
    [canvasRef, activeTool, getMousePosition, saveCanvasState, ctxRef]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDrawing.current || !ctxRef.current) return;
      const { x, y } = getMousePosition(event);
      ctxRef.current.lineTo(x, y);
      ctxRef.current.stroke();
    },
    [getMousePosition, ctxRef]
  );

  const handleMouseUp = useCallback(() => {
    if (!ctxRef.current) return;
    ctxRef.current.closePath();
    isDrawing.current = false;
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

export default PenTool;
