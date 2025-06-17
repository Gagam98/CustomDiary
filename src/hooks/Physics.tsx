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

const stickerImageCache = new Map<string, HTMLImageElement>();

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

const catStickerOptions = {
  restitution: 0.6,
  friction: 0.3,
  density: 0.003,
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
    const canvasDimensionsRef = useRef({ width: 0, height: 0 });

    useEffect(() => {
      if (typeof ref === "function") {
        ref(canvasRef.current);
      } else if (ref) {
        ref.current = canvasRef.current;
      }
    }, [ref]);

    // 캔버스 크기 초기화 함수 - 투명 배경 지원
    const initializeCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return { width: 0, height: 0 };

      const container = canvas.parentElement;
      if (!container) return { width: 0, height: 0 };

      const { width, height } = container.getBoundingClientRect();

      // 고해상도 디스플레이 대응
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(pixelRatio, pixelRatio);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // 투명 배경 유지 - clearRect만 사용하고 배경색 채우지 않음
        ctx.clearRect(0, 0, width, height);
      }

      canvasDimensionsRef.current = { width, height };
      return { width, height };
    };

    useEffect(() => {
      if (!canvasRef.current) return;

      // 캔버스 크기 초기화
      const dimensions = initializeCanvasSize();

      // Matter.js 엔진 초기화
      const engine = Matter.Engine.create({
        enableSleeping: false,
        constraintIterations: 4,
        positionIterations: 8,
        velocityIterations: 8,
      });
      engineRef.current = engine;

      engine.world.gravity.y = 2;

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

      const walls = [
        Matter.Bodies.rectangle(
          dimensions.width / 2,
          dimensions.height + 60,
          dimensions.width * 2,
          60,
          wallOptions
        ),
        Matter.Bodies.rectangle(
          -30,
          dimensions.height / 2,
          60,
          dimensions.height * 2,
          wallOptions
        ),
        Matter.Bodies.rectangle(
          dimensions.width + 30,
          dimensions.height / 2,
          60,
          dimensions.height * 2,
          wallOptions
        ),
      ];

      Matter.World.add(engine.world, walls);

      Matter.Events.on(engine, "beforeUpdate", () => {
        const bodies = Matter.Composite.allBodies(engine.world);
        bodies.forEach((body) => {
          if (body.position.y > dimensions.height + 1000) {
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

    // 윈도우 리사이즈 처리
    useEffect(() => {
      const handleResize = () => {
        setTimeout(() => {
          initializeCanvasSize();
        }, 100);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
      stickerSvgs.forEach(async (svg, index) => {
        try {
          const img = await preloadStickerImage(svg);
          stickerImageCache.set(`sticker${index + 1}`, img);
        } catch (error) {
          console.error(`Failed to load sticker image ${index + 1}:`, error);
        }
      });

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

      // 개선된 렌더링 함수 - 투명 배경 지원
      const render = () => {
        const { width, height } = canvasDimensionsRef.current;
        if (width > 0 && height > 0) {
          // 투명 배경 유지 - clearRect 사용 (배경색 없음)
          ctx.clearRect(0, 0, width, height);

          // 사진 렌더링 - 에러 처리 개선 및 투명 배경 지원
          photos.forEach((photo) => {
            const body = bodiesRef.current[`photo-${photo.id}`];
            if (!body) return;

            // 이미지 유효성 검사
            if (!photo.image || !(photo.image instanceof HTMLImageElement)) {
              console.warn(`Invalid image for photo ${photo.id}`);
              return;
            }

            // 이미지 로딩 상태 확인
            if (!photo.image.complete || photo.image.naturalWidth === 0) {
              // 이미지가 아직 로딩 중이면 반투명 로딩 표시
              ctx.save();
              ctx.translate(body.position.x, body.position.y);
              ctx.rotate(body.angle);

              // 반투명 로딩 박스 (투명 배경에 어울리게)
              ctx.fillStyle = "rgba(240, 240, 240, 0.8)";
              ctx.fillRect(
                -photo.width / 2,
                -photo.height / 2,
                photo.width,
                photo.height
              );

              // 테두리 추가
              ctx.strokeStyle = "rgba(200, 200, 200, 0.8)";
              ctx.lineWidth = 1;
              ctx.strokeRect(
                -photo.width / 2,
                -photo.height / 2,
                photo.width,
                photo.height
              );

              // 로딩 텍스트
              ctx.fillStyle = "rgba(102, 102, 102, 0.8)";
              ctx.font = "12px sans-serif";
              ctx.textAlign = "center";
              ctx.fillText("로딩중...", 0, 0);

              ctx.restore();
              return;
            }

            try {
              ctx.save();
              ctx.translate(body.position.x, body.position.y);
              ctx.rotate(body.angle);

              // 사진에 약간의 그림자 효과 추가 (투명 배경에서 구분되도록)
              ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
              ctx.shadowBlur = 3;
              ctx.shadowOffsetX = 1;
              ctx.shadowOffsetY = 1;

              ctx.drawImage(
                photo.image,
                -photo.width / 2,
                -photo.height / 2,
                photo.width,
                photo.height
              );

              ctx.restore();
            } catch (error) {
              console.error(`Failed to draw photo ${photo.id}:`, error);
              ctx.restore();

              // 에러 발생 시 반투명 에러 표시
              ctx.save();
              ctx.translate(body.position.x, body.position.y);
              ctx.rotate(body.angle);

              // 반투명 에러 박스
              ctx.fillStyle = "rgba(255, 235, 238, 0.9)";
              ctx.fillRect(
                -photo.width / 2,
                -photo.height / 2,
                photo.width,
                photo.height
              );
              ctx.strokeStyle = "rgba(244, 67, 54, 0.8)";
              ctx.lineWidth = 2;
              ctx.strokeRect(
                -photo.width / 2,
                -photo.height / 2,
                photo.width,
                photo.height
              );

              // 에러 텍스트
              ctx.fillStyle = "rgba(244, 67, 54, 0.8)";
              ctx.font = "12px sans-serif";
              ctx.textAlign = "center";
              ctx.fillText("오류", 0, 0);

              ctx.restore();
            }
          });

          // 스티커 렌더링 - 투명 배경 지원
          stickers.forEach((sticker) => {
            const body = bodiesRef.current[`sticker-${sticker.id}`];
            if (!body) return;

            try {
              ctx.save();
              ctx.translate(body.position.x, body.position.y);
              ctx.rotate(body.angle);

              const s = sticker.size;
              if (sticker.shape.startsWith("sticker")) {
                const cachedImage = stickerImageCache.get(sticker.shape);
                if (cachedImage && cachedImage.complete) {
                  // 스티커에 약간의 그림자 효과 (투명 배경에서 구분되도록)
                  ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
                  ctx.shadowBlur = 2;
                  ctx.shadowOffsetX = 1;
                  ctx.shadowOffsetY = 1;

                  ctx.drawImage(cachedImage, -s / 2, -s / 2, s, s);

                  // 그림자 리셋
                  ctx.shadowColor = "transparent";
                  ctx.shadowBlur = 0;
                  ctx.shadowOffsetX = 0;
                  ctx.shadowOffsetY = 0;
                } else {
                  // 스티커 이미지가 로드되지 않았을 때 기본 도형으로 표시
                  ctx.fillStyle = sticker.color;
                  ctx.fillRect(-s / 2, -s / 2, s, s);
                }
              } else if (sticker.shape.startsWith("cat")) {
                const img = stickerImageCache.get(sticker.shape);
                if (img && img.complete) {
                  const height = s * 1.2;

                  // 고양이 스티커에도 그림자 효과
                  ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
                  ctx.shadowBlur = 2;
                  ctx.shadowOffsetX = 1;
                  ctx.shadowOffsetY = 1;

                  ctx.drawImage(img, -s / 2, -height / 2, s, height);

                  // 그림자 리셋
                  ctx.shadowColor = "transparent";
                  ctx.shadowBlur = 0;
                  ctx.shadowOffsetX = 0;
                  ctx.shadowOffsetY = 0;
                } else {
                  // 고양이 스티커 이미지가 로드되지 않았을 때
                  ctx.fillStyle = sticker.color;
                  ctx.fillRect(-s / 2, -s / 2, s, s);
                }
              } else {
                // 기본 도형 스티커들 - 약간의 테두리 추가 (투명 배경에서 구분되도록)
                ctx.fillStyle = sticker.color;

                // 약간의 테두리 효과
                ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
                ctx.lineWidth = 1;

                switch (sticker.shape) {
                  case "circle":
                    ctx.beginPath();
                    ctx.arc(0, 0, s / 2, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.stroke();
                    break;
                  case "square":
                    ctx.fillRect(-s / 2, -s / 2, s, s);
                    ctx.strokeRect(-s / 2, -s / 2, s, s);
                    break;
                  case "triangle":
                    ctx.beginPath();
                    ctx.moveTo(0, -s / 2);
                    ctx.lineTo(s / 2, s / 2);
                    ctx.lineTo(-s / 2, s / 2);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    break;
                  case "heart":
                    ctx.beginPath();
                    ctx.moveTo(0, -s / 4);
                    ctx.bezierCurveTo(s / 2, -s / 2, s / 2, s / 4, 0, s / 2);
                    ctx.bezierCurveTo(-s / 2, s / 4, -s / 2, -s / 2, 0, -s / 4);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    break;
                  case "star":
                    renderStar(ctx, 0, 0, 5, s / 2, s / 4);
                    ctx.stroke();
                    break;
                  default:
                    // 알 수 없는 스티커는 원으로 표시
                    ctx.beginPath();
                    ctx.arc(0, 0, s / 4, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.stroke();
                    break;
                }
              }
              ctx.restore();
            } catch (error) {
              console.error(`Failed to draw sticker ${sticker.id}:`, error);
              ctx.restore();
            }
          });
        }

        animationFrameId = requestAnimationFrame(render);
      };

      render();
      return () => cancelAnimationFrame(animationFrameId);
    }, [photos, stickers]);

    // 그리드 캔버스 - 투명 배경을 위해 더 연한 그리드
    useEffect(() => {
      if (!gridCanvasRef.current) return;
      const canvas = gridCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const container = canvas.parentElement;
      if (!container) return;
      const { width, height } = container.getBoundingClientRect();

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // 투명 배경에 맞춰 더 연한 그리드 색상
      ctx.strokeStyle = "rgba(229, 229, 229, 0.3)";
      ctx.lineWidth = 1;

      const gridSize = 20;

      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

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

        const rect = canvas.getBoundingClientRect();
        const mousePosition = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
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

        const rect = canvas.getBoundingClientRect();
        Matter.Body.setPosition(selectedBodyRef.current, {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
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
