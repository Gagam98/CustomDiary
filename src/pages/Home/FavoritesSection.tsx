import { Star } from "lucide-react";

interface Document {
  name: string;
  type: string;
  date: string;
  starred: boolean;
}

interface FavoritesSectionProps {
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
}

export default function FavoritesSection({
  documents,
  setDocuments,
}: FavoritesSectionProps) {
  // 즐겨찾기된 문서만 필터링
  const starredDocuments = documents.filter((doc) => doc.starred);

  // 별표 토글 함수
  const toggleStar = (index: number) => {
    const targetDoc = starredDocuments[index];
    const globalIndex = documents.findIndex(
      (doc) => doc.name === targetDoc.name
    );

    if (globalIndex !== -1) {
      setDocuments(
        documents.map((doc, i) =>
          i === globalIndex ? { ...doc, starred: !doc.starred } : doc
        )
      );
    }
  };

  return (
    <div className="p-6 overflow-auto">
      <div className="grid grid-cols-6 gap-6">
        {starredDocuments.map((doc, index) => (
          <div key={index} className="flex flex-col h-36 relative">
            {doc.type === "folder" ? (
              <div className="flex flex-col items-center justify-center h-full pb-4 bg-blue-100 rounded-md">
                <div className="absolute top-1 right-1">
                  <Star
                    size={16}
                    className={`cursor-pointer text-red-500 fill-red-500`}
                    onClick={() => toggleStar(index)}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full pb-4 bg-white border border-gray-200 rounded-md">
                <div className="text-xs text-center px-2 py-1 border-b border-gray-200 w-full text-gray-600 mb-4">
                  MY JOURNAL
                </div>
                <div className="absolute top-1 right-1">
                  <Star
                    size={16}
                    className={`cursor-pointer text-red-500 fill-red-500`}
                    onClick={() => toggleStar(index)}
                  />
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
    </div>
  );
}
