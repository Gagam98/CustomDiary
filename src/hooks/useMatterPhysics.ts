import { useEffect, useRef } from "react";
import Matter from "matter-js";

const WALL_THICKNESS = 100;
const DROP_HEIGHT = -300; // 요소가 떨어지기 시작하는 높이를 더 위로 설정

export function useMatterPhysics(
  containerRef: React.RefObject<HTMLDivElement>
) {
  const helperRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef(Matter.Engine.create({ gravity: { x: 0, y: 0.5 } }));
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const matterBodies = useRef<Record<number, Matter.Body>>({});
  const domBodies = useRef<NodeListOf<HTMLDivElement> | null>(null);
  const groundRef = useRef<Matter.Body | null>(null);
  const leftWallRef = useRef<Matter.Body | null>(null);
  const rightWallRef = useRef<Matter.Body | null>(null);

  useEffect(() => {
    if (!containerRef.current || !helperRef.current) return;

    const container = containerRef.current;
    const helper = helperRef.current;
    const localEngine = engineRef.current; // ✅ 로컬 변수로 저장
    const isDebugMode = false;

    renderRef.current = Matter.Render.create({
      element: helper,
      engine: localEngine, // ✅ 로컬 변수 사용
      options: {
        width: container.offsetWidth,
        height: container.offsetHeight,
        background: "transparent",
        wireframes: isDebugMode,
        showCollisions: isDebugMode,
        showVelocity: isDebugMode,
      },
    });

    // DOM 요소 선택
    domBodies.current = document.querySelectorAll(".menu__item");

    // 경계(벽과 바닥) 생성
    function createBounds() {
      groundRef.current = Matter.Bodies.rectangle(
        container.offsetWidth / 2,
        container.offsetHeight + WALL_THICKNESS / 2,
        container.offsetWidth * 2,
        WALL_THICKNESS,
        { isStatic: true, friction: 0.3, label: "ground" }
      );

      leftWallRef.current = Matter.Bodies.rectangle(
        0 - WALL_THICKNESS / 2,
        container.offsetHeight / 2,
        WALL_THICKNESS,
        container.offsetHeight * 5,
        { isStatic: true, friction: 0.1, label: "leftWall" }
      );

      rightWallRef.current = Matter.Bodies.rectangle(
        container.offsetWidth + WALL_THICKNESS / 2,
        container.offsetHeight / 2,
        WALL_THICKNESS,
        container.offsetHeight * 5,
        { isStatic: true, friction: 0.1, label: "rightWall" }
      );

      Matter.Composite.add(localEngine.world, [
        leftWallRef.current,
        rightWallRef.current,
        groundRef.current,
      ]);
    }

    // Matter.js 바디 생성
    function createMatterBodies() {
      if (!domBodies.current) return;

      domBodies.current.forEach((domBody, index) => {
        const rect = domBody.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const bodyId = Date.now() + index;
        domBody.id = String(bodyId);

        const matterBody = Matter.Bodies.rectangle(
          startX,
          DROP_HEIGHT,
          domBody.offsetWidth,
          domBody.offsetHeight,
          {
            chamfer: { radius: 4 },
            restitution: 0.5,
            density: 0.001 * (index + 1),
            angle: Math.random() * Math.PI * 0.2 - Math.PI * 0.1,
            friction: 0.05,
            frictionAir: 0.02 + Math.random() * 0.01,
            label: `body-${index}`,
          }
        );

        matterBodies.current[bodyId] = matterBody;

        setTimeout(() => {
          Matter.World.add(localEngine.world, matterBody);
        }, 100 * index);
      });
    }

    // DOM 요소 위치 업데이트
    function updateElementPositions() {
      if (!domBodies.current) return;

      domBodies.current.forEach((domBody) => {
        const bodyId = Number(domBody.id);
        const matterBody = matterBodies.current[bodyId];

        if (matterBody) {
          domBody.style.transform = `translate(${
            matterBody.position.x - domBody.offsetWidth / 2
          }px, ${matterBody.position.y - domBody.offsetHeight / 2}px) rotate(${
            matterBody.angle
          }rad)`;
          domBody.style.zIndex = `${Math.floor(matterBody.position.y)}`;
        }
      });

      requestAnimationFrame(updateElementPositions);
    }

    // 창 크기 변경 처리
    function handleResize() {
      if (!renderRef.current || !containerRef.current) return;

      const container = containerRef.current;
      renderRef.current.canvas.width = container.offsetWidth;
      renderRef.current.canvas.height = container.offsetHeight;
      Matter.Render.setPixelRatio(renderRef.current, window.devicePixelRatio);

      if (groundRef.current) {
        Matter.Body.setPosition(
          groundRef.current,
          Matter.Vector.create(
            container.offsetWidth / 2,
            container.offsetHeight + WALL_THICKNESS / 2
          )
        );
      }
      if (leftWallRef.current) {
        Matter.Body.setPosition(
          leftWallRef.current,
          Matter.Vector.create(
            0 - WALL_THICKNESS / 2,
            container.offsetHeight / 2
          )
        );
      }
      if (rightWallRef.current) {
        Matter.Body.setPosition(
          rightWallRef.current,
          Matter.Vector.create(
            container.offsetWidth + WALL_THICKNESS / 2,
            container.offsetHeight / 2
          )
        );
      }
    }

    // 마우스 상호작용 추가
    function addMouseInteraction() {
      if (!renderRef.current?.canvas) return;

      const mouse = Matter.Mouse.create(renderRef.current.canvas);
      const mouseConstraint = Matter.MouseConstraint.create(localEngine, {
        mouse,
        constraint: { stiffness: 0.2, render: { visible: false } },
      });

      Matter.World.add(localEngine.world, mouseConstraint);

      Matter.Events.on(mouseConstraint, "mousedown", (event) => {
        const mousePosition = event.mouse.position;
        const bodiesAtPoint = Matter.Query.point(
          Object.values(matterBodies.current),
          mousePosition
        );

        if (bodiesAtPoint.length > 0) {
          Matter.Body.applyForce(bodiesAtPoint[0], mousePosition, {
            x: 0,
            y: -0.05,
          });
        }
      });
    }

    // 초기화 및 실행
    createBounds();
    createMatterBodies();

    if (renderRef.current) {
      Matter.Render.run(renderRef.current);
      renderRef.current.canvas.style.display = isDebugMode ? "block" : "none";
    }

    runnerRef.current = Matter.Runner.create();
    Matter.Runner.run(runnerRef.current, localEngine);
    requestAnimationFrame(updateElementPositions);

    addMouseInteraction();
    window.addEventListener("resize", handleResize);

    // 클린업
    return () => {
      if (renderRef.current) Matter.Render.stop(renderRef.current);
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current);

      Matter.World.clear(localEngine.world, false);
      Matter.Engine.clear(localEngine);

      window.removeEventListener("resize", handleResize);
    };
  }, [containerRef]);

  return { helperRef };
}
