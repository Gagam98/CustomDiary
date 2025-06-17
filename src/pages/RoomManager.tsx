import React, { useState } from "react";
import { RoomCreator } from "../components/RoomCreator";
import { RoomList } from "../components/RoomList";
import { useNavigate } from "react-router-dom";

export const RoomManager: React.FC = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const handleRoomSelect = (roomId: string) => {
    if (!userName.trim()) {
      alert("사용자 이름을 입력해주세요.");
      return;
    }
    // 협업 캔버스 페이지로 이동
    navigate(`/room/${roomId}?userName=${encodeURIComponent(userName)}`);
  };

  return (
    <div className="room-manager">
      <h2>실시간 협업 그림판</h2>

      <div className="user-input">
        <label>
          사용자 이름:
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="이름을 입력하세요"
          />
        </label>
      </div>

      <div className="room-sections">
        <RoomCreator onRoomCreated={handleRoomSelect} />
        <RoomList onRoomSelect={handleRoomSelect} />
      </div>
    </div>
  );
};
