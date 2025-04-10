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
    const fixedBodies = new Set<number>();

    const getClickedBody = (mousePosition: { x: number; y: number }) => {
      const bodies = Matter.Composite.allBodies(engineRef.current!.world);
      // z-index 순서로 정렬 (나중에 추가된 객체가 위에 있도록)
      const sortedBodies = bodies.slice().reverse();

      // 클릭 위치의 여유 범위 설정
      const padding = 10;

      return sortedBodies.find((body) => {
        // 고정된 벽은 제외
        if (body.isStatic && !fixedBodies.has(body.id)) return false;

        const bounds = body.bounds;
        const vertices = body.vertices;

        // 먼저 경계 상자로 대략적인 검사
        if (
          mousePosition.x >= bounds.min.x - padding &&
          mousePosition.x <= bounds.max.x + padding &&
          mousePosition.y >= bounds.min.y - padding &&
          mousePosition.y <= bounds.max.y + padding
        ) {
          // 더 정확한 다각형 충돌 검사
          return Matter.Vertices.contains(vertices, mousePosition);
        }
        return false;
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mousePosition = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      const clickedBody = getClickedBody(mousePosition);

      if (clickedBody && !fixedBodies.has(clickedBody.id)) {
        // 이미 선택된 객체가 있다면 선택 해제
        if (selectedBody) {
          Matter.Body.setStatic(selectedBody, false);
        }

        selectedBody = clickedBody;
        isDragging = true;
        Matter.Body.setStatic(clickedBody, true);
        setGlueModeActive(true);

        if (canvasRef.current) {
          canvasRef.current.style.cursor = "grabbing";
        }
      }
    };

    const handleDoubleClick = (e: MouseEvent) => {
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
        if (fixedBodies.has(clickedBody.id)) {
          // 고정 해제
          fixedBodies.delete(clickedBody.id);
          Matter.Body.setStatic(clickedBody, false);
        } else {
          // 고정
          fixedBodies.add(clickedBody.id);
          Matter.Body.setStatic(clickedBody, true);
        }

        // 현재 선택된 객체가 고정된 경우 드래그 상태 초기화
        if (selectedBody && fixedBodies.has(selectedBody.id)) {
          selectedBody = null;
          isDragging = false;
          setGlueModeActive(false);
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !selectedBody || fixedBodies.has(selectedBody.id))
        return;

      Matter.Body.setPosition(selectedBody, {
        x: e.clientX,
        y: e.clientY,
      });
    };

    const handleMouseUp = () => {
      if (selectedBody && !fixedBodies.has(selectedBody.id)) {
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
    canvas.addEventListener("dblclick", handleDoubleClick);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("dblclick", handleDoubleClick);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isActive, engineRef, canvasRef, setGlueModeActive]);

  return null;
};

export default GlueTool;
