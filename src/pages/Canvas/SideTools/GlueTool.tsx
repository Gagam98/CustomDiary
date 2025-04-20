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

      // 클릭 위치의 여유 범위를 더 작게 조정
      const padding = 5;

      return sortedBodies.find((body) => {
        // 고정된 벽은 제외
        if (body.isStatic && !fixedBodies.has(body.id)) return false;

        const bounds = body.bounds;
        const vertices = body.vertices;

        // 객체 타입에 따라 다른 충돌 감지 로직 적용
        if (body.circleRadius) {
          // 원형 객체의 경우
          const center = body.position;
          const distance = Math.sqrt(
            Math.pow(mousePosition.x - center.x, 2) +
              Math.pow(mousePosition.y - center.y, 2)
          );
          return distance <= body.circleRadius + padding;
        } else {
          // 다각형 객체의 경우 (사각형, 삼각형 등)
          // 먼저 경계 상자로 대략적인 검사
          if (
            mousePosition.x >= bounds.min.x - padding &&
            mousePosition.x <= bounds.max.x + padding &&
            mousePosition.y >= bounds.min.y - padding &&
            mousePosition.y <= bounds.max.y + padding
          ) {
            // Ray Casting 알고리즘을 사용한 정확한 다각형 충돌 검사
            let inside = false;
            for (
              let i = 0, j = vertices.length - 1;
              i < vertices.length;
              j = i++
            ) {
              const vi = vertices[i];
              const vj = vertices[j];

              if (
                vi.y > mousePosition.y !== vj.y > mousePosition.y &&
                mousePosition.x <
                  ((vj.x - vi.x) * (mousePosition.y - vi.y)) / (vj.y - vi.y) +
                    vi.x
              ) {
                inside = !inside;
              }
            }
            return inside;
          }
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
        // 이전에 선택된 객체가 있다면 선택 해제
        if (selectedBody) {
          Matter.Body.setStatic(selectedBody, false);
        }

        selectedBody = clickedBody;
        isDragging = true;
        Matter.Body.setStatic(clickedBody, true);

        // z-index 조정: 펜 stroke는 항상 최상단에 유지
        const world = engineRef.current!.world;
        const bodies = Matter.Composite.allBodies(world);

        // 펜 stroke를 제외한 나머지 bodies만 정렬
        const nonPenBodies = bodies.filter(
          (body) => !body.label?.startsWith("pen-stroke")
        );
        const penBodies = bodies.filter((body) =>
          body.label?.startsWith("pen-stroke")
        );

        // 선택된 body를 nonPenBodies의 맨 뒤로 이동
        Matter.Composite.clear(world, false);
        nonPenBodies.forEach((body) => {
          if (body.id === clickedBody.id) {
            Matter.Composite.add(world, body);
          }
        });
        // 나머지 nonPenBodies 추가
        nonPenBodies.forEach((body) => {
          if (body.id !== clickedBody.id) {
            Matter.Composite.add(world, body);
          }
        });
        // 펜 stroke를 맨 마지막에 추가하여 항상 최상단에 유지
        penBodies.forEach((body) => {
          Matter.Composite.add(world, body);
        });

        setGlueModeActive(true);

        if (canvasRef.current) {
          canvasRef.current.style.cursor = "grabbing";
        }

        e.stopPropagation();
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

        // 이벤트 전파 중단
        e.stopPropagation();
        e.preventDefault();
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
