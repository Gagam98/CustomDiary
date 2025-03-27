import { useEffect, useRef, useState } from "react";

interface TextBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  isSelected: boolean;
  fontSize: number;
}

interface TextToolProps {
  activeTool: string;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const MIN_WIDTH = 40;
const MIN_HEIGHT = 20;
const MAX_WIDTH = 500;
const MAX_HEIGHT = 300;
const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 48;

const TextTool: React.FC<TextToolProps> = ({ activeTool, canvasRef }) => {
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const isResizing = useRef(false);
  const resizeStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastActiveTool = useRef<string>(activeTool);

  useEffect(() => {
    lastActiveTool.current = activeTool;
    if (activeTool !== "text") {
      setTextBoxes((prev) => prev.map((tb) => ({ ...tb, isSelected: false })));
    }
  }, [activeTool]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const handleClick = (e: MouseEvent) => {
      if (lastActiveTool.current !== "text") return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newId = `text-${Date.now()}`;
      const newTextBox: TextBox = {
        id: newId,
        x,
        y,
        width: 1,
        height: 1,
        text: "",
        isSelected: true,
        fontSize: 16,
      };
      setTextBoxes((prev) => [
        ...prev.map((tb) => ({ ...tb, isSelected: false })),
        newTextBox,
      ]);
      setTimeout(() => {
        const input = document.getElementById(newId) as HTMLTextAreaElement;
        if (input) input.focus();
      }, 0);
    };
    canvas.addEventListener("click", handleClick);
    return () => canvas.removeEventListener("click", handleClick);
  }, [canvasRef]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused =
        document.activeElement &&
        (document.activeElement.tagName === "TEXTAREA" ||
          document.activeElement.tagName === "INPUT");
      if (!isInputFocused && (e.key === "Delete" || e.key === "Backspace")) {
        setTextBoxes((prev) => prev.filter((tb) => !tb.isSelected));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        setTextBoxes((prev) => prev.slice(0, -1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    id: string,
    box: TextBox
  ) => {
    e.stopPropagation();
    if (lastActiveTool.current !== "text") return;
    setDraggingId(id);
    setOffset({ x: e.clientX - box.x, y: e.clientY - box.y });
    setTextBoxes((prev) =>
      prev.map((tb) => ({ ...tb, isSelected: tb.id === id }))
    );
  };

  const handleDoubleClick = (
    e: React.MouseEvent<HTMLTextAreaElement>,
    id: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setTextBoxes((prev) =>
      prev.map((tb) => ({ ...tb, isSelected: tb.id === id }))
    );
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggingId && !isResizing.current) {
      setTextBoxes((prev) =>
        prev.map((tb) =>
          tb.id === draggingId
            ? { ...tb, x: e.clientX - offset.x, y: e.clientY - offset.y }
            : tb
        )
      );
    } else if (isResizing.current && draggingId) {
      const deltaX = e.clientX - resizeStart.current.x;
      const deltaY = e.clientY - resizeStart.current.y;
      setTextBoxes((prev) =>
        prev.map((tb) => {
          if (tb.id !== draggingId) return tb;
          const newWidth = Math.min(
            MAX_WIDTH,
            Math.max(MIN_WIDTH, tb.width + deltaX)
          );
          const newHeight = Math.min(
            MAX_HEIGHT,
            Math.max(MIN_HEIGHT, tb.height + deltaY)
          );
          const scaleFactor = Math.min(
            newHeight / tb.height,
            newWidth / tb.width
          );
          const newFontSize = Math.min(
            MAX_FONT_SIZE,
            Math.max(MIN_FONT_SIZE, tb.fontSize * scaleFactor)
          );
          resizeStart.current = { x: e.clientX, y: e.clientY };
          return {
            ...tb,
            width: newWidth,
            height: newHeight,
            fontSize: newFontSize,
          };
        })
      );
    }
  };

  const handleMouseUp = () => {
    setDraggingId(null);
    isResizing.current = false;
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });

  const measureText = (
    text: string,
    fontSize: number
  ): { width: number; height: number } => {
    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.visibility = "hidden";
    div.style.whiteSpace = "pre-wrap";
    div.style.fontSize = `${fontSize}px`;
    div.style.lineHeight = "1.2";
    div.style.fontFamily = "sans-serif";
    div.style.width = "auto";
    div.style.height = "auto";
    div.innerText = text || " ";
    document.body.appendChild(div);
    const result = { width: div.offsetWidth, height: div.offsetHeight };
    document.body.removeChild(div);
    return result;
  };

  const handleTextChange = (id: string, value: string) => {
    setTextBoxes((prev) =>
      prev.map((tb) => {
        if (tb.id === id) {
          const { width, height } = measureText(value, tb.fontSize);
          return {
            ...tb,
            text: value,
            width: Math.max(MIN_WIDTH, Math.min(width + 8, MAX_WIDTH)),
            height: Math.max(MIN_HEIGHT, Math.min(height + 4, MAX_HEIGHT)),
          };
        }
        return tb;
      })
    );
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full z-50 pointer-events-none">
      {textBoxes.map((box) => (
        <div
          key={box.id}
          className="absolute pointer-events-auto bg-transparent"
          style={{
            top: box.y,
            left: box.x,
            width: box.width,
            height: box.height,
            border: box.isSelected ? "1px solid blue" : "none",
            cursor: box.isSelected ? "move" : "text",
          }}
          onMouseDown={(e) => handleMouseDown(e, box.id, box)}
        >
          <textarea
            id={box.id}
            value={box.text}
            onChange={(e) => handleTextChange(box.id, e.target.value)}
            onDoubleClick={(e) => handleDoubleClick(e, box.id)}
            className="w-full h-full resize-none outline-none bg-transparent"
            style={{
              cursor: "inherit",
              fontSize: box.fontSize,
              overflow: "hidden",
            }}
          />
          {box.isSelected && (
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                isResizing.current = true;
                setDraggingId(box.id);
                resizeStart.current = { x: e.clientX, y: e.clientY };
              }}
              className="absolute w-3 h-3 bg-blue-500 bottom-0 right-0 cursor-se-resize z-10"
              style={{ transform: "translate(50%, 50%)" }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default TextTool;
