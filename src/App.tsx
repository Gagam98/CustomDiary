import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Canvas from "./pages/Canvas/Index";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/canvas" element={<Canvas />} />
      </Routes>
    </Router>
  );
}
