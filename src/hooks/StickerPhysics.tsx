import { useEffect, useRef } from "react";

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

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const sticker of shapes) {
      ctx.save();
      ctx.fillStyle = sticker.color;
      ctx.translate(sticker.x, sticker.y);

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
    }
  }, [shapes]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute top-0 left-0 w-full h-full z-10"
    />
  );
};

export default StickerPhysics;
