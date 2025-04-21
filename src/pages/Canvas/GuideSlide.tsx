import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const GuideSlide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={`fixed top-[108px] right-0 flex items-start transition-transform duration-300 z-50 ${
        isOpen ? "translate-x-0" : "translate-x-[calc(100%-32px)]"
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-700 text-white p-2 rounded-l-md h-12 flex items-center justify-center hover:bg-gray-600 transition-colors"
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      <div className="bg-white shadow-lg rounded-l-lg overflow-hidden">
        <img
          src="/guide.png"
          alt="사용 가이드"
          className="max-w-[500px] max-h-[calc(100vh-120px)] object-contain"
        />
      </div>
    </div>
  );
};

export default GuideSlide;
