interface UIDocument {
  id?: number;
  name: string;
  type: "file" | "folder";
  date: string;
  starred: boolean;
  canvasData?: string;
  thumbnail?: string;
}

interface SharedSectionProps {
  documents: UIDocument[];
  searchTerm: string;
  onOpenDocument: (document: UIDocument) => void;
}

export default function SharedSection({
  documents,
  searchTerm,
  onOpenDocument,
}: SharedSectionProps) {
  // 검색어에 따라 문서 필터링 (실제로는 공유된 문서만 표시해야 함)
  // 현재는 모든 문서를 공유된 것으로 간주
  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="p-6 overflow-auto">
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-6 gap-6">
          {filteredDocuments.map((doc, index) => (
            <div
              key={doc.id || index}
              className="flex flex-col h-36 relative group"
            >
              <div className="relative">
                {doc.type === "folder" ? (
                  <div
                    className="flex flex-col items-center justify-center h-32 pb-4 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-200"
                    onClick={() => onOpenDocument(doc)}
                  />
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
                    {/* 공유 표시 아이콘 */}
                    <div className="absolute top-1 left-1">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
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
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto mb-4 w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-16 h-16 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-700 mb-2">
            {searchTerm
              ? `"${searchTerm}"에 대한 검색 결과가 없습니다`
              : "공유된 파일이 없습니다"}
          </h2>
          <p className="text-gray-500">
            {searchTerm
              ? "다른 검색어를 시도해보세요"
              : "다른 사용자와 공유된 파일이 여기에 표시됩니다"}
          </p>
        </div>
      )}
    </div>
  );
}
