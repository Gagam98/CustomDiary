import { useEffect, useRef } from "react";
import { Engine, Render, World, Bodies, Body } from "matter-js";
import { FC } from "react";

interface StickerPhysicsProps {
  shapes: any[];
}

const StickerPhysics: FC<StickerPhysicsProps> = ({ shapes }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const bodiesRef = useRef<{ [key: string]: Body }>({});

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = Engine.create({
      gravity: { x: 0, y: 1.5 }, // 중력 값 증가
    });
    engineRef.current = engine;

    const render = Render.create({
      element: canvasRef.current,
      engine: engine,
      options: {
        width: canvasRef.current.clientWidth,
        height: canvasRef.current.clientHeight,
        wireframes: false,
        background: "transparent",
      },
    }) as Matter.Render & { options: Required<Matter.IRendererOptions> };
    renderRef.current = render;

    const wallOptions = { isStatic: true, render: { visible: false } };
    const thickness = 50;

    const ground = Bodies.rectangle(
      render.options.width / 2,
      render.options.height + thickness / 2,
      render.options.width + thickness * 2,
      thickness,
      wallOptions
    );

    const leftWall = Bodies.rectangle(
      -thickness / 2,
      render.options.height / 2,
      thickness,
      render.options.height + thickness * 2,
      wallOptions
    );

    const rightWall = Bodies.rectangle(
      render.options.width + thickness / 2,
      render.options.height / 2,
      thickness,
      render.options.height + thickness * 2,
      wallOptions
    );

    World.add(engine.world, [ground, leftWall, rightWall]);

    Engine.run(engine);
    Render.run(render);

    const handleResize = () => {
      if (renderRef.current && canvasRef.current) {
        renderRef.current.options.width = canvasRef.current.clientWidth;
        renderRef.current.options.height = canvasRef.current.clientHeight;
        Render.setPixelRatio(renderRef.current, window.devicePixelRatio);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      Render.stop(render);
      Engine.clear(engine);
      window.removeEventListener("resize", handleResize);
      if (render.canvas) render.canvas.remove();
      if (render.textures) render.textures = {};
    };
  }, []);

  useEffect(() => {
    if (!engineRef.current) return;
    const engine = engineRef.current;

    shapes.forEach((shape) => {
      if (!bodiesRef.current[shape.id]) {
        let body;
        const options = {
          restitution: 0.7,
          friction: 0.02,
          render: {
            fillStyle: shape.color,
            strokeStyle: "black",
            lineWidth: 1,
          },
        };

        switch (shape.shape) {
          case "circle":
            body = Bodies.circle(shape.x, shape.y, shape.size / 2, options);
            break;
          case "square":
            body = Bodies.rectangle(
              shape.x,
              shape.y,
              shape.size,
              shape.size,
              options
            );
            break;
          case "triangle":
            body = Bodies.polygon(shape.x, shape.y, 3, shape.size / 2, options);
            break;
          case "heart":
            body = Bodies.circle(shape.x, shape.y, shape.size / 2, options);
            break;
          case "star":
            body = Bodies.polygon(shape.x, shape.y, 5, shape.size / 2, options);
            break;
          default:
            body = Bodies.circle(shape.x, shape.y, shape.size / 2, options);
        }

        Body.setAngle(body, Math.random() * Math.PI * 2);
        Body.setVelocity(body, { x: 0, y: 3 }); // 초기에 아래로 떨어지는 속도 부여
        Body.applyForce(body, body.position, {
          x: (Math.random() - 0.5) * 0.005,
          y: 0.1, // 더 강한 아래 방향 힘 적용
        });

        bodiesRef.current[shape.id] = body;
        World.add(engine.world, body);
      }
    });

    const currentIds = shapes.map((s) => s.id);
    Object.keys(bodiesRef.current).forEach((id) => {
      if (!currentIds.includes(id)) {
        World.remove(engine.world, bodiesRef.current[id]);
        delete bodiesRef.current[id];
      }
    });
  }, [shapes]);

  return (
    <div ref={canvasRef} className="absolute inset-0 pointer-events-none"></div>
  );
};

export default StickerPhysics;
