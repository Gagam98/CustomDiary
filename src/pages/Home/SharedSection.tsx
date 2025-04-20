interface Document {
  name: string;
  type: string;
  date: string;
  starred: boolean;
}

interface SharedSectionProps {
  documents: Document[];
  searchTerm: string;
}

export default function SharedSection({
  documents,
  searchTerm,
}: SharedSectionProps) {
  // 검색어에 따라 문서 필터링
  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-6 gap-6">
          {filteredDocuments.map((doc, index) => (
            <div key={index} className="flex flex-col h-36 relative">
              {doc.type === "folder" ? (
                <div className="flex flex-col items-center justify-center h-full pb-4 bg-blue-100 rounded-md" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full pb-4 bg-white border border-gray-200 rounded-md">
                  <div className="text-xs text-center px-2 py-1 border-b border-gray-200 w-full text-gray-600 mb-4">
                    MY JOURNAL
                  </div>
                </div>
              )}
              <div className="mt-1 text-center">
                <div className="text-xs font-medium text-gray-800 truncate">
                  {doc.name}
                </div>
                <div className="text-xs text-gray-500">{doc.date}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <img
            src="/shared-placeholder.png"
            alt="No shared files"
            className="mx-auto mb-4 w-48 h-48 opacity-50"
          />
          <h2 className="text-xl font-medium text-gray-700 mb-2">
            공유된 파일이 없습니다
          </h2>
          <p className="text-gray-500">
            다른 사용자와 공유된 파일이 여기에 표시됩니다
          </p>
        </div>
      )}
    </div>
  );
}
