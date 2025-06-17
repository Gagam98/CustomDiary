import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useWebSocket } from "../../hooks/useWebsocket";
import { roomAPI, RoomInfo } from "../../utils/api";

export const RoomCanvas: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const userName = searchParams.get("userName") || "Anonymous";

  const { users, isConnected, joinRoom } = useWebSocket();
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roomId) {
      setLoading(true);
      setError(null);

      // 방 정보 가져오기
      roomAPI
        .getRoomInfo(roomId)
        .then((data: RoomInfo) => {
          setRoomInfo(data);
          setLoading(false);
        })
        .catch((err: unknown) => {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "방 정보를 불러오는데 실패했습니다.";
          setError(errorMessage);
          setLoading(false);
        });

      // 웹소켓 연결 후 방 참가
      if (isConnected) {
        joinRoom(roomId, userName);
      }
    }
  }, [roomId, userName, isConnected, joinRoom]);

  if (!roomId) {
    return (
      <div className="error-container">
        <h2>오류</h2>
        <p>잘못된 방 ID입니다.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <h2>로딩 중...</h2>
        <p>방 정보를 불러오고 있습니다.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>오류</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>다시 시도</button>
      </div>
    );
  }

  return (
    <div className="room-canvas">
      <div className="room-header">
        <h2>{roomInfo?.roomName || "로딩 중..."}</h2>
        <p>방 ID: {roomId}</p>
        <p>방장: {roomInfo?.creatorName}</p>
        <div className="connection-status">
          {isConnected ? "🟢 연결됨" : "🔴 연결 끊김"}
        </div>
        <div className="users-list">
          <h4>참가자 ({users.length}명):</h4>
          <div className="user-badges">
            {users.map((user) => (
              <span key={user.id} className="user-badge">
                {user.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="canvas-container">
        {/* TODO: 실제 캔버스 컴포넌트 통합 */}
        <div className="canvas-placeholder">
          <h3>캔버스 영역</h3>
          <p>여기에 실제 그림 캔버스가 들어갑니다.</p>
          <p>현재 방: {roomInfo?.roomName}</p>
          <p>참가자: {users.length}명</p>
        </div>
      </div>
    </div>
  );
};
