import { useState, useRef } from "react";
import TopToolbar from "./TopToolbar";
import Physics from "../../hooks/Physics";

interface Sticker {
  id: string;
  shape: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface Photo {
  id: string;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
}

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);

  return (
    <div className="relative w-full h-screen">
      <TopToolbar
        setStickers={setStickers}
        setPhotos={setPhotos}
        canvasRef={canvasRef}
      />
      <Physics photos={photos} stickers={stickers} ref={canvasRef} />
    </div>
  );
};

export default Canvas;
