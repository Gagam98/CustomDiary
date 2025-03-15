import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CanvasPage from "./pages/Canvas/Canvas";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/canvas" element={<CanvasPage />} />
      </Routes>
    </Router>
  );
}
