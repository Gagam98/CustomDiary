import {
  Grid,
  Users,
  Star,
  LogOut,
  User,
  Settings,
  HelpCircle,
  Shield,
  Bell,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

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
  const [showUserSheet, setShowUserSheet] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

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

  // 시트 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sheetRef.current &&
        !sheetRef.current.contains(event.target as Node)
      ) {
        setShowUserSheet(false);
      }
    };

    if (showUserSheet) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserSheet]);

  const handleLogout = () => {
    // 로그아웃 확인
    if (window.confirm("로그아웃하시겠습니까?")) {
      // localStorage에서 유저 정보 제거
      localStorage.removeItem("user");
      // 로그인 페이지로 이동
      navigate("/login", { replace: true });
    }
    setShowUserSheet(false);
  };

  const handleUserClick = () => {
    setShowUserSheet(!showUserSheet);
  };

  // 이메일에서 사용자명 추출 (@ 앞부분)
  const getDisplayName = (email: string): string => {
    return email.split("@")[0];
  };

  // 더미 기능 핸들러들
  const handleSettings = () => {
    alert("설정 기능은 준비 중입니다.");
    setShowUserSheet(false);
  };

  const handleHelp = () => {
    alert("도움말 기능은 준비 중입니다.");
    setShowUserSheet(false);
  };

  const handlePrivacy = () => {
    alert("개인정보 설정 기능은 준비 중입니다.");
    setShowUserSheet(false);
  };

  const handleNotifications = () => {
    alert("알림 설정 기능은 준비 중입니다.");
    setShowUserSheet(false);
  };

  return (
    <aside className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col relative">
      {/* 유저 정보 섹션 */}
      {userInfo && (
        <div className="px-4 py-4 bg-gray-100 relative">
          <button
            onClick={handleUserClick}
            className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userInfo.name || getDisplayName(userInfo.email)}
              </p>
              <p className="text-xs text-gray-500 truncate">{userInfo.email}</p>
            </div>
            <ChevronUp
              size={16}
              className={`text-gray-400 transition-transform ${
                showUserSheet ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* 사용자 시트 */}
          {showUserSheet && (
            <div
              ref={sheetRef}
              className="absolute top-full left-4 right-4 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2"
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {userInfo.name || getDisplayName(userInfo.email)}
                </p>
                <p className="text-xs text-gray-500">{userInfo.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={handleSettings}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={16} />
                  <span>설정</span>
                </button>

                <button
                  onClick={handleNotifications}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Bell size={16} />
                  <span>알림 설정</span>
                </button>

                <button
                  onClick={handlePrivacy}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Shield size={16} />
                  <span>개인정보 보호</span>
                </button>

                <button
                  onClick={handleHelp}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <HelpCircle size={16} />
                  <span>도움말</span>
                </button>

                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>로그아웃</span>
                  </button>
                </div>
              </div>
            </div>
          )}
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
