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

// 썸네일 이미지 컴포넌트 - 순수 미리보기만 표시
const ThumbnailImage: React.FC<{ document: UIDocument }> = ({ document }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  // 썸네일이 없거나 에러가 발생한 경우 기본 표시
  if (!document.thumbnail || imageError) {
    return (
      <div className="w-full h-24 bg-gray-50 flex items-center justify-center rounded-t-md">
        <div className="text-center text-gray-300">
          <svg
            className="w-8 h-8 mx-auto mb-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs">미리보기 없음</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-24 bg-gray-50 rounded-t-md overflow-hidden">
      {/* 로딩 중일 때 표시 */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}

      <img
        src={document.thumbnail}
        alt={`${document.name} 미리보기`}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
};

// 문서 카드 컴포넌트
const DocumentCard: React.FC<{
  doc: UIDocument;
  index: number;
  showMenuIndex: number | null;
  onToggleStar: (doc: UIDocument) => void;
  onOpenDocument: (doc: UIDocument) => void;
  onShowMenu: (index: number | null) => void;
  onDelete: (doc: UIDocument) => void;
}> = ({
  doc,
  index,
  showMenuIndex,
  onToggleStar,
  onOpenDocument,
  onShowMenu,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString("ko-KR", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

    if (diffDays === 1) return `오늘 ${formatTime(date)}`;
    if (diffDays === 2) return `어제 ${formatTime(date)}`;
    if (diffDays <= 7) return `${diffDays - 1}일 전 ${formatTime(date)}`;

    const dateStr = date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });

    return `${dateStr} ${formatTime(date)}`;
  };

  if (doc.type === "folder") {
    return (
      <div className="flex flex-col h-36 relative group">
        <div className="relative">
          <div
            className="flex flex-col items-center justify-center h-32 pb-4 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-200 transition-colors"
            onClick={() => onOpenDocument(doc)}
          >
            <div className="text-blue-600 text-4xl mb-2">📁</div>
            <span className="text-sm text-blue-700 font-medium">폴더</span>

            {/* 상단 우측 버튼들 */}
            <div className="absolute top-2 right-2 flex gap-1">
              <Star
                size={16}
                className={`cursor-pointer transition-colors ${
                  doc.starred
                    ? "text-red-500 fill-red-500"
                    : "text-gray-300 hover:text-red-400"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar(doc);
                }}
              />
              <div className="relative">
                <MoreVertical
                  size={16}
                  className="cursor-pointer text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowMenu(showMenuIndex === index ? null : index);
                  }}
                />
                {showMenuIndex === index && (
                  <div className="absolute right-0 top-6 bg-white border rounded-md shadow-lg py-1 z-10 min-w-[120px]">
                    <button
                      className="flex items-center px-3 py-1 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(doc);
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
        </div>

        {/* 하단 정보 */}
        <div className="mt-1 text-center">
          <div className="text-xs font-medium text-gray-800 truncate px-1">
            {doc.name}
          </div>
          <div className="text-xs text-gray-500">{formatDate(doc.date)}</div>
        </div>
      </div>
    );
  }

  // 파일 타입 문서
  return (
    <div className="flex flex-col h-36 relative group">
      <div className="relative">
        <div
          className="flex flex-col h-32 bg-white border border-gray-200 rounded-md cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
          onClick={() => onOpenDocument(doc)}
        >
          {/* 썸네일 영역 - 순수 미리보기만 표시 */}
          <ThumbnailImage document={doc} />

          {/* 하단 여백 (썸네일과 카드 하단 사이의 공간) */}
          <div className="flex-1 min-h-[2rem]"></div>

          {/* 상단 우측 버튼들 */}
          <div className="absolute top-2 right-2 flex gap-1 bg-white bg-opacity-90 rounded shadow-sm p-1">
            <Star
              size={16}
              className={`cursor-pointer transition-colors ${
                doc.starred
                  ? "text-red-500 fill-red-500"
                  : "text-gray-300 hover:text-red-400"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(doc);
              }}
            />
            <div className="relative">
              <MoreVertical
                size={16}
                className="cursor-pointer text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowMenu(showMenuIndex === index ? null : index);
                }}
              />
              {showMenuIndex === index && (
                <div className="absolute right-0 top-6 bg-white border rounded-md shadow-lg py-1 z-10 min-w-[120px]">
                  <button
                    className="flex items-center px-3 py-1 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(doc);
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
      </div>

      {/* 하단 정보 - 카드 외부에 표시 */}
      <div className="mt-1 text-center">
        <div className="text-xs font-medium text-gray-800 truncate px-1">
          {doc.name}
        </div>
        <div className="text-xs text-gray-500">{formatDate(doc.date)}</div>
      </div>
    </div>
  );
};

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
          className="flex flex-col items-center justify-center h-36 border border-dashed border-blue-400 rounded-md bg-white cursor-pointer hover:bg-gray-50 group transition-colors"
          onClick={() => setIsPopupOpen(true)}
        >
          <div className="text-blue-500 text-3xl mb-1 font-light">+</div>
          <span className="text-xs text-gray-500 group-hover:text-gray-700">
            신규...
          </span>
        </div>

        {/* Document Items */}
        {sortedDocuments.map((doc, index) => (
          <DocumentCard
            key={doc.id || index}
            doc={doc}
            index={index}
            showMenuIndex={showMenuIndex}
            onToggleStar={toggleStar}
            onOpenDocument={onOpenDocument}
            onShowMenu={setShowMenuIndex}
            onDelete={handleDelete}
          />
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
