import { FC, useEffect } from "react";
import Matter from "matter-js";

interface GlueToolProps {
  isActive: boolean;
  engineRef: React.RefObject<Matter.Engine | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  setGlueModeActive: (active: boolean) => void;
}

const GlueTool: FC<GlueToolProps> = ({
  isActive,
  engineRef,
  canvasRef,
  setGlueModeActive,
}) => {
  useEffect(() => {
    if (!isActive || !engineRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    let selectedBody: Matter.Body | null = null;
    let isDragging = false;

    const handleMouseDown = (e: MouseEvent) => {
      const mousePosition = {
        x: e.clientX,
        y: e.clientY,
      };

      const bodies = Matter.Composite.allBodies(engineRef.current!.world);
      const clickedBody = bodies.find((body) => {
        const bounds = body.bounds;
        const padding = 10;
        return (
          mousePosition.x >= bounds.min.x - padding &&
          mousePosition.x <= bounds.max.x + padding &&
          mousePosition.y >= bounds.min.y - padding &&
          mousePosition.y <= bounds.max.y + padding
        );
      });

      if (clickedBody) {
        selectedBody = clickedBody;
        isDragging = true;
        Matter.Body.setStatic(clickedBody, true);
        setGlueModeActive(true);

        if (canvasRef.current) {
          canvasRef.current.style.cursor = "grabbing";
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !selectedBody) return;

      Matter.Body.setPosition(selectedBody, {
        x: e.clientX,
        y: e.clientY,
      });
    };

    const handleMouseUp = () => {
      if (selectedBody) {
        Matter.Body.setStatic(selectedBody, false);
        selectedBody = null;
        isDragging = false;
        setGlueModeActive(false);

        if (canvasRef.current) {
          canvasRef.current.style.cursor = "grab";
        }
      }
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isActive, engineRef, canvasRef, setGlueModeActive]);

  return null;
};

export default GlueTool;
