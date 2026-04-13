// websocketManager.ts
import { getToken } from "./authLogin";

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
  | "cursor-move"
  | "chat-message"
  | "room-update";

export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: Record<string, unknown>;
  userId?: string;
  userName?: string;
  timestamp?: string;
}

// WebSocket 연결 관리 클래스
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private roomId: string;
  private userName: string;
  private userId?: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1초
  private messageHandlers = new Map<
    WebSocketMessageType,
    ((message: WebSocketMessage) => void)[]
  >();

  constructor(roomId: string, userName: string, userId?: string) {
    this.roomId = roomId;
    this.userName = userName;
    this.userId = userId;
  }

  // 웹소켓 연결
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const token = getToken();
        const wsUrl = `ws://localhost:8080/ws/drawing/${this.roomId}${
          token ? `?token=${token}` : ""
        }`;

        console.log("WebSocket 연결 시도:", wsUrl);
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log("WebSocket 연결 성공");
          this.reconnectAttempts = 0;

          // 방 참가 메시지 전송
          this.sendMessage("join-room", {
            roomId: this.roomId,
            userName: this.userName,
            userId: this.userId,
          });

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = this.parseMessage(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error("메시지 파싱 오류:", error);
          }
        };

        this.ws.onclose = (event) => {
          console.log("WebSocket 연결 종료:", event.code, event.reason);

          // 비정상 종료인 경우 재연결 시도
          if (
            event.code !== 1000 &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            console.log(
              `재연결 시도 ${this.reconnectAttempts + 1}/${
                this.maxReconnectAttempts
              }`
            );
            setTimeout(() => {
              this.reconnectAttempts++;
              this.connect();
            }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts)); // 지수 백오프
          }
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket 오류:", error);
          reject(new Error("WebSocket 연결 실패"));
        };
      } catch (error) {
        console.error("WebSocket 생성 오류:", error);
        reject(error);
      }
    });
  }

  // 연결 해제
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, "정상 종료");
      this.ws = null;
    }
  }

  // 메시지 전송
  sendMessage(type: WebSocketMessageType, data: Record<string, unknown>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = this.createMessage(type, data);
      this.ws.send(message);
    } else {
      console.warn("WebSocket이 연결되지 않았습니다.");
    }
  }

  // 드로잉 데이터 전송
  sendDrawingData(drawingData: DrawingData): void {
    this.sendMessage("drawing", {
      ...drawingData,
      userId: this.userId,
      userName: this.userName,
    });
  }

  // 채팅 메시지 전송
  sendChatMessage(message: string): void {
    this.sendMessage("chat-message", {
      message,
      userId: this.userId,
      userName: this.userName,
    });
  }

  // 커서 위치 전송
  sendCursorPosition(x: number, y: number): void {
    this.sendMessage("cursor-move", {
      x,
      y,
      userId: this.userId,
      userName: this.userName,
    });
  }

  // 메시지 핸들러 등록
  onMessage(
    type: WebSocketMessageType,
    handler: (message: WebSocketMessage) => void
  ): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);
  }

  // 메시지 핸들러 제거
  offMessage(
    type: WebSocketMessageType,
    handler: (message: WebSocketMessage) => void
  ): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // 연결 상태 확인
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // 메시지 생성
  private createMessage(
    type: WebSocketMessageType,
    data: Record<string, unknown>
  ): string {
    return JSON.stringify({
      type,
      data,
      userId: this.userId,
      userName: this.userName,
      timestamp: new Date().toISOString(),
    });
  }

  // 메시지 파싱
  private parseMessage(message: string): WebSocketMessage {
    try {
      return JSON.parse(message) as WebSocketMessage;
    } catch (error) {
      console.error("메시지 파싱 실패:", error);
      throw new Error("Invalid WebSocket message format");
    }
  }

  // 메시지 처리
  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          console.error(`메시지 핸들러 오류 (${message.type}):`, error);
        }
      });
    }
  }
}

// 유틸리티 함수들 (기존 코드와의 호환성을 위해)
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
