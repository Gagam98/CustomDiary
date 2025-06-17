import React from "react";
import { useRoomManager } from "../hooks/useRoomManager";

interface RoomListProps {
  onRoomSelect?: (roomId: string) => void;
}

export const RoomList: React.FC<RoomListProps> = ({ onRoomSelect }) => {
  const { rooms, loading, error, deleteRoom } = useRoomManager();

  const handleDelete = async (roomId: string) => {
    if (window.confirm("정말로 이 방을 삭제하시겠습니까?")) {
      try {
        await deleteRoom(roomId);
      } catch (error) {
        console.error("방 삭제 실패:", error);
      }
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>오류: {error}</div>;

  return (
    <div className="room-list">
      <h3>내가 만든 방 목록</h3>
      {rooms.length === 0 ? (
        <p>생성된 방이 없습니다.</p>
      ) : (
        <ul>
          {rooms.map((room) => (
            <li key={room.roomId} className="room-item">
              <div>
                <h4>{room.roomName}</h4>
                <p>방 ID: {room.roomId}</p>
                <p>생성일: {new Date(room.createdAt).toLocaleString()}</p>
              </div>
              <div className="room-actions">
                <button onClick={() => onRoomSelect?.(room.roomId)}>
                  입장
                </button>
                <button onClick={() => handleDelete(room.roomId)}>삭제</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
