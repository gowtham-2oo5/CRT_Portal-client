import { ClientAuth } from "@/lib/auth/client";
import type {
  Room,
  CreateRoomRequest,
  UpdateRoomRequest,
  RoomFilters,
  ParseRoomRequest,
} from "@/lib/types/room-management";

// Toggle for mock data during development
const USE_MOCK_DATA = false;

export class RoomManagementService {
  private static async getAuthenticatedApi() {
    try {
      return ClientAuth.createAuthenticatedApi();
    } catch (error) {
      console.error(
        "[RoomManagementService] Failed to create authenticated API:",
        error
      );
      throw new Error("Authentication required");
    }
  }

  // Get all rooms with optional filtering
  static async getRooms(filters?: RoomFilters): Promise<Room[]> {
    if (USE_MOCK_DATA) {
      return this.getMockRooms(filters);
    }

    try {
      const api = await this.getAuthenticatedApi();
      const params = new URLSearchParams();

      if (filters?.search) params.append("search", filters.search);
      if (filters?.roomType) params.append("roomType", filters.roomType);
      if (filters?.block) params.append("block", filters.block);
      if (filters?.floor) params.append("floor", filters.floor);

      const response = await api.get(`/rooms?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("[RoomManagementService] Error fetching rooms:", error);
      throw error;
    }
  }

  // Get room by ID
  static async getRoomById(id: string): Promise<Room> {
    if (USE_MOCK_DATA) {
      const rooms = await this.getMockRooms();
      const room = rooms.find((r) => r.id === id);
      if (!room) throw new Error("Room not found");
      return room;
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.get(`/rooms/${id}`);
      return response.data;
    } catch (error) {
      console.error(
        `[RoomManagementService] Error fetching room ${id}:`,
        error
      );
      throw error;
    }
  }

  // Create new room
  static async createRoom(roomData: CreateRoomRequest): Promise<Room> {
    if (USE_MOCK_DATA) {
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        ...roomData,
        roomString: `${roomData.block}${roomData.floor}${roomData.roomNumber}${
          roomData.subRoom || ""
        }`,
      };
      return newRoom;
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.post("/rooms", roomData);
      return response.data;
    } catch (error) {
      console.error("[RoomManagementService] Error creating room:", error);
      throw error;
    }
  }

  // Update room
  static async updateRoom(
    id: string,
    roomData: UpdateRoomRequest
  ): Promise<Room> {
    if (USE_MOCK_DATA) {
      const rooms = await this.getMockRooms();
      const existingRoom = rooms.find((r) => r.id === id);
      if (!existingRoom) throw new Error("Room not found");

      return {
        ...existingRoom,
        ...roomData,
        roomString:
          roomData.block && roomData.floor && roomData.roomNumber
            ? `${roomData.block}${roomData.floor}${roomData.roomNumber}${
                roomData.subRoom || ""
              }`
            : existingRoom.roomString,
      };
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.put(`/rooms/${id}`, roomData);
      return response.data;
    } catch (error) {
      console.error(
        `[RoomManagementService] Error updating room ${id}:`,
        error
      );
      throw error;
    }
  }

  // Delete room
  static async deleteRoom(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      console.log(`Mock: Deleting room ${id}`);
      return;
    }

    try {
      const api = await this.getAuthenticatedApi();
      await api.delete(`/rooms/${id}`);
    } catch (error) {
      console.error(
        `[RoomManagementService] Error deleting room ${id}:`,
        error
      );
      throw error;
    }
  }

  // Parse room string
  static async parseRoomString(roomString: string): Promise<Room> {
    if (USE_MOCK_DATA) {
      // Mock parsing logic
      const match = roomString.match(/^([A-Z])(\d)(\d{2})([A-Z]?)$/);
      if (!match) throw new Error("Invalid room string format");

      return {
        id: `parsed-${Date.now()}`,
        block: match[1],
        floor: match[2],
        roomNumber: match[3],
        subRoom: match[4] || undefined,
        roomType: "LECTURE_ROOM",
        capacity: 50,
        roomString,
      };
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.post(
        `/rooms/parse?roomString=${encodeURIComponent(roomString)}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `[RoomManagementService] Error parsing room string ${roomString}:`,
        error
      );
      throw error;
    }
  }

  // Bulk delete rooms
  static async bulkDeleteRooms(roomIds: string[]): Promise<void> {
    if (USE_MOCK_DATA) {
      console.log(`Mock: Bulk deleting rooms:`, roomIds);
      return;
    }

    try {
      const api = await this.getAuthenticatedApi();
      await Promise.all(roomIds.map((id) => api.delete(`/rooms/${id}`)));
    } catch (error) {
      console.error(
        "[RoomManagementService] Error bulk deleting rooms:",
        error
      );
      throw error;
    }
  }

  // Mock data for development
  private static async getMockRooms(filters?: RoomFilters): Promise<Room[]> {
    const mockRooms: Room[] = [
      {
        id: "1",
        block: "R",
        floor: "5",
        roomNumber: "04",
        roomType: "LAB",
        capacity: 60,
        roomString: "R504",
      },
      {
        id: "2",
        block: "R",
        floor: "5",
        roomNumber: "04",
        subRoom: "A",
        roomType: "LECTURE_ROOM",
        capacity: 40,
        roomString: "R504A",
      },
      {
        id: "3",
        block: "A",
        floor: "3",
        roomNumber: "15",
        roomType: "SEMINAR_HALL",
        capacity: 100,
        roomString: "A315",
      },
    ];

    let filteredRooms = mockRooms;

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredRooms = filteredRooms.filter(
        (room) =>
          room.block.toLowerCase().includes(search) ||
          room.floor.toLowerCase().includes(search) ||
          room.roomNumber.toLowerCase().includes(search) ||
          room.roomString?.toLowerCase().includes(search)
      );
    }

    if (filters?.roomType) {
      filteredRooms = filteredRooms.filter(
        (room) => room.roomType === filters.roomType
      );
    }

    if (filters?.block) {
      filteredRooms = filteredRooms.filter(
        (room) => room.block === filters.block
      );
    }

    if (filters?.floor) {
      filteredRooms = filteredRooms.filter(
        (room) => room.floor === filters.floor
      );
    }

    return filteredRooms;
  }
}
