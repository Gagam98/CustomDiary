import { useRef, forwardRef } from "react";

// TopToolbar의 Photo 타입과 일치하도록 수정
interface Photo {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  image: HTMLImageElement;
  src: string; // 추가된 속성
  isLoaded?: boolean; // 추가된 속성
}

interface PhotoToolProps {
  setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onPhotoUpload?: (file: File) => void; // TopToolbar에서 전달받는 핸들러
}

const PhotoTool = forwardRef<HTMLInputElement, PhotoToolProps>(
  ({ setPhotos, canvasRef, onPhotoUpload }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || !canvasRef.current) return;

      const file = files[0];

      // TopToolbar에서 전달받은 핸들러가 있으면 사용
      if (onPhotoUpload) {
        onPhotoUpload(file);
      } else {
        // 기본 핸들러 (백업용)
        handleImageUploadDefault(file);
      }

      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    // 기본 이미지 업로드 핸들러 (백업용)
    const handleImageUploadDefault = (file: File) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        const src = e.target?.result as string;

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

          const newPhoto: Photo = {
            id: `photo-${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 9)}`,
            image: img,
            src: src, // 원본 이미지 URL 저장
            x: Math.random() * (rect.width * 0.8) + rect.width * 0.1,
            y: TOOLBAR_HEIGHT,
            width,
            height,
            isLoaded: true, // 이미지 로딩 완료 상태
          };

          setPhotos((prev) => [...prev, newPhoto]);
        };

        img.onerror = () => {
          console.error("Failed to load image");
        };

        img.src = src;
      };

      reader.readAsDataURL(file);
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

PhotoTool.displayName = "PhotoTool";

export default PhotoTool;
