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
    <aside className="w-72 bg-white/40 backdrop-blur-xl border-r border-white/50 flex flex-col relative shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)] z-20">
      {/* 유저 정보 섹션 */}
      {userInfo && (
        <div className="px-4 py-6 relative">
          <button
            onClick={handleUserClick}
            className="w-full flex items-center space-x-3 p-3 rounded-2xl hover:bg-white/60 hover:shadow-sm transition-all duration-300 border border-transparent hover:border-gray-200/40 group focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <div className="w-11 h-11 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 group-active:scale-95 transition-transform duration-300">
              <User size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-bold text-slate-800 truncate tracking-tight">
                {userInfo.name || getDisplayName(userInfo.email)}
              </p>
              <p className="text-xs text-slate-500 truncate font-medium mt-0.5">{userInfo.email}</p>
            </div>
            <ChevronUp
              size={18}
              className={`text-slate-400 transition-transform duration-300 ease-spring ${
                showUserSheet ? "rotate-180 text-indigo-500" : ""
              }`}
            />
          </button>

          {/* 사용자 시트 */}
          {showUserSheet && (
            <div
              ref={sheetRef}
              className="absolute top-[85%] left-4 right-4 mt-2 bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] z-50 py-2 transform origin-top animate-out overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100/80 bg-slate-50/50">
                <p className="text-sm font-bold text-gray-900 tracking-tight">
                  {userInfo.name || getDisplayName(userInfo.email)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{userInfo.email}</p>
              </div>

              <div className="py-2 px-2 space-y-1">
                <button
                  onClick={handleSettings}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/80 transition-all duration-200 outline-none"
                >
                  <Settings size={18} />
                  <span>설정</span>
                </button>

                <button
                  onClick={handleNotifications}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/80 transition-all duration-200 outline-none"
                >
                  <Bell size={18} />
                  <span>알림 설정</span>
                </button>

                <button
                  onClick={handlePrivacy}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/80 transition-all duration-200 outline-none"
                >
                  <Shield size={18} />
                  <span>개인정보 보호</span>
                </button>

                <button
                  onClick={handleHelp}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/80 transition-all duration-200 outline-none"
                >
                  <HelpCircle size={18} />
                  <span>도움말</span>
                </button>

                <div className="mx-4 my-2 border-t border-gray-100/80"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50/80 transition-all duration-200 outline-none"
                  >
                    <LogOut size={18} />
                    <span>로그아웃</span>
                  </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 구분선 */}
      {userInfo && (
        <div className="px-6 w-full">
          <div className="w-full border-t border-gray-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"></div>
        </div>
      )}

      {/* 네비게이션 메뉴 */}
      <nav className="flex-1 space-y-2.5 px-5 pt-8">
        <button
          className={`w-full flex items-center text-left space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden outline-none ${
            activeSection === "documents" 
              ? "bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-200/60 text-indigo-600" 
              : "text-slate-600 hover:bg-white/50 hover:text-slate-900 border border-transparent"
          }`}
          onClick={() => onNavigate?.("documents")}
        >
          {activeSection === "documents" && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-indigo-500 rounded-r-full"></div>
          )}
          <Grid size={22} className={`transition-colors duration-300 ${activeSection === "documents" ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-500"}`} />
          <span className="text-[15px] font-semibold tracking-tight">내 문서</span>
        </button>
        <button
          className={`w-full flex items-center text-left space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden outline-none ${
            activeSection === "shared" 
              ? "bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-200/60 text-indigo-600" 
              : "text-slate-600 hover:bg-white/50 hover:text-slate-900 border border-transparent"
          }`}
          onClick={() => onNavigate?.("shared")}
        >
          {activeSection === "shared" && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-indigo-500 rounded-r-full"></div>
          )}
          <Users size={22} className={`transition-colors duration-300 ${activeSection === "shared" ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-500"}`} />
          <span className="text-[15px] font-semibold tracking-tight">공유됨</span>
        </button>
        <button
          className={`w-full flex items-center text-left space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden outline-none ${
            activeSection === "favorites" 
              ? "bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-200/60 text-indigo-600" 
              : "text-slate-600 hover:bg-white/50 hover:text-slate-900 border border-transparent"
          }`}
          onClick={() => onNavigate?.("favorites")}
        >
          {activeSection === "favorites" && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-amber-400 rounded-r-full"></div>
          )}
          <Star size={22} className={`transition-all duration-300 ${activeSection === "favorites" ? "text-amber-500 drop-shadow-sm" : "text-slate-400 group-hover:text-amber-400"}`} />
          <span className="text-[15px] font-semibold tracking-tight">즐겨찾기</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
