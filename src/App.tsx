import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Canvas from "./pages/Canvas/Index";
import DocumentsSection from "./pages/Home/DocumentsSection";
import SharedSection from "./pages/Home/SharedSection";
import FavoritesSection from "./pages/Home/FavoritesSection";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Home 안에서 nested route */}
        <Route path="/" element={<Home />}>
          <Route index element={<DocumentsSection sortBy="date" />} />
          <Route path="shared" element={<SharedSection />} />
          <Route path="favorites" element={<FavoritesSection />} />
        </Route>

        {/* 기타 예: 캔버스는 독립 */}
        <Route path="/canvas" element={<Canvas />} />
      </Routes>
    </Router>
  );
}
