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
  photos?: SerializablePhoto[]; // Photo 대신 SerializablePhoto 사용
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

  // 캔버스 초기화 함수
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

    // 캔버스 실제 크기 설정
    canvas.width = containerWidth * pixelRatio;
    canvas.height = containerHeight * pixelRatio;

    // 캔버스 CSS 크기 설정
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;

    // 컨텍스트 스케일 조정
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    }

    return { width: containerWidth, height: containerHeight, pixelRatio };
  }, []);

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
            image: img, // HTMLImageElement 객체 재생성
            isLoaded: false, // 처음에는 false로 설정
          };

          // 이미지 로딩 완료 처리
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
        // 캔버스 초기화
        const dimensions = initializeCanvas();
        if (!dimensions) return;

        // 캔버스 클리어
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);

        // 저장된 크기 정보가 있으면 사용, 없으면 현재 캔버스 크기 사용
        const savedWidth = canvasState.canvasWidth || dimensions.width;
        const savedHeight = canvasState.canvasHeight || dimensions.height;

        // 크기가 다른 경우 스케일 조정
        const scaleX = dimensions.width / savedWidth;
        const scaleY = dimensions.height / savedHeight;

        if (Math.abs(scaleX - 1) > 0.01 || Math.abs(scaleY - 1) > 0.01) {
          ctx.save();
          ctx.scale(scaleX, scaleY);
          ctx.drawImage(img, 0, 0, savedWidth, savedHeight);
          ctx.restore();
        } else {
          // 1:1 크기인 경우 그대로 그리기
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

            // 캔버스가 준비된 후 이미지 데이터 복원
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
      // 리사이즈 시 캔버스 재초기화
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

    // 사진 데이터를 직렬화 가능한 형태로 변환
    const serializablePhotos: SerializablePhoto[] = photos.map((photo) => ({
      id: photo.id,
      x: photo.x,
      y: photo.y,
      width: photo.width,
      height: photo.height,
      src: photo.src, // HTMLImageElement 대신 src URL 저장
      isLoaded: photo.isLoaded,
    }));

    const createCanvasData = (canvasDataURL: string): string => {
      const canvasData: CanvasState = {
        stickers,
        photos: serializablePhotos, // 직렬화된 사진 데이터
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

  // 썸네일 생성
  const generateThumbnail = useCallback((): string => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) {
      console.warn("Canvas element not found for thumbnail generation");
      return "";
    }

    try {
      const thumbnailCanvas = document.createElement("canvas");
      const ctx = thumbnailCanvas.getContext("2d");
      thumbnailCanvas.width = 200;
      thumbnailCanvas.height = 150;

      if (ctx) {
        ctx.drawImage(
          canvasElement,
          0,
          0,
          thumbnailCanvas.width,
          thumbnailCanvas.height
        );
        return thumbnailCanvas.toDataURL("image/jpeg", 0.8);
      }
    } catch (error) {
      console.error("Failed to generate thumbnail:", error);
    }

    return "";
  }, []);

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
