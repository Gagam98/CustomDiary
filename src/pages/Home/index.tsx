import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { Bell, Settings, MoreVertical } from "lucide-react";
import { useState } from "react";
import DocumentsSection from "./DocumentsSection";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sortBy, setSortBy] = useState("date");

  const handleSearch = (searchTerm: string) => {
    console.log("Searching for:", searchTerm);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        onSearch={handleSearch}
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
          <DocumentsSection sortBy={sortBy} />
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
