import {
  createContext,
  useState,
  useRef,
  useContext,
  ReactNode,
  FC,
  MutableRefObject,
} from "react";

// 사용할 툴의 타입 정의
export type ToolType =
  | "pen"
  | "eraser"
  | "square"
  | "circle"
  | "image"
  | "text";

// CanvasContext 타입 정의
interface CanvasContextType {
  activeTool: ToolType;
  activeStickTool: string;
  activeColor: string;
  lineWidth: number;
  eraserSize: number;
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  history: ImageData[];
  setHistory: (history: ImageData[]) => void;
  setActiveTool: (tool: ToolType) => void;
  setActiveStickTool: (tool: string) => void;
  setActiveColor: (color: string) => void;
  setLineWidth: (width: number) => void;
  setEraserSize: (size: number) => void;
  saveCanvasState: () => void;
  handleUndo: () => void;
}

// Context 생성 (초기 상태는 undefined)
const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

// Context를 사용하기 위한 커스텀 훅
export const useCanvas = (): CanvasContextType => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
};

// CanvasProvider의 props 타입
interface CanvasProviderProps {
  children: ReactNode;
}

// Canvas Provider 컴포넌트
export const CanvasProvider: FC<CanvasProviderProps> = ({ children }) => {
  // 상태 관리
  const [activeTool, setActiveTool] = useState<ToolType>("pen");
  const [activeStickTool, setActiveStickTool] = useState<string>("");
  const [activeColor, setActiveColor] = useState<string>("#000000");
  const [lineWidth, setLineWidth] = useState<number>(5);
  const [eraserSize, setEraserSize] = useState<number>(10);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);

  // 캔버스 상태 저장
  const saveCanvasState = () => {
    if (!canvasRef.current || !canvasRef.current.getContext) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    setHistory([...history, imageData]);
  };

  // CMD + Z 또는 CTRL + Z 입력 시 Undo 실행
  const handleUndo = () => {
    if (!canvasRef.current || history.length === 0) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const prevState = history.pop();
    setHistory([...history]);

    if (prevState) {
      ctx.putImageData(prevState, 0, 0);
    }
  };

  return (
    <CanvasContext.Provider
      value={{
        activeTool,
        activeStickTool,
        activeColor,
        lineWidth,
        eraserSize,
        canvasRef,
        history,
        setHistory,
        setActiveTool,
        setActiveStickTool,
        setActiveColor,
        setLineWidth,
        setEraserSize,
        saveCanvasState,
        handleUndo,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export default CanvasContext;
