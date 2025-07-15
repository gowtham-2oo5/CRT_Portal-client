import { ClientAuth } from "@/lib/auth/client";
import type {
  SectionSchedule,
  CreateSectionScheduleRequest,
  CreateTimeSlotRequest,
  UpdateTimeSlotRequest,
  Faculty,
  ScheduleValidation,
} from "@/lib/types/section-schedule";

// Toggle for mock data during development
const USE_MOCK_DATA = false;

export class SectionScheduleService {
  private static async getAuthenticatedApi() {
    try {
      return ClientAuth.createAuthenticatedApi();
    } catch (error) {
      console.error(
        "[SectionScheduleService] Failed to create authenticated API:",
        error
      );
      throw new Error("Authentication required");
    }
  }

  // Get schedule by section ID
  static async getScheduleBySection(sectionId: string): Promise<SectionSchedule | null> {
    if (USE_MOCK_DATA) {
      return this.getMockSchedule(sectionId);
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.get(`/section-schedules/section/${sectionId}`);
      return response.data;
    } catch (error: any) {
      console.error(
        `[SectionScheduleService] Error fetching schedule for section ${sectionId}:`,
        error
      );
      // Handle 404 specifically - section has no schedule yet
      if (error.response?.status === 404) {
        return null;
      }
      // For other errors, still return null but log the error
      if (error.response?.status >= 400 && error.response?.status < 500) {
        console.warn(`Client error ${error.response.status} for section ${sectionId}, treating as no schedule`);
        return null;
      }
      // Only throw for server errors or network issues
      throw error;
    }
  }

  // Create new section schedule
  static async createSectionSchedule(
    scheduleData: CreateSectionScheduleRequest
  ): Promise<SectionSchedule> {
    if (USE_MOCK_DATA) {
      return {
        id: `schedule-${Date.now()}`,
        sectionId: scheduleData.sectionId,
        roomId: scheduleData.roomId,
        timeSlots: [],
      };
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.post("/section-schedules", scheduleData);
      return response.data;
    } catch (error: any) {
      console.error("[SectionScheduleService] Error creating schedule:", error);
      throw error;
    }
  }

