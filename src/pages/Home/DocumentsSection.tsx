import { Star, MoreVertical, Trash2 } from "lucide-react";
import Popup from "./Popup";
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

interface DocumentsSectionProps {
  documents: UIDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<UIDocument[]>>;
  sortBy: string;
  onUpdateDocument: (
    documentId: number,
    updates: DocumentUpdates
  ) => Promise<void>;
  onDeleteDocument: (documentId: number) => Promise<void>;
  onCreateDocument: (title: string) => Promise<void>;
  onOpenDocument: (document: UIDocument) => void;
}

export default function DocumentsSection({
  documents,
  // setDocuments,
  sortBy,
  onUpdateDocument,
  onDeleteDocument,
  onCreateDocument,
  onOpenDocument,
}: DocumentsSectionProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showMenuIndex, setShowMenuIndex] = useState<number | null>(null);

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

  // 정렬된 documents 계산
  const sortedDocuments = [...documents].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  return (
    <div className="p-6 overflow-auto">
      <div className="grid grid-cols-6 gap-6">
        {/* New Document Button */}
        <div
          className="flex flex-col items-center justify-center h-36 border border-dashed border-blue-400 rounded-md bg-white cursor-pointer hover:bg-gray-50 group"
          onClick={() => setIsPopupOpen(true)}
        >
          <div className="text-blue-500 text-3xl mb-1 font-light">+</div>
          <span className="text-xs text-gray-500 group-hover:text-gray-700">
            신규...
          </span>
        </div>

        {/* Document Items */}
        {sortedDocuments.map((doc, index) => (
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
                      className={`cursor-pointer ${
                        doc.starred
                          ? "text-red-500 fill-red-500"
                          : "text-gray-300 hover:text-red-400"
                      }`}
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
                      className={`cursor-pointer ${
                        doc.starred
                          ? "text-red-500 fill-red-500"
                          : "text-gray-300 hover:text-red-400"
                      }`}
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

      <Popup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onCreateDocument={onCreateDocument}
      />

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
