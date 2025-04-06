import { useRef, forwardRef } from "react";

interface PhotoToolProps {
  setPhotos: React.Dispatch<
    React.SetStateAction<
      Array<{
        id: string;
        image: HTMLImageElement;
        x: number;
        y: number;
        width: number;
        height: number;
      }>
    >
  >;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const PhotoTool = forwardRef<HTMLInputElement, PhotoToolProps>(
  ({ setPhotos, canvasRef }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || !canvasRef.current) return;

      const file = files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;

        img.onload = () => {
          const rect = canvasRef.current!.getBoundingClientRect();
          const TOOLBAR_HEIGHT = 88;

          let width = img.width;
          let height = img.height;
          const maxSize = 250;

          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }

          const newPhoto = {
            id: `photo-${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 9)}`,
            image: img,
            x: Math.random() * (rect.width * 0.8) + rect.width * 0.1,
            y: TOOLBAR_HEIGHT,
            width,
            height,
          };

          setPhotos((prev) => [...prev, newPhoto]);
        };
      };

      reader.readAsDataURL(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    return (
      <input
        ref={(node) => {
          fileInputRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    );
  }
);

export default PhotoTool;
