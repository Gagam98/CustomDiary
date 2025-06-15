import { Grid, Users, Star, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface SidebarProps {
  onNavigate?: (section: string) => void;
  activeSection: string;
}

interface UserInfo {
  email: string;
  name?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, activeSection }) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    // localStorage에서 유저 정보 가져오기
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserInfo(JSON.parse(storedUser));
      } catch (error) {
        console.error("유저 정보 파싱 오류:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogout = () => {
    // 로그아웃 확인
    if (window.confirm("로그아웃하시겠습니까?")) {
      // localStorage에서 유저 정보 제거
      localStorage.removeItem("user");
      // 로그인 페이지로 이동
      navigate("/login", { replace: true });
    }
  };

  // 이메일에서 사용자명 추출 (@ 앞부분)
  const getDisplayName = (email: string): string => {
    return email.split("@")[0];
  };

  return (
    <aside className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
      {/* 유저 정보 섹션 */}
      {userInfo && (
        <div className="px-4 py-4 bg-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userInfo.name || getDisplayName(userInfo.email)}
              </p>
              <p className="text-xs text-gray-500 truncate">{userInfo.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut size={16} />
            <span>로그아웃</span>
          </button>
        </div>
      )}

      {/* 구분선 */}
      {userInfo && <div className="border-t border-gray-300 mx-4"></div>}

      {/* 네비게이션 메뉴 */}
      <nav className="flex-1 space-y-1 px-2 pt-4">
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
