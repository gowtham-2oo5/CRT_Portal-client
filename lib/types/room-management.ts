// Room Management Types based on API schema

export interface Room {
  id: string;
  block: string;
  floor: string;
  roomNumber: string;
  subRoom?: string;
  roomType: "LAB" | "LECTURE_ROOM" | "SEMINAR_HALL";
  capacity: number;
  roomString?: string;
}

export interface CreateRoomRequest {
  block: string;
  floor: string;
  roomNumber: string;
  subRoom?: string;
  roomType: "LAB" | "LECTURE_ROOM" | "SEMINAR_HALL";
  capacity: number;
}

export interface UpdateRoomRequest {
  block?: string;
  floor?: string;
  roomNumber?: string;
  subRoom?: string;
  roomType?: "LAB" | "LECTURE_ROOM" | "SEMINAR_HALL";
  capacity?: number;
}

export interface RoomFilters {
  search?: string; // Search by block, floor, roomNumber, or roomString
  roomType?: "LAB" | "LECTURE_ROOM" | "SEMINAR_HALL";
  block?: string;
  floor?: string;
}

export interface BulkRoomOperation {
  roomIds: string[];
  operation: "DELETE";
}

export interface ParseRoomRequest {
  roomString: string;
}