  // Add time slot to schedule
  static async addTimeSlot(
    scheduleId: string,
    timeSlotData: CreateTimeSlotRequest
  ): Promise<SectionSchedule> {
    console.log("🚀 SectionScheduleService.addTimeSlot - Request:", {
      scheduleId,
      timeSlotData,
      endpoint: `/section-schedules/${scheduleId}/time-slots`
    });

    if (USE_MOCK_DATA) {
      const mockSchedule = await this.getMockSchedule(timeSlotData.sectionId);
      if (mockSchedule) {
        const newTimeSlot = {
          id: Date.now(),
          ...timeSlotData,
          duration: this.calculateDuration(timeSlotData.startTime, timeSlotData.endTime),
        };
        mockSchedule.timeSlots.push(newTimeSlot);
        return mockSchedule;
      }
      throw new Error("Schedule not found");
    }

    try {
      const api = await this.getAuthenticatedApi();
      console.log("📤 Making API request to:", `/section-schedules/${scheduleId}/time-slots`);
      console.log("📤 Request body:", timeSlotData);
      
      const response = await api.post(
        `/section-schedules/${scheduleId}/time-slots`,
        timeSlotData
      );
      
      console.log("✅ TimeSlot created successfully:", response.data);
      console.log("✅ Created TimeSlot isBreak flag:", response.data.timeSlots?.find((ts: any) => 
        ts.startTime === timeSlotData.startTime && ts.endTime === timeSlotData.endTime
      )?.isBreak);
      
      return response.data;
    } catch (error: any) {
      console.error(
        `❌ Error adding time slot to schedule ${scheduleId}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  }

  // Update time slot
  static async updateTimeSlot(
    scheduleId: string,
    timeSlotId: number,
    timeSlotData: UpdateTimeSlotRequest
  ): Promise<SectionSchedule> {
    if (USE_MOCK_DATA) {
      const mockSchedule = await this.getMockSchedule("mock-section");
      if (mockSchedule) {
        const timeSlotIndex = mockSchedule.timeSlots.findIndex(ts => ts.id === timeSlotId);
        if (timeSlotIndex !== -1) {
          mockSchedule.timeSlots[timeSlotIndex] = {
            ...mockSchedule.timeSlots[timeSlotIndex],
            ...timeSlotData,
          };
        }
        return mockSchedule;
      }
      throw new Error("Schedule not found");
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.put(
        `/section-schedules/${scheduleId}/time-slots/${timeSlotId}`,
        timeSlotData
      );
      return response.data;
    } catch (error: any) {
      console.error(
        `[SectionScheduleService] Error updating time slot ${timeSlotId}:`,
        error
      );
      throw error;
    }
  }

  // Delete time slot
  static async deleteTimeSlot(
    scheduleId: string,
    timeSlotId: number
  ): Promise<SectionSchedule> {
    if (USE_MOCK_DATA) {
      const mockSchedule = await this.getMockSchedule("mock-section");
      if (mockSchedule) {
        mockSchedule.timeSlots = mockSchedule.timeSlots.filter(ts => ts.id !== timeSlotId);
        return mockSchedule;
      }
      throw new Error("Schedule not found");
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.delete(
        `/section-schedules/${scheduleId}/time-slots/${timeSlotId}`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        `[SectionScheduleService] Error deleting time slot ${timeSlotId}:`,
        error
      );
      throw error;
    }
  }

  // Get faculty list
  static async getFaculty(): Promise<Faculty[]> {
    if (USE_MOCK_DATA) {
      return [
        { id: "faculty-1", name: "Dr. John Smith", email: "john@example.com" },
        { id: "faculty-2", name: "Prof. Jane Doe", email: "jane@example.com" },
        { id: "faculty-3", name: "Dr. Mike Johnson", email: "mike@example.com" },
      ];
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.get("/users/getFacs");
      return response.data;
    } catch (error: any) {
      console.error("[SectionScheduleService] Error fetching faculty:", error);
      throw error;
    }
  }

  // Validate schedule requirements
  static validateSchedule(timeSlots: any[]): ScheduleValidation {
    const workSlots = timeSlots.filter(slot => !slot.isBreak);
    const breakSlots = timeSlots.filter(slot => slot.isBreak);

    const workMinutes = workSlots.reduce((total, slot) => {
      return total + this.calculateDuration(slot.startTime, slot.endTime);
    }, 0);

    const breakMinutes = breakSlots.reduce((total, slot) => {
      return total + this.calculateDuration(slot.startTime, slot.endTime);
    }, 0);

    const requiredWorkMinutes = 8 * 50; // 400 minutes
    const requiredBreakMinutes = 2 * 10 + 1 * 50; // 70 minutes

    const warnings: string[] = [];

    if (workMinutes < requiredWorkMinutes) {
      warnings.push(
        `Work time is ${requiredWorkMinutes - workMinutes} minutes short (${workMinutes}/${requiredWorkMinutes} minutes)`
      );
    }

    if (breakMinutes < requiredBreakMinutes) {
      warnings.push(
        `Break time is ${requiredBreakMinutes - breakMinutes} minutes short (${breakMinutes}/${requiredBreakMinutes} minutes)`
      );
    }

    return {
      isValid: warnings.length === 0,
      workMinutes,
      breakMinutes,
      requiredWorkMinutes,
      requiredBreakMinutes,
      warnings,
    };
  }

  // Helper function to calculate duration in minutes
  private static calculateDuration(startTime: string, endTime: string): number {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return endMinutes - startMinutes;
  }

  // Mock data for development
  private static async getMockSchedule(sectionId: string): Promise<SectionSchedule> {
    return {
      id: "mock-schedule-1",
      sectionId,
      roomId: "room-1",
      timeSlots: [
        {
          id: 1,
          startTime: "09:00",
          endTime: "09:50",
          isBreak: false,
          inchargeFacultyId: "faculty-1",
          sectionId,
          roomId: "room-1",
          duration: 50,
        },
        {
          id: 2,
          startTime: "09:50",
          endTime: "10:00",
          isBreak: true,
          breakDescription: "Short Break",
          sectionId,
          roomId: "room-1",
          duration: 10,
        },
      ],
      section: {
        id: sectionId,
        name: "Section A",
        strength: 30,
      },
      room: {
        id: "room-1",
        roomString: "R504",
        capacity: 60,
      },
    };
  }
}
