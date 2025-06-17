import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Canvas from "./pages/Canvas/Index";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Login/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";

import { RoomManager } from "./pages/RoomManager";
import { RoomCanvas } from "./pages/Canvas/RoomCanvas";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 보호된 라우트 */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/canvas"
          element={
            <ProtectedRoute>
              <Canvas />
            </ProtectedRoute>
          }
        />

        {/* 🆕 새로운 협업 그림판 라우트들 */}
        <Route
          path="/rooms"
          element={
            <ProtectedRoute>
              <RoomManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/room/:roomId"
          element={
            <ProtectedRoute>
              <RoomCanvas />
            </ProtectedRoute>
          }
        />

        {/* 와일드카드 라우트 (404 처리 또는 기본 페이지) */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
