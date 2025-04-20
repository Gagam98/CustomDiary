import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { Bell, Settings, MoreVertical, Search } from "lucide-react";
import { useState } from "react";
import DocumentsSection from "./DocumentsSection";
import FavoritesSection from "./FavoritesSection";
import SharedSection from "./SharedSection";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sortBy, setSortBy] = useState("date");
  const [searchTerm, setSearchTerm] = useState("");
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

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    console.log("Searching for:", searchTerm);
  };

  return (
    <div className="flex h-screen bg-gray-50">
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

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center px-6 py-3 border-b border-gray-200">
          <h1 className="text-lg font-medium">
            {location.pathname === "/shared"
              ? "공유됨"
              : location.pathname === "/favorites"
              ? "즐겨찾기"
              : "문서"}
          </h1>
          <div className="flex items-center space-x-1">
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
        {location.pathname === "/" ? (
          <DocumentsSection
            documents={documents}
            setDocuments={setDocuments}
            sortBy={sortBy}
          />
        ) : location.pathname === "/favorites" ? (
          <FavoritesSection documents={documents} setDocuments={setDocuments} />
        ) : (
          <SharedSection documents={documents} searchTerm={searchTerm} />
        )}
      </main>
    </div>
  );
}
