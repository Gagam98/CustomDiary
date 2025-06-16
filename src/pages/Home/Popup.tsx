import { useEffect, useState } from "react";

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDocument: (title: string) => Promise<void>;
}

const Popup = ({ isOpen, onClose, onCreateDocument }: PopupProps) => {
  const [title, setTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTitle(""); // 팝업이 열릴 때마다 제목 초기화
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleCreate = async () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    try {
      setIsCreating(true);
      await onCreateDocument(title.trim());
      onClose();
    } catch (error) {
      console.error("Failed to create document:", error);
      alert("문서 생성에 실패했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isCreating) {
      handleCreate();
    }
  };

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
            <button className="px-3 py-1 bg-gray-200 rounded">모눈종이</button>
          </div>
          <input
            type="text"
            placeholder="제목을 입력하세요"
            className="w-full mt-2 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isCreating}
            autoFocus
          />
        </div>

        {/* 버튼 */}
        <div className="mt-6 flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
            onClick={onClose}
            disabled={isCreating}
          >
            취소
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCreate}
            disabled={isCreating || !title.trim()}
          >
            {isCreating ? "생성 중..." : "생성"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
