import React, { useState } from "react";
import { useRoomManager } from "../hooks/useRoomManager";

interface RoomCreatorProps {
  onRoomCreated?: (roomId: string) => void;
}

export const RoomCreator: React.FC<RoomCreatorProps> = ({ onRoomCreated }) => {
  const [roomName, setRoomName] = useState("");
  const { createRoom, loading } = useRoomManager();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    try {
      const roomId = await createRoom(roomName);
      setRoomName("");
      onRoomCreated?.(roomId);
      alert(`방이 생성되었습니다! 방 ID: ${roomId}`);
    } catch (error) {
      console.error("방 생성 실패:", error);
    }
  };

  return (
    <div className="room-creator">
      <h3>새 방 만들기</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="방 이름을 입력하세요"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !roomName.trim()}>
          {loading ? "생성 중..." : "방 만들기"}
        </button>
      </form>
    </div>
  );
};
