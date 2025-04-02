import { useEffect, useRef, forwardRef, ForwardedRef } from "react";
import Matter from "matter-js";
import { Sticker, Photo } from "../pages/Canvas/TopToolbar";

interface PhysicsProps {
  photos: Photo[];
  stickers: Sticker[];
}

const Physics = forwardRef<HTMLCanvasElement, PhysicsProps>(
  ({ photos, stickers }, ref: ForwardedRef<HTMLCanvasElement>) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const bodiesRef = useRef<{ [key: string]: Matter.Body }>({});
    const gridCanvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      if (typeof ref === "function") {
        ref(canvasRef.current);
      } else if (ref) {
        ref.current = canvasRef.current;
      }
    }, [ref]);

    useEffect(() => {
      if (!canvasRef.current) return;

      const engine = Matter.Engine.create({
        enableSleeping: false,
        constraintIterations: 4,
        positionIterations: 8,
        velocityIterations: 8,
      });
      engineRef.current = engine;

      engine.world.gravity.y = 2;

      const Categories = {
        WALL: 0x0001,
        PHOTO: 0x0002,
        STICKER: 0x0004,
      };

      const wallOptions = {
        isStatic: true,
        render: { visible: false },
        restitution: 0.8,
        friction: 0.2,
        collisionFilter: {
          category: Categories.WALL,
          mask: Categories.PHOTO | Categories.STICKER,
        },
      };

      const walls = [
        Matter.Bodies.rectangle(
          window.innerWidth / 2,
          window.innerHeight,
          window.innerWidth,
          60,
          wallOptions
        ),
        Matter.Bodies.rectangle(
          0,
          window.innerHeight / 2,
          60,
          window.innerHeight * 2,
          wallOptions
        ),
        Matter.Bodies.rectangle(
          window.innerWidth,
          window.innerHeight / 2,
          60,
          window.innerHeight * 2,
          wallOptions
        ),
      ];

      Matter.World.add(engine.world, walls);

      Matter.Events.on(engine, "collisionStart", (event) => {
        event.pairs.forEach((pair) => {
          const bodyA = pair.bodyA;
          const bodyB = pair.bodyB;

          const force = 0.005;
          const velocityMultiplier = 1 + force;

          Matter.Body.setVelocity(bodyA, {
            x: bodyA.velocity.x * velocityMultiplier,
            y: bodyA.velocity.y * velocityMultiplier,
          });
          Matter.Body.setVelocity(bodyB, {
            x: bodyB.velocity.x * velocityMultiplier,
            y: bodyB.velocity.y * velocityMultiplier,
          });

          Matter.Body.setAngularVelocity(
            bodyA,
            bodyA.angularVelocity * velocityMultiplier
          );
          Matter.Body.setAngularVelocity(
            bodyB,
            bodyB.angularVelocity * velocityMultiplier
          );
        });
      });

      const runner = Matter.Runner.create();
      Matter.Runner.run(runner, engine);

      return () => {
        Matter.Events.off(engine, "collisionStart");
        Matter.Runner.stop(runner);
        Matter.Engine.clear(engine);
      };
    }, []);

    useEffect(() => {
      if (!engineRef.current || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const currentIds = new Set([
        ...photos.map((p) => `photo-${p.id}`),
        ...stickers.map((s) => `sticker-${s.id}`),
      ]);

      Object.keys(bodiesRef.current).forEach((id) => {
        if (!currentIds.has(id)) {
          Matter.World.remove(engineRef.current!.world, bodiesRef.current[id]);
          delete bodiesRef.current[id];
        }
      });

      photos.forEach((photo) => {
        const bodyId = `photo-${photo.id}`;
        if (!bodiesRef.current[bodyId]) {
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
              collisionFilter: {
                category: 0x0002,
                mask: 0x0001 | 0x0002 | 0x0004,
                group: 0,
              },
            }
          );

          Matter.Body.setVelocity(body, {
            x: (Math.random() - 0.5) * 2,
            y: Math.random() * -2,
          });

          bodiesRef.current[bodyId] = body;
          Matter.World.add(engineRef.current!.world, body);
        }
      });

      stickers.forEach((sticker) => {
        const bodyId = `sticker-${sticker.id}`;
        if (!bodiesRef.current[bodyId]) {
          const options = {
            restitution: 0.8,
            friction: 0.1,
            density: 0.001,
            frictionAir: 0.001,
            collisionFilter: {
              category: 0x0004,
              mask: 0x0001 | 0x0002 | 0x0004,
              group: 0,
            },
          };

          let body;
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
            case "triangle": {
              const vertices = [
                { x: 0, y: -sticker.size / 2 },
                { x: sticker.size / 2, y: sticker.size / 2 },
                { x: -sticker.size / 2, y: sticker.size / 2 },
              ];
              body = Matter.Bodies.fromVertices(
                sticker.x,
                sticker.y,
                [vertices],
                options
              );
              break;
            }
            default:
              body = Matter.Bodies.circle(
                sticker.x,
                sticker.y,
                sticker.size / 2,
                options
              );
          }

          Matter.Body.setVelocity(body, {
            x: (Math.random() - 0.5) * 2,
            y: Math.random() * -2,
          });

          bodiesRef.current[bodyId] = body;
          Matter.World.add(engineRef.current!.world, body);
        }
      });

      let animationFrameId: number;
      const render = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        photos.forEach((photo) => {
          const body = bodiesRef.current[`photo-${photo.id}`];
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

        stickers.forEach((sticker) => {
          const body = bodiesRef.current[`sticker-${sticker.id}`];
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
            case "star":
              renderStar(ctx, 0, 0, 5, s / 2, s / 4);
              break;
          }
          ctx.restore();
        });

        animationFrameId = requestAnimationFrame(render);
      };

      render();
      return () => cancelAnimationFrame(animationFrameId);
    }, [photos, stickers]);

    useEffect(() => {
      if (!gridCanvasRef.current) return;
      const canvas = gridCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 캔버스 크기 설정
      const container = canvas.parentElement;
      if (!container) return;
      const { width, height } = container.getBoundingClientRect();

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // 모눈종이 그리기
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = "#e5e5e5";
      ctx.lineWidth = 1;

      // 격자 크기
      const gridSize = 20;

      // 가로선 그리기
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 세로선 그리기
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    }, []);

    const renderStar = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      spikes: number,
      outerRadius: number,
      innerRadius: number
    ) => {
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(x, y - outerRadius);

      for (let i = 0; i < spikes; i++) {
        ctx.lineTo(
          x + Math.cos(rot) * outerRadius,
          y + Math.sin(rot) * outerRadius
        );
        rot += step;
        ctx.lineTo(
          x + Math.cos(rot) * innerRadius,
          y + Math.sin(rot) * innerRadius
        );
        rot += step;
      }

      ctx.lineTo(x, y - outerRadius);
      ctx.closePath();
      ctx.fill();
    };

    return (
      <>
        <canvas
          ref={gridCanvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
      </>
    );
  }
);

Physics.displayName = "Physics";

export default Physics;
