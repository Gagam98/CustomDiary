import { useEffect, useRef } from "react";
import Matter from "matter-js";

interface Sticker {
  id: string;
  shape: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface StickerPhysicsProps {
  shapes: Sticker[];
}

const StickerPhysics: React.FC<StickerPhysicsProps> = ({ shapes }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const bodiesRef = useRef<{ [key: string]: Matter.Body }>({});

  useEffect(() => {
    if (!canvasRef.current) return;

    // Matter.js 엔진 초기화
    const engine = Matter.Engine.create();
    engineRef.current = engine;

    // 중력 설정 강화
    engine.world.gravity.y = 1;

    // 벽 생성 - 위치 및 크기 조정
    const wallOptions = {
      isStatic: true,
      render: { visible: false },
      restitution: 0.6, // 탄성 추가
    };

    const walls = [
      // 바닥
      Matter.Bodies.rectangle(
        window.innerWidth / 2,
        window.innerHeight,
        window.innerWidth,
        60,
        wallOptions
      ),
      // 왼쪽 벽
      Matter.Bodies.rectangle(
        0,
        window.innerHeight / 2,
        60,
        window.innerHeight * 2,
        wallOptions
      ),
      // 오른쪽 벽
      Matter.Bodies.rectangle(
        window.innerWidth,
        window.innerHeight / 2,
        60,
        window.innerHeight * 2,
        wallOptions
      ),
    ];

    Matter.World.add(engine.world, walls);

    // 물리 엔진 실행
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    return () => {
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
    };
  }, []);

  useEffect(() => {
    if (!engineRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 새로운 스티커 추가 및 제거된 스티커 처리
    const currentIds = new Set(shapes.map((s) => s.id));

    // 제거된 스티커 처리
    Object.keys(bodiesRef.current).forEach((id) => {
      if (!currentIds.has(id)) {
        Matter.World.remove(engineRef.current!.world, bodiesRef.current[id]);
        delete bodiesRef.current[id];
      }
    });

    // 새로운 스티커 추가
    shapes.forEach((sticker) => {
      if (!bodiesRef.current[sticker.id]) {
        let body;
        const options = {
          restitution: 0.6,
          friction: 0.1,
          density: 0.001,
        };

        switch (sticker.shape) {
          case "circle":
            body = Matter.Bodies.circle(
              sticker.x,
              sticker.y,
              sticker.size / 2,
              options
            );
            break;
          case "square":
            body = Matter.Bodies.rectangle(
              sticker.x,
              sticker.y,
              sticker.size,
              sticker.size,
              options
            );
            break;
          default:
            body = Matter.Bodies.circle(
              sticker.x,
              sticker.y,
              sticker.size / 2,
              options
            );
        }

        bodiesRef.current[sticker.id] = body;
        Matter.World.add(engineRef.current!.world, body);
      }
    });

    // 렌더링 루프
    let animationFrameId: number;
    const render = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      shapes.forEach((sticker) => {
        const body = bodiesRef.current[sticker.id];
        if (!body) return;

        ctx.save();
        ctx.fillStyle = sticker.color;
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);

        const s = sticker.size;

        switch (sticker.shape) {
          case "circle":
            ctx.beginPath();
            ctx.arc(0, 0, s / 2, 0, 2 * Math.PI);
            ctx.fill();
            break;

          case "square":
            ctx.fillRect(-s / 2, -s / 2, s, s);
            break;

          case "triangle":
            ctx.beginPath();
            ctx.moveTo(0, -s / 2);
            ctx.lineTo(s / 2, s / 2);
            ctx.lineTo(-s / 2, s / 2);
            ctx.closePath();
            ctx.fill();
            break;

          case "heart":
            ctx.beginPath();
            ctx.moveTo(0, -s / 4);
            ctx.bezierCurveTo(s / 2, -s / 2, s / 2, s / 4, 0, s / 2);
            ctx.bezierCurveTo(-s / 2, s / 4, -s / 2, -s / 2, 0, -s / 4);
            ctx.closePath();
            ctx.fill();
            break;

          case "star": {
            const spikes = 5;
            const outerRadius = s / 2;
            const innerRadius = s / 4;
            let rot = (Math.PI / 2) * 3;
            let x = 0;
            let y = 0;
            const step = Math.PI / spikes;

            ctx.beginPath();
            ctx.moveTo(0, -outerRadius);
            for (let i = 0; i < spikes; i++) {
              x = Math.cos(rot) * outerRadius;
              y = Math.sin(rot) * outerRadius;
              ctx.lineTo(x, y);
              rot += step;

              x = Math.cos(rot) * innerRadius;
              y = Math.sin(rot) * innerRadius;
              ctx.lineTo(x, y);
              rot += step;
            }
            ctx.lineTo(0, -outerRadius);
            ctx.closePath();
            ctx.fill();
            break;
          }

          default:
            break;
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [shapes]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute top-0 left-0 w-full h-full z-10"
    />
  );
};

export default StickerPhysics;
