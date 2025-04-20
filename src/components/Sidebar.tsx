import { Search, Grid, Users, Star } from "lucide-react";

interface SidebarProps {
  onSearch?: (searchTerm: string) => void;
  onNavigate?: (section: string) => void;
  activeSection: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  onSearch,
  onNavigate,
  activeSection,
}) => {
  return (
    <aside className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="검색"
            className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded"
            onChange={(e) => onSearch?.(e.target.value)}
          />
          <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
        </div>
      </div>
      <nav className="space-y-1 px-2">
        <button
          className={`w-full flex items-center text-left space-x-3 px-3 py-2.5 rounded font-medium text-gray-700 ${
            activeSection === "documents" ? "bg-gray-200" : "hover:bg-gray-200"
          }`}
          onClick={() => onNavigate?.("documents")}
        >
          <Grid size={18} />
          <span className="text-sm">문서</span>
        </button>
        <button
          className={`w-full flex items-center text-left space-x-3 px-3 py-2.5 rounded text-gray-700 ${
            activeSection === "shared" ? "bg-gray-200" : "hover:bg-gray-200"
          }`}
          onClick={() => onNavigate?.("shared")}
        >
          <Users size={18} />
          <span className="text-sm">공유됨</span>
        </button>
        <button
          className={`w-full flex items-center text-left space-x-3 px-3 py-2.5 rounded text-gray-700 ${
            activeSection === "favorites" ? "bg-gray-200" : "hover:bg-gray-200"
          }`}
          onClick={() => onNavigate?.("favorites")}
        >
          <Star size={18} />
          <span className="text-sm">즐겨찾기</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
