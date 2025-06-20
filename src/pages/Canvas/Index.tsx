import { useRef, useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopToolbar, { Sticker, Photo } from "./TopToolbar";
import CanvasContent from "./CanvasContent";
import Sidebar from "./SideToolbar";
import Physics from "../../hooks/Physics";
import Matter from "matter-js";
import GuideSlide from "./GuideSlide";
import { drawingAPI, CreateDrawingRequest } from "../../utils/apiService";
import { getCurrentUser } from "../../utils/authUtils";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const title = location.state?.title || "Untitled";
  const drawingId = location.state?.drawingId; // 기존 문서의 ID (수정 모드)

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

  // 기존 문서 로드 (수정 모드인 경우)
  useEffect(() => {
    const loadExistingDrawing = async () => {
      if (!drawingId) return;

      setIsLoading(true);
      try {
        // 실제로는 개별 문서를 가져오는 API가 필요합니다
        const drawings = await drawingAPI.getDrawings();
        const existingDrawing = drawings.find((d) => d.id === drawingId);

        if (existingDrawing && existingDrawing.canvasData) {
          // 캔버스 데이터 복원 로직
          try {
            const canvasState = JSON.parse(existingDrawing.canvasData);

            if (canvasState.stickers) setStickers(canvasState.stickers);
            if (canvasState.photos) setPhotos(canvasState.photos);

            // 캔버스 이미지 데이터 복원
            if (canvasState.canvasDataURL && canvasRef.current) {
              const ctx = canvasRef.current.getContext("2d");
              if (ctx) {
                const img = new Image();
                img.onload = () => {
                  ctx.drawImage(img, 0, 0);
                };
                img.src = canvasState.canvasDataURL;
              }
            }
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
  }, [drawingId]);

  // 캔버스 데이터를 JSON으로 직렬화
  const serializeCanvasData = useCallback(() => {
    const canvasElement = canvasRef.current;

    // 캔버스 요소가 없거나 null인 경우 처리
    if (!canvasElement) {
      console.warn("Canvas element not found, creating empty canvas data");
      return JSON.stringify({
        stickers,
        photos,
        canvasDataURL: "", // 빈 캔버스
        timestamp: new Date().toISOString(),
      });
    }

    try {
      const canvasDataURL = canvasElement.toDataURL();
      return JSON.stringify({
        stickers,
        photos,
        canvasDataURL,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to get canvas data URL:", error);
      // 오류 발생시 기본값 반환
      return JSON.stringify({
        stickers,
        photos,
        canvasDataURL: "",
        timestamp: new Date().toISOString(),
      });
    }
  }, [stickers, photos]);

  // 썸네일 생성
  const generateThumbnail = useCallback(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) {
      console.warn("Canvas element not found for thumbnail generation");
      return "";
    }

    try {
      // 작은 크기의 썸네일 생성
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
  const saveDrawing = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const canvasData = serializeCanvasData();
      const thumbnail = generateThumbnail();

      // 로그인 상태 확인
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error("로그인이 필요합니다.");
      }

      // 디버깅: 실제 전송되는 데이터 확인
      console.log("=== 드로잉 저장 디버깅 ===");
      console.log("Title:", title);
      console.log("CanvasData length:", canvasData?.length || 0);
      console.log(
        "CanvasData preview:",
        canvasData?.substring(0, 200) || "EMPTY"
      );
      console.log("Thumbnail length:", thumbnail?.length || 0);
      console.log("Canvas element exists:", !!canvasRef.current);
      console.log("Stickers count:", stickers.length);
      console.log("Photos count:", photos.length);

      // 캔버스 데이터가 완전히 비어있는 경우에만 경고 (빈 캔버스는 허용)
      if (!canvasData) {
        console.warn("캔버스 데이터가 null/undefined입니다.");
        setSaveError("데이터 생성에 실패했습니다. 페이지를 새로고침해주세요.");
        return;
      }

      if (drawingId) {
        // 기존 문서 업데이트
        await drawingAPI.updateDrawing(drawingId, {
          title,
          canvasData,
          thumbnail,
        });
      } else {
        // 새 문서 생성 - userId는 백엔드에서 자동 설정
        const createRequest: CreateDrawingRequest = {
          title,
          canvasData,
          thumbnail,
        };

        console.log("Sending request:", createRequest);
        const newDrawing = await drawingAPI.createDrawing(createRequest);

        // 새로 생성된 경우 URL 업데이트
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
  const handleBackToHome = useCallback(async () => {
    if (isSaving) return;

    try {
      await saveDrawing();
      navigate("/");
    } catch {
      // 저장 실패해도 홈으로 이동
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
      <GuideSlide />

      {/* 에러 메시지 */}
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

      {/* 상단 툴바 */}
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

      {/* 사이드바 + 캔버스 영역 */}
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
