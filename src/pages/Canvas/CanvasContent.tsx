import { type FC, useEffect } from "react";

interface CanvasProps {
  handleUndo: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const CanvasContent: FC<CanvasProps> = ({ handleUndo, canvasRef }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        handleUndo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const container = canvas.parentElement;
      if (container) {
        const { width, height } = container.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [canvasRef]);

  return null; // Canvas is now handled directly in the main component
};

export default CanvasContent;
