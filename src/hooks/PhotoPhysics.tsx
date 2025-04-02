import { useEffect, useRef } from "react";
import Matter from "matter-js";

interface Photo {
  id: string;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PhotoPhysicsProps {
  photos: Photo[];
}

const PhotoPhysics: React.FC<PhotoPhysicsProps> = ({ photos }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const bodiesRef = useRef<{ [key: string]: Matter.Body }>({});

  useEffect(() => {
    if (!canvasRef.current) return;

    // Matter.js 엔진 초기화
    const engine = Matter.Engine.create();
    engineRef.current = engine;

    // 중력 설정
    engine.world.gravity.y = 4;

    // 벽 생성
    const wallOptions = {
      isStatic: true,
      render: { visible: false },
      restitution: 0.5,
      friction: 0.2,
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

    // 현재 사진 ID 목록
    const currentIds = new Set(photos.map((p) => p.id));

    // 제거된 사진 처리
    Object.keys(bodiesRef.current).forEach((id) => {
      if (!currentIds.has(id)) {
        Matter.World.remove(engineRef.current!.world, bodiesRef.current[id]);
        delete bodiesRef.current[id];
      }
    });

    // 새로운 사진 추가
    photos.forEach((photo) => {
      if (!bodiesRef.current[photo.id]) {
        const body = Matter.Bodies.rectangle(
          photo.x,
          photo.y,
          photo.width,
          photo.height,
          {
            restitution: 0.8,
            friction: 0.1,
            density: 0.002,
            frictionAir: 0.001,
            chamfer: { radius: 5 },
          }
        );

        bodiesRef.current[photo.id] = body;
        Matter.World.add(engineRef.current!.world, body);
      }
    });

    // 렌더링 루프
    let animationFrameId: number;
    const render = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      photos.forEach((photo) => {
        const body = bodiesRef.current[photo.id];
        if (!body) return;

        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);
        ctx.drawImage(
          photo.image,
          -photo.width / 2,
          -photo.height / 2,
          photo.width,
          photo.height
        );
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [photos]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute top-0 left-0 w-full h-full z-10"
    />
  );
};

export default PhotoPhysics;
