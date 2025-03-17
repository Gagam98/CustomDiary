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
type ToolType = "pen" | "eraser" | "square" | "circle" | "image" | "text";

// CanvasContext 타입 정의
interface CanvasContextType {
  activeTool: ToolType;
  activeStickTool: string;
  activeColor: string;
  lineWidth: number;
  eraserSize: number;
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  setActiveTool: (tool: ToolType) => void;
  setActiveStickTool: (tool: string) => void;
  setActiveColor: (color: string) => void;
  setLineWidth: (width: number) => void;
  setEraserSize: (size: number) => void;
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

  // 캔버스 참조 (MutableRefObject로 명확하게 지정)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Context 값 설정
  const value: CanvasContextType = {
    activeTool,
    activeStickTool,
    activeColor,
    lineWidth,
    eraserSize,
    canvasRef,
    setActiveTool,
    setActiveStickTool,
    setActiveColor,
    setLineWidth,
    setEraserSize,
  };

  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
};

export default CanvasContext;
