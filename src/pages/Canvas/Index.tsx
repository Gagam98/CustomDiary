import { useRef, useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopToolbar, { Sticker, Photo } from "./TopToolbar";
import CanvasContent from "./CanvasContent";
import Sidebar from "./SideToolbar";
import Physics from "../../hooks/Physics";
import Matter from "matter-js";
import { drawingAPI, CreateDrawingRequest } from "../../utils/apiService";
import { getCurrentUser } from "../../utils/authUtils";

// 직렬화 가능한 사진 데이터 타입
interface SerializablePhoto {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  isLoaded?: boolean;
}

// 캔버스 상태 타입 정의
interface CanvasState {
  stickers?: Sticker[];
  photos?: SerializablePhoto[];
  canvasDataURL?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  pixelRatio?: number;
  timestamp?: string;
}

// 캔버스 크기 정보 타입
interface CanvasDimensions {
  width: number;
  height: number;
  pixelRatio: number;
}

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const title = location.state?.title || "Untitled";
  const drawingId = location.state?.drawingId;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const physicsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Matter.Engine | null>(null);

  const [activeSideTool, setActiveSideTool] = useState("");
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isGlueModeActive, setIsGlueModeActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 캔버스 초기화 함수 (투명 배경으로 수정)
  const initializeCanvas = useCallback((): CanvasDimensions | undefined => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const container = canvas.parentElement;
    if (!container) return undefined;

    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // 고해상도 디스플레이 대응
    const pixelRatio = window.devicePixelRatio || 1;

    // 현재 캔버스 내용 백업 (기존 그림이 있는 경우)
    let imageData: ImageData | null = null;
    const ctx = canvas.getContext("2d");
    if (ctx && canvas.width > 0 && canvas.height > 0) {
      try {
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch (error) {
        console.warn("Failed to backup canvas data:", error);
      }
    }

    // 캔버스 실제 크기 설정
    canvas.width = containerWidth * pixelRatio;
    canvas.height = containerHeight * pixelRatio;

    // 캔버스 CSS 크기 설정
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;

    // 컨텍스트 스케일 조정 및 기본 설정
    if (ctx) {
      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // 흰색 배경 제거 - 투명 배경 유지
      // ctx.fillStyle = "#ffffff";
      // ctx.fillRect(0, 0, containerWidth, containerHeight);

      // 기존 내용 복원 (있는 경우)
      if (imageData && imageData.width > 0 && imageData.height > 0) {
        try {
          // 크기가 다르면 스케일링해서 복원
          const scaleX = containerWidth / (imageData.width / pixelRatio);
          const scaleY = containerHeight / (imageData.height / pixelRatio);

          if (Math.abs(scaleX - 1) > 0.01 || Math.abs(scaleY - 1) > 0.01) {
            // 임시 캔버스에 기존 데이터 그리기
            const tempCanvas = document.createElement("canvas");
            const tempCtx = tempCanvas.getContext("2d");
            tempCanvas.width = imageData.width;
            tempCanvas.height = imageData.height;

            if (tempCtx) {
              tempCtx.putImageData(imageData, 0, 0);
              ctx.save();
              ctx.scale(scaleX, scaleY);
              ctx.drawImage(tempCanvas, 0, 0);
              ctx.restore();
            }
          } else {
            // 1:1 크기면 직접 복원
            ctx.putImageData(imageData, 0, 0);
          }
        } catch (error) {
          console.warn("Failed to restore canvas data:", error);
        }
      }
    }

    return { width: containerWidth, height: containerHeight, pixelRatio };
  }, []);

  // 개선된 썸네일 생성 함수 - 흰색 배경으로 합성
  const generateThumbnail = useCallback((): string => {
    const drawingCanvas = canvasRef.current;
    const physicsCanvas = physicsCanvasRef.current;

    if (!drawingCanvas) {
      console.warn("Canvas element not found for thumbnail generation");
      return "";
    }

    try {
      // 썸네일 캔버스 생성
      const thumbnailCanvas = document.createElement("canvas");
      const ctx = thumbnailCanvas.getContext("2d");
      thumbnailCanvas.width = 200;
      thumbnailCanvas.height = 150;

      if (!ctx) return "";

      // 썸네일에만 흰색 배경 추가 (실제 캔버스는 투명 유지)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);

      // 컨테이너 크기 가져오기
      const container = drawingCanvas.parentElement;
      if (!container) return "";

      const containerRect = container.getBoundingClientRect();
      const scaleX = thumbnailCanvas.width / containerRect.width;
      const scaleY = thumbnailCanvas.height / containerRect.height;

      // Physics 캔버스 내용 먼저 추가 (스티커, 사진 등이 뒤에 있도록)
      if (
        physicsCanvas &&
        physicsCanvas.width > 0 &&
        physicsCanvas.height > 0
      ) {
        ctx.drawImage(
          physicsCanvas,
          0,
          0,
          thumbnailCanvas.width,
          thumbnailCanvas.height
        );
      }

      // 그리기 캔버스 내용 위에 추가 (펜 드로잉 등이 앞에 있도록)
      if (drawingCanvas.width > 0 && drawingCanvas.height > 0) {
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(
          drawingCanvas,
          0,
          0,
          thumbnailCanvas.width,
          thumbnailCanvas.height
        );
      }

      // 수동 렌더링 (Physics 캔버스가 비어있을 경우)
      const renderObjectsManually = () => {
        // 사진 렌더링 (가장 뒤)
        photos.forEach((photo) => {
          if (photo.image && photo.isLoaded && photo.image.complete) {
            try {
              ctx.save();
              const x = photo.x * scaleX;
              const y = photo.y * scaleY;
              const width = photo.width * scaleX;
              const height = photo.height * scaleY;

              ctx.drawImage(photo.image, x, y, width, height);
              ctx.restore();
            } catch (error) {
              console.warn("Failed to render photo in thumbnail:", error);
            }
          }
        });

        // 스티커 렌더링 (사진 위)
        stickers.forEach((sticker) => {
          try {
            ctx.save();
            const x = sticker.x * scaleX;
            const y = sticker.y * scaleY;
            const size = sticker.size * Math.min(scaleX, scaleY);

            ctx.fillStyle = sticker.color;

            switch (sticker.shape) {
              case "circle":
                ctx.beginPath();
                ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
                ctx.fill();
                break;
              case "square":
                ctx.fillRect(x - size / 2, y - size / 2, size, size);
                break;
              case "triangle":
                ctx.beginPath();
                ctx.moveTo(x, y - size / 2);
                ctx.lineTo(x + size / 2, y + size / 2);
                ctx.lineTo(x - size / 2, y + size / 2);
                ctx.closePath();
                ctx.fill();
                break;
              default:
                ctx.beginPath();
                ctx.arc(x, y, size / 4, 0, 2 * Math.PI);
                ctx.fill();
                break;
            }
            ctx.restore();
          } catch (error) {
            console.warn("Failed to render sticker in thumbnail:", error);
          }
        });
      };

      // Physics 캔버스가 비어있으면 수동 렌더링
      if (
        !physicsCanvas ||
        physicsCanvas.width === 0 ||
        physicsCanvas.height === 0
      ) {
        renderObjectsManually();
      }

      return thumbnailCanvas.toDataURL("image/jpeg", 0.8);
    } catch (error) {
      console.error("Failed to generate thumbnail:", error);

      // 에러 발생 시 기본 썸네일 생성
      try {
        const fallbackCanvas = document.createElement("canvas");
        const fallbackCtx = fallbackCanvas.getContext("2d");
        fallbackCanvas.width = 200;
        fallbackCanvas.height = 150;

        if (fallbackCtx) {
          // 연한 회색 배경
          fallbackCtx.fillStyle = "#f5f5f5";
          fallbackCtx.fillRect(0, 0, 200, 150);

          // 텍스트 표시
          fallbackCtx.fillStyle = "#999";
          fallbackCtx.font = "14px sans-serif";
          fallbackCtx.textAlign = "center";
          fallbackCtx.fillText("미리보기 없음", 100, 75);

          return fallbackCanvas.toDataURL("image/jpeg", 0.8);
        }
      } catch (fallbackError) {
        console.error("Failed to generate fallback thumbnail:", fallbackError);
      }

      return "";
    }
  }, [photos, stickers]);

  // 캔버스 데이터 복원 함수
  const restoreCanvasData = useCallback(
    (canvasState: CanvasState) => {
      const canvas = canvasRef.current;

      // 사진 데이터 복원
      if (canvasState.photos) {
        const restoredPhotos: Photo[] = canvasState.photos.map((photoData) => {
          const img = new Image();

          const newPhoto: Photo = {
            ...photoData,
            image: img,
            isLoaded: false,
          };

          img.onload = () => {
            setPhotos((prev) =>
              prev.map((p) =>
                p.id === newPhoto.id ? { ...p, isLoaded: true } : p
              )
            );
          };

          img.onerror = (error) => {
            console.error(
              `Failed to load image for photo ${photoData.id}:`,
              error
            );
          };

          img.src = photoData.src;
          return newPhoto;
        });

        setPhotos(restoredPhotos);
      }

      // 캔버스 이미지 복원
      if (!canvas || !canvasState.canvasDataURL) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        const dimensions = initializeCanvas();
        if (!dimensions) return;

        // 투명 배경으로 클리어 (흰색 배경 제거)
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);

        const savedWidth = canvasState.canvasWidth || dimensions.width;
        const savedHeight = canvasState.canvasHeight || dimensions.height;

        const scaleX = dimensions.width / savedWidth;
        const scaleY = dimensions.height / savedHeight;

        if (Math.abs(scaleX - 1) > 0.01 || Math.abs(scaleY - 1) > 0.01) {
          ctx.save();
          ctx.scale(scaleX, scaleY);
          ctx.drawImage(img, 0, 0, savedWidth, savedHeight);
          ctx.restore();
        } else {
          ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
        }
      };

      img.onerror = (error) => {
        console.error("Failed to load canvas image:", error);
      };

      img.src = canvasState.canvasDataURL;
    },
    [initializeCanvas]
  );

  // 나머지 코드는 동일...
  // [기존 useEffect들과 함수들 그대로 유지]

  // 기존 문서 로드
  useEffect(() => {
    const loadExistingDrawing = async () => {
      if (!drawingId) return;

      setIsLoading(true);
      try {
        const drawings = await drawingAPI.getDrawings();
        const existingDrawing = drawings.find((d) => d.id === drawingId);

        if (existingDrawing && existingDrawing.canvasData) {
          try {
            const canvasState: CanvasState = JSON.parse(
              existingDrawing.canvasData
            );

            if (canvasState.stickers) setStickers(canvasState.stickers);

            setTimeout(() => {
              restoreCanvasData(canvasState);
            }, 300);
          } catch (parseError) {
            console.error("Failed to parse canvas data:", parseError);
            setSaveError("문서를 불러오는데 실패했습니다.");
          }
        }
      } catch (loadError) {
        console.error("Failed to load existing drawing:", loadError);
        setSaveError("문서를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingDrawing();
  }, [drawingId, restoreCanvasData]);

  // 캔버스 초기화 useEffect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const timer = setTimeout(() => {
      initializeCanvas();
    }, 100);

    return () => clearTimeout(timer);
  }, [initializeCanvas]);

  // 윈도우 리사이즈 이벤트 핸들링
  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        initializeCanvas();
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initializeCanvas]);

  // 개선된 캔버스 데이터 직렬화
  const serializeCanvasData = useCallback((): string => {
    const canvasElement = canvasRef.current;

    const serializablePhotos: SerializablePhoto[] = photos.map((photo) => ({
      id: photo.id,
      x: photo.x,
      y: photo.y,
      width: photo.width,
      height: photo.height,
      src: photo.src,
      isLoaded: photo.isLoaded,
    }));

    const createCanvasData = (canvasDataURL: string): string => {
      const canvasData: CanvasState = {
        stickers,
        photos: serializablePhotos,
        canvasDataURL,
        canvasWidth: canvasElement?.offsetWidth || 0,
        canvasHeight: canvasElement?.offsetHeight || 0,
        pixelRatio: window.devicePixelRatio || 1,
        timestamp: new Date().toISOString(),
      };
      return JSON.stringify(canvasData);
    };

    if (!canvasElement) {
      console.warn("Canvas element not found, creating empty canvas data");
      return createCanvasData("");
    }

    try {
      const canvasDataURL = canvasElement.toDataURL("image/png");
      return createCanvasData(canvasDataURL);
    } catch (error) {
      console.error("Failed to get canvas data URL:", error);
      return createCanvasData("");
    }
  }, [stickers, photos]);

  // 문서 저장
  const saveDrawing = useCallback(async (): Promise<void> => {
    if (isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const canvasData = serializeCanvasData();
      const thumbnail = generateThumbnail();

      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error("로그인이 필요합니다.");
      }

      console.log("=== 드로잉 저장 디버깅 ===");
      console.log("Title:", title);
      console.log("CanvasData length:", canvasData?.length || 0);
      console.log("Thumbnail length:", thumbnail?.length || 0);
      console.log("Canvas element exists:", !!canvasRef.current);
      console.log("Stickers count:", stickers.length);
      console.log("Photos count:", photos.length);

      if (!canvasData) {
        console.warn("캔버스 데이터가 null/undefined입니다.");
        setSaveError("데이터 생성에 실패했습니다. 페이지를 새로고침해주세요.");
        return;
      }

      if (drawingId) {
        await drawingAPI.updateDrawing(drawingId, {
          title,
          canvasData,
          thumbnail,
        });
      } else {
        const createRequest: CreateDrawingRequest = {
          title,
          canvasData,
          thumbnail,
        };

        console.log("Sending request:", createRequest);
        const newDrawing = await drawingAPI.createDrawing(createRequest);

        if (newDrawing.id) {
          navigate("/canvas", {
            state: {
              title,
              drawingId: newDrawing.id,
            },
            replace: true,
          });
        }
      }

      setLastSaved(new Date());
    } catch (error: unknown) {
      console.error("Failed to save drawing:", error);

      let errorMessage = "저장에 실패했습니다. 다시 시도해주세요.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [
    isSaving,
    serializeCanvasData,
    generateThumbnail,
    drawingId,
    title,
    navigate,
    stickers,
    photos,
  ]);

  // 자동 저장 (5초마다)
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if ((stickers.length > 0 || photos.length > 0) && !isLoading) {
        saveDrawing();
      }
    }, 5000);

    return () => clearInterval(autoSaveInterval);
  }, [stickers, photos, saveDrawing, isLoading]);

  // 페이지를 떠날 때 저장
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSaving) {
        e.preventDefault();
        e.returnValue = "저장 중입니다. 정말 나가시겠습니까?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSaving]);

  // 홈으로 돌아가기 전 저장
  const handleBackToHome = useCallback(async (): Promise<void> => {
    if (isSaving) return;

    try {
      await saveDrawing();
      navigate("/");
    } catch {
      navigate("/");
    }
  }, [isSaving, saveDrawing, navigate]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-lg">문서를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div
      className={`w-full h-screen flex flex-col ${
        isGlueModeActive ? "cursor-grab" : ""
      }`}
    >
      {saveError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 text-sm">
          {saveError}
          <button
            onClick={() => setSaveError(null)}
            className="ml-2 text-red-900 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      <TopToolbar
        setStickers={setStickers}
        setPhotos={setPhotos}
        canvasRef={canvasRef}
        title={title}
        engineRef={engineRef}
        onSave={saveDrawing}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onBackToHome={handleBackToHome}
      />

      <div className="flex flex-1 min-h-0">
        <div className="w-16 bg-white border-r">
          <Sidebar
            activeSideTool={activeSideTool}
            setActiveSideTool={setActiveSideTool}
          />
        </div>

        <div className="flex-1 relative bg-white">
          <CanvasContent
            handleUndo={() => console.log("Undo 실행")}
            onSave={saveDrawing}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
            style={{ zIndex: 15 }}
          />
          <Physics
            photos={photos}
            stickers={stickers}
            ref={physicsCanvasRef}
            activeSideTool={activeSideTool}
            setGlueModeActive={setIsGlueModeActive}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
