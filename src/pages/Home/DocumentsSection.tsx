import { Star } from "lucide-react";
import Popup from "./Popup";
import { useState } from "react";

interface Document {
  name: string;
  type: string;
  date: string;
  starred: boolean;
}

interface DocumentsSectionProps {
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  sortBy: string;
}

export default function DocumentsSection({
  documents,
  setDocuments,
  sortBy,
}: DocumentsSectionProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // 별표 토글 함수
  const toggleStar = (index: number) => {
    setDocuments(
      documents.map((doc, i) =>
        i === index ? { ...doc, starred: !doc.starred } : doc
      )
    );
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
          <div key={index} className="flex flex-col h-36 relative">
            {doc.type === "folder" ? (
              <div className="flex flex-col items-center justify-center h-full pb-4 bg-blue-100 rounded-md">
                <div className="absolute top-1 right-1">
                  <Star
                    size={16}
                    className={`cursor-pointer ${
                      doc.starred
                        ? "text-red-500 fill-red-500"
                        : "text-gray-300"
                    }`}
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
                    className={`cursor-pointer ${
                      doc.starred
                        ? "text-red-500 fill-red-500"
                        : "text-gray-300"
                    }`}
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
      <Popup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </div>
  );
}
