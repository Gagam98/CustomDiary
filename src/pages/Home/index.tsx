import { useState } from "react";
import Popup from "./Popup"; // 팝업 컴포넌트 추가
import {
  Star,
  Users,
  Grid,
  Bell,
  Settings,
  MoreVertical,
  Search,
} from "lucide-react";

export default function GoodNotesUI() {
  const [isPopupOpen, setIsPopupOpen] = useState(false); // 팝업 상태 추가
  const [sortBy, setSortBy] = useState("date"); // 정렬 상태 추가
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

  // 별표 토글 함수 추가
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
      // starred가 true인 항목을 먼저 정렬
      if (a.starred !== b.starred) {
        return a.starred ? -1 : 1;
      }
      // starred가 같은 경우 이름으로 정렬
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="검색"
              className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded"
            />
            <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <nav className="space-y-1 px-2">
          <button className="w-full flex items-center text-left space-x-3 px-3 py-2.5 bg-gray-200 rounded font-medium text-gray-700">
            <Grid size={18} />
            <span className="text-sm">문서</span>
          </button>
          <button className="w-full flex items-center text-left space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-200 rounded">
            <Users size={18} />
            <span className="text-sm">공유됨</span>
          </button>
          <button className="w-full flex items-center text-left space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-200 rounded">
            <Star size={18} />
            <span className="text-sm">즐겨찾기</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-3 border-b border-gray-200">
          <h1 className="text-lg font-medium">문서</h1>
          <div className="flex items-center space-x-1">
            <div className="bg-gray-100 rounded-md flex mr-2">
              <button
                className={`px-3 py-1 text-xs font-medium ${
                  sortBy === "date"
                    ? "bg-white rounded-md border border-gray-200 shadow-sm"
                    : ""
                }`}
                onClick={() => setSortBy("date")}
              >
                날짜
              </button>
              <button
                className={`px-3 py-1 text-xs font-medium ${
                  sortBy === "name"
                    ? "bg-white rounded-md border border-gray-200 shadow-sm"
                    : ""
                }`}
                onClick={() => setSortBy("name")}
              >
                이름
              </button>
              <button
                className={`px-3 py-1 text-xs font-medium ${
                  sortBy === "type"
                    ? "bg-white rounded-md border border-gray-200 shadow-sm"
                    : ""
                }`}
                onClick={() => setSortBy("type")}
              >
                유형
              </button>
            </div>
            <button className="p-1.5 rounded-full hover:bg-gray-100">
              <MoreVertical size={18} className="text-gray-500" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-gray-100">
              <Bell size={18} className="text-gray-500" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-gray-100">
              <Settings size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="p-6 overflow-auto">
          <div className="grid grid-cols-6 gap-6">
            {/* New Document Button - 클릭하면 팝업 열기 */}
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
        </div>
      </main>

      {/* 팝업 추가 */}
      <Popup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </div>
  );
}
