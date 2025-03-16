import { useEffect, useRef, CSSProperties } from "react";
import { Engine, Render, World, Bodies, Body, Runner } from "matter-js";

interface StickerPhysicsProps {
  shapes: Array<{
    id: string;
    shape: string;
    x: number;
    y: number;
    size: number;
    color: string;
  }>;
}

const StickerPhysics: React.FC<StickerPhysicsProps> = ({ shapes }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const bodiesRef = useRef<{ [key: string]: Body }>({});

  useEffect(() => {
    if (!canvasRef.current) return;

    // 🛠 물리 엔진 생성 및 중력 적용
    const engine = Engine.create({ gravity: { x: 0, y: 1 } });
    engineRef.current = engine;

    // 🛠 Runner 생성 및 실행
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    // 🛠 Matter.js 렌더러 생성
    const render = Render.create({
      element: canvasRef.current,
      engine: engine,
      options: {
        width: canvasRef.current.clientWidth,
        height: canvasRef.current.clientHeight,
        wireframes: false,
        background: "transparent",
      },
    });
    renderRef.current = render;
    Render.run(render);

    // 🛠 바닥 추가 (Canvas 최하단에 위치)
    const ground = Bodies.rectangle(
      canvasRef.current.clientWidth / 2,
      canvasRef.current.clientHeight, // ✅ 바닥 위치를 정확하게 조정
      canvasRef.current.clientWidth,
      10, // 바닥 두께를 줄여 자연스럽게 충돌하도록 조정
      { isStatic: true }
    );
    World.add(engine.world, [ground]);

    return () => {
      Render.stop(render);
      World.clear(engine.world, false);
      Engine.clear(engine);
      Runner.stop(runner);
    };
  }, []);

  useEffect(() => {
    if (!engineRef.current) return;
    const engine = engineRef.current;

    shapes.forEach((shape) => {
      if (bodiesRef.current[shape.id]) {
        // 🛠 기존 스티커가 있으면 제거 후 재추가
        World.remove(engine.world, bodiesRef.current[shape.id]);
      }

      // 🛠 중력 적용된 스티커 생성
      const body = Bodies.circle(shape.x, shape.y, shape.size / 2, {
        restitution: 0.8,
        friction: 0.2,
      });

      World.add(engine.world, body);
      bodiesRef.current[shape.id] = body;
    });
  }, [shapes]);

  const style: CSSProperties = {
    width: "100%",
    height: "100%",
    position: "absolute",
  };

  return <div ref={canvasRef} style={style} />;
};

export default StickerPhysics;
