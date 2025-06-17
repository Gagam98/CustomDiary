import { useState, useEffect } from "react";
import { roomAPI, RoomInfo } from "../utils/api";

// Room 인터페이스를 RoomInfo와 동일하게 수정
interface Room {
  id: number;
  roomId: string;
  roomName: string;
  creatorName: string;
  createdAt: string;
  canvasData?: string;
}

interface UseRoomManagerReturn {
  rooms: Room[];
  loading: boolean;
  error: string | null;
  createRoom: (roomName: string) => Promise<string>;
  deleteRoom: (roomId: string) => Promise<void>;
  refreshRooms: () => Promise<void>;
}

export const useRoomManager = (): UseRoomManagerReturn => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoom = async (roomName: string): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      const response = await roomAPI.createRoom(roomName);
      await refreshRooms();
      return response.roomId;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "방 생성에 실패했습니다.";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (roomId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await roomAPI.deleteRoom(roomId);
      await refreshRooms();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "방 삭제에 실패했습니다.";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshRooms = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await roomAPI.getMyRooms();

      // RoomInfo[]를 Room[]로 변환 (실제로는 동일한 구조)
      const roomData: Room[] = response.map((roomInfo: RoomInfo) => ({
        id: roomInfo.id,
        roomId: roomInfo.roomId,
        roomName: roomInfo.roomName,
        creatorName: roomInfo.creatorName,
        createdAt: roomInfo.createdAt,
        canvasData: roomInfo.canvasData,
      }));

      setRooms(roomData);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "방 목록을 불러오는데 실패했습니다.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshRooms();
  }, []);

  return {
    rooms,
    loading,
    error,
    createRoom,
    deleteRoom,
    refreshRooms,
  };
};

// 타입 내보내기
export type { Room };
