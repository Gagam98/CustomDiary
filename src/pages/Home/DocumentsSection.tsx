import { useState } from "react";
import { Star } from "lucide-react";
import Popup from "./Popup";

interface DocumentsSectionProps {
  sortBy: string;
}

export default function DocumentsSection({ sortBy }: DocumentsSectionProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [documents, setDocuments] = useState([
    {
      name: "Test01",
      type: "folder",
      date: "2023. 3. 23. 오후 6:00",
      starred: true,
    },
    {
      name: "GoodNoteStickers",
      type: "folder",
      date: "2023. 6. 30. 오전 9:32",
      starred: true,
    },
    {
      name: "2024_Plantify_diary_Monday",
      type: "file",
      date: "2023. 11. 15. 오전 11:56",
      starred: false,
    },
    {
      name: "Test02",
      type: "folder",
      date: "2022. 6. 20. 오전 9:34",
      starred: true,
    },
    {
      name: "Test03",
      type: "folder",
      date: "2022. 6. 26. 오전 9:33",
      starred: false,
    },
    {
      name: "Test04",
      type: "folder",
      date: "2022. 6. 26. 오전 9:32",
      starred: true,
    },
    {
      name: "계획표",
      type: "folder",
      date: "2022. 4. 28. 오후 7:56",
      starred: false,
    },
    {
      name: "독서노트",
      type: "folder",
      date: "2022. 4. 28. 오후 7:52",
      starred: true,
    },
  ]);

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
    } else if (sortBy === "type") {
      if (a.starred !== b.starred) {
        return a.starred ? -1 : 1;
      }
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
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(
                        documents.findIndex((d) => d.name === doc.name)
                      );
                    }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(
                        documents.findIndex((d) => d.name === doc.name)
                      );
                    }}
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
