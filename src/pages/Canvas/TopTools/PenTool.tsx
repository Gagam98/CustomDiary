import { FC, useEffect, useCallback, RefObject, useRef } from "react";
import Matter from "matter-js";

interface PenToolProps {
  activeTool: string;
  activeColor: string;
  lineWidth: number;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  history: ImageData[];
  setHistory: (history: ImageData[]) => void;
  ctxRef: RefObject<CanvasRenderingContext2D | null>;
  saveCanvasState: () => void;
  engineRef: RefObject<Matter.Engine | null>;
}

interface Point {
  x: number;
  y: number;
}

const PenTool: FC<PenToolProps> = ({
  activeTool,
  activeColor,
  lineWidth,
  canvasRef,
  history,
  setHistory,
  ctxRef,
  engineRef,
}) => {
  const isDrawing = useRef(false);
  const currentStrokePoints = useRef<Point[]>([]);

  const setupCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // 현재 캔버스 내용 백업
    const ctx = canvas.getContext("2d");
    let tempCanvas: HTMLCanvasElement | null = null;
    let tempCtx: CanvasRenderingContext2D | null = null;

    if (ctx && canvas.width > 0 && canvas.height > 0) {
      tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        tempCtx.drawImage(canvas, 0, 0);
      }
    }

    // 캔버스 크기 설정
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const newCtx = canvas.getContext("2d", { alpha: true });
    if (newCtx) {
      newCtx.scale(dpr, dpr);
      newCtx.lineCap = "round";
      newCtx.lineJoin = "round";
      newCtx.strokeStyle = activeColor;
      newCtx.lineWidth = lineWidth;
      newCtx.imageSmoothingEnabled = true;
      newCtx.imageSmoothingQuality = "high";

      // 흰색 배경 제거 - 투명 배경 유지
      // newCtx.fillStyle = "#ffffff";
      // newCtx.fillRect(0, 0, rect.width, rect.height);

      ctxRef.current = newCtx;

      // 이전 내용 복원
      if (tempCtx && tempCanvas) {
        newCtx.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
      }
    }
  }, [canvasRef, activeColor, lineWidth, ctxRef]);

  // resize 이벤트 핸들러
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !ctxRef.current) return;
      setupCanvas();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setupCanvas]);

  // 초기 설정
  useEffect(() => {
    if (!ctxRef.current) {
      setupCanvas();
    }
  }, [setupCanvas]);

  // 색상/굵기 변경 시 업데이트
  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = activeColor;
      ctxRef.current.lineWidth = lineWidth;
    }
  }, [activeColor, lineWidth, ctxRef]);

  const saveCanvasState = useCallback(() => {
    if (!canvasRef.current || !ctxRef.current) return;
    try {
      const imageData = ctxRef.current.getImageData(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      setHistory([...history.slice(-9), imageData]); // 최대 10개 히스토리 유지
    } catch (error) {
      console.warn("Failed to save canvas state:", error);
    }
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

      // 상태 저장
      saveCanvasState();

      const ctx = ctxRef.current;
      const { x, y } = getMousePosition(event);

      ctx.beginPath();
      ctx.moveTo(x, y);
      isDrawing.current = true;

      // 첫 점 추가
      currentStrokePoints.current = [{ x, y }];
    },
    [canvasRef, activeTool, getMousePosition, saveCanvasState, ctxRef]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDrawing.current || !ctxRef.current) return;

      const point = getMousePosition(event);
      currentStrokePoints.current.push(point);

      ctxRef.current.lineTo(point.x, point.y);
      ctxRef.current.stroke();
    },
    [getMousePosition, ctxRef]
  );

  const handleMouseUp = useCallback(() => {
    if (!ctxRef.current || !isDrawing.current) return;

    ctxRef.current.closePath();
    isDrawing.current = false;

    // 물리 엔진에 stroke 추가 (옵션)
    if (currentStrokePoints.current.length > 1) {
      createStroke(currentStrokePoints.current);
    }

    currentStrokePoints.current = [];
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

  // 물리 엔진에 stroke 추가 (null 체크 추가)
  const createStroke = useCallback(
    (points: Point[]) => {
      if (points.length < 2 || !engineRef.current) {
        console.warn(
          "Cannot create stroke: insufficient points or engine not available"
        );
        return;
      }

      try {
        const vertices = points.map((p) => Matter.Vector.create(p.x, p.y));

        // 간단한 중심점 계산
        const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
        const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

        const body = Matter.Bodies.fromVertices(centerX, centerY, [vertices], {
          isStatic: true, // stroke는 정적으로 설정
          render: {
            fillStyle: activeColor,
            strokeStyle: activeColor,
            lineWidth: lineWidth,
          },
          label: `pen-stroke-${Date.now()}`,
          friction: 0.3,
          frictionAir: 0.00001,
          restitution: 0.8,
        });

        Matter.Composite.add(engineRef.current.world, body);
      } catch (error) {
        console.warn("Failed to create physics stroke:", error);
      }
    },
    [engineRef, activeColor, lineWidth]
  );

  return null;
};

export default PenTool;
