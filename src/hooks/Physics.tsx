import { useEffect, useRef, forwardRef, ForwardedRef } from "react";
import Matter from "matter-js";
import { Sticker, Photo } from "../pages/Canvas/TopToolbar";
import GlueTool from "../pages/Canvas/SideTools/GlueTool";
import { stickerSvgs } from "../components/stickerSvgs";
import { catStickers } from "../components/catStickers";

interface PhysicsProps {
  photos: Photo[];
  stickers: Sticker[];
  activeSideTool: string;
  setGlueModeActive: (active: boolean) => void;
}

// 스티커 이미지 캐시를 위한 Map 선언
const stickerImageCache = new Map<string, HTMLImageElement>();

// 스티커 이미지 사전 로드 함수
const preloadStickerImage = (stickerSvg: {
  src: string;
}): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = stickerSvg.src;
    return img;
  });
};

// 고양이 스티커를 위한 물리 속성 최적화
const catStickerOptions = {
  restitution: 0.6, // 탄성 감소
  friction: 0.3, // 마찰 증가
  density: 0.003, // 밀도 증가
  frictionAir: 0.001,
  collisionFilter: {
    category: 0x0004,
    mask: 0x0001 | 0x0002 | 0x0004,
    group: 0,
  },
};

const Physics = forwardRef<HTMLCanvasElement, PhysicsProps>(
  (
    { photos, stickers, activeSideTool, setGlueModeActive },
    ref: ForwardedRef<HTMLCanvasElement>
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const bodiesRef = useRef<{ [key: string]: Matter.Body }>({});
    const gridCanvasRef = useRef<HTMLCanvasElement>(null);
    const selectedBodyRef = useRef<Matter.Body | null>(null);
    const isDraggingRef = useRef(false);

    useEffect(() => {
      if (typeof ref === "function") {
        ref(canvasRef.current);
      } else if (ref) {
        ref.current = canvasRef.current;
      }
    }, [ref]);

    useEffect(() => {
      if (!canvasRef.current) return;

      // Matter.js 엔진 초기화
      const engine = Matter.Engine.create({
        enableSleeping: false,
        constraintIterations: 4,
        positionIterations: 8,
        velocityIterations: 8,
      });
      engineRef.current = engine;

      // 중력 설정
      engine.world.gravity.y = 2;

      // 벽 생성 - 위치 및 크기 조정
      const wallOptions = {
        isStatic: true,
        render: { visible: false },
        restitution: 0.5,
        friction: 0.3,
        density: 1,
        collisionFilter: {
          category: 0x0001,
        },
      };

      // 화면 크기 가져오기
      const container = canvasRef.current.parentElement;
      if (!container) return;
      const { width, height } = container.getBoundingClientRect();

      const walls = [
        // 바닥
        Matter.Bodies.rectangle(
          width / 2,
          height + 60, // 바닥을 약간 아래로 내림
          width * 2, // 너비를 더 넓게
          60,
          wallOptions
        ),
        // 왼쪽 벽
        Matter.Bodies.rectangle(
          -30, // 왼쪽 벽을 약간 바깥으로
          height / 2,
          60,
          height * 2,
          wallOptions
        ),
        // 오른쪽 벽
        Matter.Bodies.rectangle(
          width + 30, // 오른쪽 벽을 약간 바깥으로
          height / 2,
          60,
          height * 2,
          wallOptions
        ),
      ];

      Matter.World.add(engine.world, walls);

      // 충돌 필터링 설정
      Matter.Events.on(engine, "beforeUpdate", () => {
        const bodies = Matter.Composite.allBodies(engine.world);
        bodies.forEach((body) => {
          if (body.position.y > height + 1000) {
            // 너무 멀리 떨어진 객체를 다시 위로 올림
            Matter.Body.setPosition(body, {
              x: body.position.x,
              y: 0,
            });
            Matter.Body.setVelocity(body, { x: 0, y: 0 });
          }
        });
      });

      const runner = Matter.Runner.create();
      Matter.Runner.run(runner, engine);

      return () => {
        Matter.Runner.stop(runner);
        Matter.Engine.clear(engine);
      };
    }, []);

    useEffect(() => {
      // 스티커 이미지 사전 로드
      stickerSvgs.forEach(async (svg, index) => {
        try {
          const img = await preloadStickerImage(svg);
          stickerImageCache.set(`sticker${index + 1}`, img);
        } catch (error) {
          console.error(`Failed to load sticker image ${index + 1}:`, error);
        }
      });

      // 고양이 스티커 이미지도 사전 로드 추가
      catStickers.forEach(async (cat, index) => {
        try {
          const img = await preloadStickerImage(cat);
          stickerImageCache.set(`cat${index + 1}`, img);
        } catch (error) {
          console.error(
            `Failed to load cat sticker image ${index + 1}:`,
            error
          );
        }
      });
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
            } as Matter.IBodyDefinition & { chamfer: { radius: number } }
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
          let body;
          switch (sticker.shape) {
            case "circle":
              body = Matter.Bodies.circle(
                sticker.x,
                sticker.y,
                sticker.size / 2,
                {
                  restitution: 0.8,
                  friction: 0.1,
                  density: 0.002,
                  frictionAir: 0.001,
                  collisionFilter: {
                    category: 0x0002,
                    mask: 0x0001 | 0x0002 | 0x0004,
                    group: 0,
                  },
                }
              );
              break;
            case "square":
              body = Matter.Bodies.rectangle(
                sticker.x,
                sticker.y,
                sticker.size,
                sticker.size,
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
                } as Matter.IBodyDefinition & { chamfer: { radius: number } }
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
                } as Matter.IBodyDefinition & { chamfer: { radius: number } }
              );
              break;
            }
            case "sticker1":
            case "sticker2":
            case "sticker3":
            case "sticker4":
            case "sticker5":
            case "sticker6":
            case "sticker7":
            case "sticker8":
            case "sticker9":
            case "sticker10":
            case "sticker11":
              body = Matter.Bodies.rectangle(
                sticker.x,
                sticker.y,
                sticker.size,
                sticker.size,
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
                } as Matter.IBodyDefinition & { chamfer: { radius: number } }
              );
              break;
            case "cat1":
            case "cat2":
            case "cat3":
            case "cat4":
            case "cat5":
            case "cat6":
            case "cat7":
            case "cat8":
            case "cat9":
            case "cat10":
              body = Matter.Bodies.rectangle(
                sticker.x,
                sticker.y,
                sticker.size,
                sticker.size * 1.2,
                catStickerOptions
              );
              break;
            default:
              body = Matter.Bodies.circle(
                sticker.x,
                sticker.y,
                sticker.size / 2,
                {
                  restitution: 0.8,
                  friction: 0.1,
                  density: 0.002,
                  frictionAir: 0.001,
                  collisionFilter: {
                    category: 0x0002,
                    mask: 0x0001 | 0x0002 | 0x0004,
                    group: 0,
                  },
                }
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
          ctx.translate(body.position.x, body.position.y);
          ctx.rotate(body.angle);

          const s = sticker.size;
          if (sticker.shape.startsWith("sticker")) {
            const cachedImage = stickerImageCache.get(sticker.shape);
            if (cachedImage && cachedImage.complete) {
              ctx.drawImage(cachedImage, -s / 2, -s / 2, s, s);
            }
          } else if (sticker.shape.startsWith("cat")) {
            const catIndex = parseInt(sticker.shape.replace("cat", "")) - 1;
            const cat = catStickers[catIndex];
            if (cat) {
              const img = stickerImageCache.get(sticker.shape);
              if (img && img.complete) {
                const height = s * 1.2; // 고양이 스티커 비율 조정
                ctx.drawImage(img, -s / 2, -height / 2, s, height);
              } else {
                // 이미지가 로드되지 않았을 때 임시 표시
                ctx.fillStyle = sticker.color;
                ctx.fillRect(-s / 2, -s / 2, s, s);
              }
            }
          } else {
            ctx.fillStyle = sticker.color;
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

    useEffect(() => {
      if (!engineRef.current || !canvasRef.current) return;
      const canvas = canvasRef.current;

      const handleMouseDown = (e: MouseEvent) => {
        if (activeSideTool !== "glue") return;

        const mousePosition = {
          x: e.clientX,
          y: e.clientY,
        };

        const bodies = Matter.Composite.allBodies(engineRef.current!.world);
        const clickedBody = bodies.find((body) => {
          return Matter.Bounds.contains(body.bounds, mousePosition);
        });

        if (clickedBody) {
          selectedBodyRef.current = clickedBody;
          isDraggingRef.current = true;
          Matter.Body.setStatic(clickedBody, true);
          setGlueModeActive(true);
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDraggingRef.current || !selectedBodyRef.current) return;

        Matter.Body.setPosition(selectedBodyRef.current, {
          x: e.clientX,
          y: e.clientY,
        });
      };

      const handleMouseUp = () => {
        if (selectedBodyRef.current) {
          Matter.Body.setStatic(selectedBodyRef.current, false);
          selectedBodyRef.current = null;
          isDraggingRef.current = false;
          setGlueModeActive(false);
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
    }, [activeSideTool, setGlueModeActive]);

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
          className={`absolute top-0 left-0 w-full h-full ${
            activeSideTool === "glue"
              ? "cursor-grab active:cursor-grabbing"
              : ""
          }`}
          style={{ zIndex: activeSideTool === "glue" ? 20 : 10 }}
        />
        <GlueTool
          isActive={activeSideTool === "glue"}
          engineRef={engineRef}
          canvasRef={canvasRef}
          setGlueModeActive={setGlueModeActive}
        />
      </>
    );
  }
);

Physics.displayName = "Physics";

export default Physics;
