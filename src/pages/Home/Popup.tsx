import { useEffect } from "react";

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const Popup = ({ isOpen, onClose }: PopupProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <h2 className="text-lg font-semibold mb-4">새로운 노트북</h2>

        {/* 노트북 스타일 선택 */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">표지</span>
            <button className="px-3 py-1 bg-gray-200 rounded">
              기본 다이어리
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">종이</span>
            <button className="px-3 py-1 bg-gray-200 rounded">백지</button>
          </div>
          <input
            type="text"
            placeholder="제목을 입력하세요"
            className="w-full mt-2 px-3 py-2 border rounded"
          />
        </div>

        {/* 버튼 */}
        <div className="mt-6 flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
            onClick={onClose}
          >
            취소
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            생성
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
