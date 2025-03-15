import * as React from "react";
import { useState } from "react";
import { Menu, X, Search } from "lucide-react";

interface HeaderProps {
  color?: string;
}

const Header: React.FC<HeaderProps> = ({ color = "transparent" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="w-full" style={{ backgroundColor: color }}>
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          {/* Logo */}
          <h1 className="text-xl font-bold">LOGO</h1>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <button className="text-black hover:text-white transition-colors">
              글쓰기
            </button>
            <button className="text-black hover:text-white transition-colors">
              전체보기
            </button>
            <button
              className="text-black hover:text-white transition-colors"
              onClick={() => setIsSearchOpen(true)}
            >
              검색
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-black hover:text-white transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-lg p-4 flex flex-col items-center space-y-3">
            <button className="text-black hover:text-white transition-colors">
              글쓰기
            </button>
            <button className="text-black hover:text-white transition-colors">
              전체보기
            </button>
            <button
              className="text-black hover:text-white transition-colors"
              onClick={() => setIsSearchOpen(true)}
            >
              검색
            </button>
          </div>
        )}
      </header>

      {/* 검색 팝업 */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50">
          <div className="relative w-full max-w-3xl bg-gray-900 p-8 rounded-lg">
            {/* 로고 및 닫기 버튼 */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-white text-2xl font-bold">LOGO</h1>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            {/* 검색 입력창 */}
            <div className="flex items-center bg-white rounded-lg shadow-md w-full">
              <div className="px-4">
                <Search size={20} className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="주제, 필진, 시리즈 검색"
                className="w-full h-10 text-lg p-3 text-gray-800 outline-none"
              />
              <button className="bg-blue-500 text-white px-6 h-10 rounded-r-lg text-lg">
                검색
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
