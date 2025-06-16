import { Star, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";

interface UIDocument {
  id?: number;
  name: string;
  type: "file" | "folder";
  date: string;
  starred: boolean;
  canvasData?: string;
  thumbnail?: string;
}

// 문서 업데이트를 위한 타입 정의
interface DocumentUpdates {
  name?: string;
  starred?: boolean;
  canvasData?: string;
  thumbnail?: string;
  date?: string;
}

interface FavoritesSectionProps {
  documents: UIDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<UIDocument[]>>;
  onUpdateDocument: (
    documentId: number,
    updates: DocumentUpdates
  ) => Promise<void>;
  onDeleteDocument: (documentId: number) => Promise<void>;
  onOpenDocument: (document: UIDocument) => void;
}

export default function FavoritesSection({
  documents,
  // setDocuments,
  onUpdateDocument,
  onDeleteDocument,
  onOpenDocument,
}: FavoritesSectionProps) {
  const [showMenuIndex, setShowMenuIndex] = useState<number | null>(null);

  // 즐겨찾기된 문서만 필터링
  const starredDocuments = documents.filter((doc) => doc.starred);

  // 별표 토글 함수
  const toggleStar = async (document: UIDocument) => {
    if (document.id) {
      await onUpdateDocument(document.id, { starred: !document.starred });
    }
  };

  // 문서 삭제 함수
  const handleDelete = async (document: UIDocument) => {
    if (document.id && window.confirm("정말로 이 문서를 삭제하시겠습니까?")) {
      await onDeleteDocument(document.id);
    }
    setShowMenuIndex(null);
  };

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "오늘";
    if (diffDays === 2) return "어제";
    if (diffDays <= 7) return `${diffDays - 1}일 전`;

    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  if (starredDocuments.length === 0) {
    return (
      <div className="p-6 overflow-auto">
        <div className="text-center py-12">
          <div className="mx-auto mb-4 w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <Star size={64} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-medium text-gray-700 mb-2">
            즐겨찾기한 파일이 없습니다
          </h2>
          <p className="text-gray-500">
            문서에서 별표를 클릭하여 즐겨찾기에 추가하세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-auto">
      <div className="grid grid-cols-6 gap-6">
        {starredDocuments.map((doc, index) => (
          <div
            key={doc.id || index}
            className="flex flex-col h-36 relative group"
          >
            <div className="relative">
              {doc.type === "folder" ? (
                <div
                  className="flex flex-col items-center justify-center h-32 pb-4 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-200"
                  onClick={() => onOpenDocument(doc)}
                >
                  <div className="absolute top-1 right-1 flex gap-1">
                    <Star
                      size={16}
                      className="cursor-pointer text-red-500 fill-red-500 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(doc);
                      }}
                    />
                    <div className="relative">
                      <MoreVertical
                        size={16}
                        className="cursor-pointer text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenuIndex(
                            showMenuIndex === index ? null : index
                          );
                        }}
                      />
                      {showMenuIndex === index && (
                        <div className="absolute right-0 top-6 bg-white border rounded-md shadow-lg py-1 z-10 min-w-[120px]">
                          <button
                            className="flex items-center px-3 py-1 text-sm text-red-600 hover:bg-red-50 w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(doc);
                            }}
                          >
                            <Trash2 size={14} className="mr-2" />
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center h-32 pb-4 bg-white border border-gray-200 rounded-md cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onOpenDocument(doc)}
                >
                  {doc.thumbnail ? (
                    <img
                      src={doc.thumbnail}
                      alt={doc.name}
                      className="w-full h-20 object-cover rounded-t-md"
                    />
                  ) : (
                    <div className="text-xs text-center px-2 py-1 border-b border-gray-200 w-full text-gray-600 mb-4">
                      MY JOURNAL
                    </div>
                  )}
                  <div className="absolute top-1 right-1 flex gap-1">
                    <Star
                      size={16}
                      className="cursor-pointer text-red-500 fill-red-500 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(doc);
                      }}
                    />
                    <div className="relative">
                      <MoreVertical
                        size={16}
                        className="cursor-pointer text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenuIndex(
                            showMenuIndex === index ? null : index
                          );
                        }}
                      />
                      {showMenuIndex === index && (
                        <div className="absolute right-0 top-6 bg-white border rounded-md shadow-lg py-1 z-10 min-w-[120px]">
                          <button
                            className="flex items-center px-3 py-1 text-sm text-red-600 hover:bg-red-50 w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(doc);
                            }}
                          >
                            <Trash2 size={14} className="mr-2" />
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-1 text-center">
              <div className="text-xs font-medium text-gray-800 truncate px-1">
                {doc.name}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(doc.date)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 메뉴 닫기용 백그라운드 */}
      {showMenuIndex !== null && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenuIndex(null)}
        />
      )}
    </div>
  );
}
