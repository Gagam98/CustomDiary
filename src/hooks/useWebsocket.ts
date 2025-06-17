import { useState, useEffect, useRef, useCallback } from "react";
import {
  createWebSocketMessage,
  parseWebSocketMessage,
  WebSocketMessage,
  WebSocketMessageType,
} from "../utils/websocket";

interface User {
  id: string;
  name: string;
}

interface UseWebSocketReturn {
  socket: WebSocket | null;
  users: User[];
  isConnected: boolean;
  sendMessage: (
    type: WebSocketMessageType,
    data: Record<string, unknown>
  ) => void;
  joinRoom: (roomId: string, userName: string) => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket("ws://localhost:8080/ws/drawing");

      ws.onopen = () => {
        console.log("WebSocket 연결 성공");
        setIsConnected(true);
        setSocket(ws);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message = parseWebSocketMessage(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error("WebSocket 메시지 처리 오류:", error);
        }
      };

      ws.onclose = (event) => {
        console.log("WebSocket 연결 끊김:", event.code, event.reason);
        setIsConnected(false);
        setSocket(null);

        // 자동 재연결 시도
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          console.log(
            `재연결 시도 ${reconnectAttempts.current}/${maxReconnectAttempts}`
          );
          setTimeout(connect, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket 오류:", error);
      };
    } catch (error) {
      console.error("WebSocket 연결 실패:", error);
    }
  }, []);

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case "user-joined":
        if (message.data && Array.isArray(message.data.users)) {
          setUsers(message.data.users as User[]);
        }
        if (message.data && typeof message.data.userName === "string") {
          console.log(`${message.data.userName}님이 참가했습니다.`);
        }
        break;
      case "user-left":
        if (message.data && Array.isArray(message.data.users)) {
          setUsers(message.data.users as User[]);
        }
        if (message.data && typeof message.data.userName === "string") {
          console.log(`${message.data.userName}님이 나갔습니다.`);
        }
        break;
      default:
        // 다른 메시지 타입들은 개별 컴포넌트에서 처리
        break;
    }
  };

  const sendMessage = useCallback(
    (type: WebSocketMessageType, data: Record<string, unknown>) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        const message = createWebSocketMessage(type, data);
        socket.send(message);
      } else {
        console.warn("WebSocket이 연결되지 않았습니다.");
      }
    },
    [socket]
  );

  const joinRoom = useCallback(
    (roomId: string, userName: string) => {
      sendMessage("join-room", { roomId, userName });
    },
    [sendMessage]
  );

  useEffect(() => {
    connect();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [connect]);

  return {
    socket,
    users,
    isConnected,
    sendMessage,
    joinRoom,
  };
};
