import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();

  // localStorage에서 사용자 정보 확인
  const user = localStorage.getItem("user");

  // 사용자가 로그인하지 않은 경우 로그인 페이지로 리디렉션
  if (!user) {
    // 현재 경로를 state로 전달하여 로그인 후 원래 페이지로 돌아갈 수 있게 함
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
