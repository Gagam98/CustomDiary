import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { Bell, Settings, MoreVertical, Search } from "lucide-react";
import { useState, useEffect } from "react";
import DocumentsSection from "./DocumentsSection";
import FavoritesSection from "./FavoritesSection";
import SharedSection from "./SharedSection";
import { drawingAPI, Drawing } from "../../utils/apiDrawings";

// Drawing을 UI에서 사용하는 형태로 변환
interface UIDocument {
  id?: number;
  name: string;
  type: "file" | "folder";
  date: string;
  starred: boolean;
  canvasData?: string;
  thumbnail?: string;
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sortBy, setSortBy] = useState("date");
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState<UIDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API에서 데이터 가져오기
  useEffect(() => {
    const fetchDrawings = async () => {
      try {
        setLoading(true);
        const drawings = await drawingAPI.getDrawings();

        // Drawing을 UIDocument 형태로 변환
        const uiDocuments: UIDocument[] = drawings.map((drawing: Drawing) => ({
          id: drawing.id,
          name: drawing.title,
          type: "file" as const,
          date:
            drawing.updatedAt || drawing.createdAt || new Date().toISOString(),
          starred: drawing.starred || false,
          canvasData: drawing.canvasData,
          thumbnail: drawing.thumbnail,
        }));

        setDocuments(uiDocuments);
      } catch (err) {
        console.error("Failed to fetch drawings:", err);
        setError("문서를 불러오는데 실패했습니다.");
        // 에러 시 빈 배열로 설정
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDrawings();
  }, []);

  // 새 문서 생성
  const createNewDocument = async (title: string) => {
    try {
      const newDrawing = await drawingAPI.createDrawing({
        //userId: 1, // 실제로는 현재 로그인한 사용자 ID를 사용
        title: title,
        canvasData: "", // 빈 캔버스로 시작
        thumbnail: "",
        starred: false,
      });

      const newDocument: UIDocument = {
        id: newDrawing.id,
        name: newDrawing.title,
        type: "file",
        date: newDrawing.createdAt || new Date().toISOString(),
        starred: false,
        canvasData: newDrawing.canvasData,
        thumbnail: newDrawing.thumbnail,
      };

      setDocuments((prev) => [newDocument, ...prev]);

      // 새 문서로 이동
      navigate("/canvas", {
        state: { title: title, drawingId: newDrawing.id },
      });
    } catch (err) {
      console.error("Failed to create drawing:", err);
      setError("새 문서 생성에 실패했습니다.");
    }
  };

  // 문서 업데이트 (즐겨찾기 토글 등)
  const updateDocument = async (
    documentId: number,
    updates: Partial<Drawing>
  ) => {
    try {
      await drawingAPI.updateDrawing(documentId, updates);

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                starred: updates.starred ?? doc.starred,
                name: updates.title ?? doc.name,
                date: updates.updatedAt ?? doc.date,
              }
            : doc
        )
      );
    } catch (err) {
      console.error("Failed to update drawing:", err);
      setError("문서 업데이트에 실패했습니다.");
    }
  };

  // 문서 삭제
  const deleteDocument = async (documentId: number) => {
    try {
      await drawingAPI.deleteDrawing(documentId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
    } catch (err) {
      console.error("Failed to delete drawing:", err);
      setError("문서 삭제에 실패했습니다.");
    }
  };

  // 문서 열기
  const openDocument = (document: UIDocument) => {
    if (document.id) {
      navigate("/canvas", {
        state: {
          title: document.name,
          drawingId: document.id,
          canvasData: document.canvasData,
        },
      });
    }
  };

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    console.log("Searching for:", searchTerm);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
          <div className="text-slate-500 font-medium">문서를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl shadow-sm border border-red-100 font-medium">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* 장식용 배경 요소 */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob pointer-events-none z-0"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000 pointer-events-none z-0"></div>
      <div className="absolute -bottom-8 left-40 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000 pointer-events-none z-0"></div>

      <Sidebar
        onNavigate={(section) =>
          navigate(section === "documents" ? "/" : `/${section}`)
        }
        activeSection={
          location.pathname === "/shared"
            ? "shared"
            : location.pathname === "/favorites"
            ? "favorites"
            : "documents"
        }
      />

      <main className="flex-1 flex flex-col overflow-hidden bg-white/60 backdrop-blur-2xl m-2 ml-0 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative z-10">
        <div className="flex justify-between items-center px-8 py-5 border-b border-white/40 bg-white/40 backdrop-blur-md z-10 relative">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            {location.pathname === "/shared"
              ? "공유됨"
              : location.pathname === "/favorites"
              ? "즐겨찾기"
              : "문서"}
          </h1>
          <div className="flex items-center space-x-2">
            {location.pathname === "/" && (
              <div className="bg-gray-100 rounded-md flex mr-2 relative p-0.5 gap-0 w-[94px]">
                <div
                  className={`absolute bg-white rounded-md shadow-sm transition-all duration-300 ease-in-out w-[46px] h-[26px] ${
                    sortBy === "date" ? "translate-x-0" : "translate-x-[46px]"
                  }`}
                />
                <button
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors relative z-10 w-[46px] whitespace-nowrap ${
                    sortBy === "date"
                      ? "text-gray-800"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => setSortBy("date")}
                >
                  날짜
                </button>
                <button
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors relative z-10 w-[46px] whitespace-nowrap ${
                    sortBy === "name"
                      ? "text-gray-800"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => setSortBy("name")}
                >
                  이름
                </button>
              </div>
            )}
            {location.pathname === "/shared" && (
              <div className="relative mr-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="공유된 파일 검색"
                  className="pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded-md w-64"
                />
                <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
              </div>
            )}
            <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-indigo-600">
              <MoreVertical size={20} />
            </button>
            <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-indigo-600">
              <Bell size={20} />
            </button>
            <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-indigo-600">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {location.pathname === "/" ? (
          <DocumentsSection
            documents={documents}
            setDocuments={setDocuments}
            sortBy={sortBy}
            onUpdateDocument={updateDocument}
            onDeleteDocument={deleteDocument}
            onCreateDocument={createNewDocument}
            onOpenDocument={openDocument}
          />
        ) : location.pathname === "/favorites" ? (
          <FavoritesSection
            documents={documents}
            setDocuments={setDocuments}
            onUpdateDocument={updateDocument}
            onDeleteDocument={deleteDocument}
            onOpenDocument={openDocument}
          />
        ) : (
          <SharedSection
            documents={documents}
            searchTerm={searchTerm}
            onOpenDocument={openDocument}
          />
        )}
      </main>
    </div>
  );
}
