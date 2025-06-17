export interface DrawingData {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  color: string;
  lineWidth: number;
  userId?: string;
  userName?: string;
}

// WebSocket 메시지 타입 정의
export type WebSocketMessageType =
  | "join-room"
  | "drawing"
  | "sticker-added"
  | "user-joined"
  | "user-left"
  | "canvas-state"
  | "cursor-move" // 커서 이동
  | "chat-message" // 채팅
  | "room-update"; // 방 정보 업데이트

export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: Record<string, unknown>;
  userId?: string;
  userName?: string;
  timestamp?: string;
}

export const createWebSocketMessage = (
  type: WebSocketMessageType,
  data: Record<string, unknown>,
  userId?: string,
  userName?: string
): string => {
  return JSON.stringify({
    type,
    data,
    userId,
    userName,
    timestamp: new Date().toISOString(),
  });
};

export const parseWebSocketMessage = (message: string): WebSocketMessage => {
  try {
    return JSON.parse(message) as WebSocketMessage;
  } catch (error) {
    console.error("Failed to parse WebSocket message:", error);
    throw new Error("Invalid WebSocket message format");
  }
};
