import { apiClient } from "@/lib/api/client";
import type {
  SectionSchedule,
  CreateSectionScheduleRequest,
  CreateTimeSlotRequest,
  UpdateTimeSlotRequest,
  Faculty,
  ScheduleValidation,
  ValidationResponse,
  TimeSlot,
} from "@/lib/types/section-schedule";

// Toggle for mock data during development
const USE_MOCK_DATA = false;

export class SectionScheduleService {
  // Get schedule by section ID
  static async getScheduleBySection(
    sectionId: string
  ): Promise<SectionSchedule | null> {
    if (USE_MOCK_DATA) {
      return this.getMockSchedule(sectionId);
    }

    try {
      // Using new time-slots API structure
      const response = await apiClient.get(
        `/section-schedules/section/${sectionId}`
      );
      console.log("Schedule response:", response.data);

      // Transform response to match our SectionSchedule interface
      const timeSlots = response.data.timeSlots || [];

      if (timeSlots.length === 0) {
        return null;
      }

      // Create schedule object from time slots
      const schedule: SectionSchedule = {
        id: `schedule-${sectionId}`,
        sectionId,
        roomId: response.data.roomId || "",
        roomName: response.data.roomName || "",
        timeSlots: timeSlots.map((slot: any) => ({
          ...slot,
          // Provide defaults for optional fields
          slotType: slot.slotType || "REGULAR",
          dayOfWeek: slot.dayOfWeek || "MONDAY",
          inchargeFacultyId: slot.inchargeFacultyId || "",
          // Ensure backward compatibility
          isBreak: slot.slotType === "BREAK" || slot.isBreak,
          breakDescription:
            slot.slotType === "BREAK" ? slot.title : slot.breakDescription,
          duration: this.calculateDuration(slot.startTime, slot.endTime),
        })),
        section: response.data.section
          ? {
              id: response.data.section.id,
              name: response.data.section.name || "",
              strength: response.data.section.strength || 0,
            }
          : undefined,
        room: response.data.room
          ? {
              id: response.data.room.id,
              roomString:
                response.data.roomName || response.data.room.roomString,
              capacity: response.data.room.capacity || 0,
            }
          : undefined,
      };

      console.log(
        "GOT ROOM FOR WHATEVER THE ROOM IS: ",
        schedule.room?.roomString
      );

      return schedule;
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
        console.warn(
          `Client error ${error.response.status} for section ${sectionId}, treating as no schedule`
        );
        return null;
      }
      // Only throw for server errors or network issues
      throw error;
    }
  }

  // Get time slots by day
  static async getTimeSlotsByDay(
    dayOfWeek: string,
    sectionId?: string,
    facultyId?: string
  ): Promise<TimeSlot[]> {
    try {
      let endpoint = `/time-slots/day/${dayOfWeek}`;

      if (facultyId) {
        endpoint = `/time-slots/faculty/${facultyId}/day/${dayOfWeek}`;
      } else if (sectionId) {
        endpoint = `/time-slots/section/${sectionId}/day/${dayOfWeek}`;
      }

      const response = await apiClient.get(endpoint);
      return response.data.map((slot: any) => ({
        ...slot,
        // Ensure backward compatibility
        isBreak: slot.slotType === "BREAK",
        breakDescription: slot.slotType === "BREAK" ? slot.title : undefined,
        duration: this.calculateDuration(slot.startTime, slot.endTime),
      }));
    } catch (error: any) {
      console.error(
        `[SectionScheduleService] Error fetching time slots for day ${dayOfWeek}:`,
        error
      );
      throw error;
    }
  }

  // Get time slots by type
  static async getTimeSlotsByType(
    slotType: string,
    sectionId?: string
  ): Promise<TimeSlot[]> {
    try {
      let endpoint = `/time-slots/type/${slotType}`;

      if (sectionId) {
        endpoint = `/time-slots/section/${sectionId}/type/${slotType}`;
      }

      const response = await apiClient.get(endpoint);
      return response.data.map((slot: any) => ({
        ...slot,
        // Ensure backward compatibility
        isBreak: slot.slotType === "BREAK",
        breakDescription: slot.slotType === "BREAK" ? slot.title : undefined,
        duration: this.calculateDuration(slot.startTime, slot.endTime),
      }));
    } catch (error: any) {
      console.error(
        `[SectionScheduleService] Error fetching time slots for type ${slotType}:`,
        error
      );
      throw error;
    }
  }

  // Create new section schedule (legacy method for compatibility)
  static async createSectionSchedule(
    scheduleData: CreateSectionScheduleRequest
  ): Promise<SectionSchedule> {
    try {
      const response = await apiClient.post("/section-schedules", scheduleData);
      console.log("Bro, Okay", response);
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
      endpoint: `/time-slots`,
    });

    if (USE_MOCK_DATA) {
      const mockSchedule = await this.getMockSchedule(timeSlotData.sectionId);
      if (mockSchedule) {
        const newTimeSlot = {
          id: Date.now(),
          ...timeSlotData,
          duration: this.calculateDuration(
            timeSlotData.startTime,
            timeSlotData.endTime
          ),
        };
        mockSchedule.timeSlots.push(newTimeSlot);
        return mockSchedule;
      }
      throw new Error("Schedule not found");
    }

    try {
      // Prepare request data according to new API
      const requestData = {
        inchargeFacultyId: timeSlotData.inchargeFacultyId,
        sectionId: timeSlotData.sectionId,
        roomId: timeSlotData.roomId,
        startTime: timeSlotData.startTime,
        endTime: timeSlotData.endTime,
        slotType: timeSlotData.slotType || "REGULAR",
        title: timeSlotData.title,
        description: timeSlotData.description,
        dayOfWeek: timeSlotData.dayOfWeek,
      };

      console.log("📤 Making API request to:", `/time-slots`);
      console.log("📤 Request body:", requestData);

      const response = await apiClient.post(`/time-slots`, requestData);

      console.log("✅ TimeSlot created successfully:", response.data);

      // Return updated schedule
      return (
        (await this.getScheduleBySection(timeSlotData.sectionId)) || {
          id: scheduleId,
          sectionId: timeSlotData.sectionId,
          roomId: timeSlotData.roomId,
          roomName: "", // Provide a default or fetch if available
          timeSlots: [response.data],
        }
      );
    } catch (error: any) {
      console.error(
        `❌ Error adding time slot:`,
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
        const timeSlotIndex = mockSchedule.timeSlots.findIndex(
          (ts) => ts.id === timeSlotId
        );
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
      // Using new time-slots API
      const response = await apiClient.put(
        `/time-slots/${timeSlotId}`,
        timeSlotData
      );

      // Return updated schedule
      const sectionId =
        timeSlotData.sectionId || scheduleId.replace("schedule-", "");
      return (
        (await this.getScheduleBySection(sectionId)) || {
          id: scheduleId,
          sectionId,
          roomId: timeSlotData.roomId || "",
          roomName: timeSlotData.roomName || "",
          timeSlots: [response.data],
        }
      );
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
        mockSchedule.timeSlots = mockSchedule.timeSlots.filter(
          (ts) => ts.id !== timeSlotId
        );
        return mockSchedule;
      }
      throw new Error("Schedule not found");
    }

    try {
      // Using new time-slots API
      await apiClient.delete(`/time-slots/${timeSlotId}`);

      // Return updated schedule
      const sectionId = scheduleId.replace("schedule-", "");
      return (
        (await this.getScheduleBySection(sectionId)) || {
          id: scheduleId,
          sectionId,
          roomId: "",
          timeSlots: [],
        }
      );
    } catch (error: any) {
      console.error(
        `[SectionScheduleService] Error deleting time slot ${timeSlotId}:`,
        error
      );
      throw error;
    }
  }

  // Check availability (updated with dayOfWeek)
  static async checkAvailability(
    roomId: string,
    dayOfWeek: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    try {
      const response = await apiClient.get(
        `/time-slots/check-availability?roomId=${roomId}&dayOfWeek=${dayOfWeek}&startTime=${startTime}&endTime=${endTime}`
      );
      return response.data.available || false;
    } catch (error: any) {
      console.error(
        "[SectionScheduleService] Error checking availability:",
        error
      );
      return false;
    }
  }

  // Validate time slot
  static async validateTimeSlot(
    timeSlotData: CreateTimeSlotRequest
  ): Promise<ValidationResponse> {
    try {
      const response = await apiClient.post(
        `/time-slots/validate`,
        timeSlotData
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "[SectionScheduleService] Error validating time slot:",
        error
      );
      return {
        valid: false,
        message: "Validation failed",
        reason: error.response?.data?.message || error.message,
      };
    }
  }

  // Get conflicts
  static async getConflicts(
    roomId: string,
    dayOfWeek: string,
    startTime: string,
    endTime: string
  ): Promise<TimeSlot[]> {
    try {
      const response = await apiClient.get(
        `/time-slots/conflicts?roomId=${roomId}&dayOfWeek=${dayOfWeek}&startTime=${startTime}&endTime=${endTime}`
      );
      return response.data.map((slot: any) => ({
        ...slot,
        // Ensure backward compatibility
        isBreak: slot.slotType === "BREAK",
        breakDescription: slot.slotType === "BREAK" ? slot.title : undefined,
        duration: this.calculateDuration(slot.startTime, slot.endTime),
      }));
    } catch (error: any) {
      console.error("[SectionScheduleService] Error getting conflicts:", error);
      return [];
    }
  }

  // Get faculty list
  static async getFaculty(): Promise<Faculty[]> {
    try {
      const response = await apiClient.get("/users/getFacs");
      return response.data;
    } catch (error: any) {
      console.error("[SectionScheduleService] Error fetching faculty:", error);
      throw error;
    }
  }

  // Validate schedule requirements
  static validateSchedule(timeSlots: any[]): ScheduleValidation {
    const workSlots = timeSlots.filter((slot) => slot.slotType !== "BREAK");
    const breakSlots = timeSlots.filter((slot) => slot.slotType === "BREAK");

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
        `Work time is ${
          requiredWorkMinutes - workMinutes
        } minutes short (${workMinutes}/${requiredWorkMinutes} minutes)`
      );
    }

    if (breakMinutes < requiredBreakMinutes) {
      warnings.push(
        `Break time is ${
          requiredBreakMinutes - breakMinutes
        } minutes short (${breakMinutes}/${requiredBreakMinutes} minutes)`
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
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return endMinutes - startMinutes;
  }

  // Mock data for development
  private static async getMockSchedule(
    sectionId: string
  ): Promise<SectionSchedule> {
    return {
      id: "mock-schedule-1",
      sectionId,
      roomId: "room-1",
      timeSlots: [
        {
          id: 1,
          startTime: "09:00",
          endTime: "09:50",
          slotType: "REGULAR",
          inchargeFacultyId: "faculty-1",
          sectionId,
          roomId: "room-1",
          dayOfWeek: "MONDAY",
          duration: 50,
          isBreak: false,
        },
        {
          id: 2,
          startTime: "09:50",
          endTime: "10:00",
          slotType: "BREAK",
          title: "Short Break",
          inchargeFacultyId: "faculty-1",
          sectionId,
          roomId: "room-1",
          dayOfWeek: "MONDAY",
          duration: 10,
          isBreak: true,
          breakDescription: "Short Break",
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

  static async getSectionSchedule(
    sectionId: string
  ): Promise<SectionSchedule | null> {
    try {
      console.log(`🔄 Fetching complete schedule for section: ${sectionId}`);

      const schedule = await this.getScheduleBySection(sectionId);

      if (!schedule) {
        console.log(`⚠️ No schedule found for section: ${sectionId}`);
        return null;
      }

      console.log(`✅ Schedule found for section ${sectionId}:`, {
        timeSlots: schedule.timeSlots?.length || 0,
        roomId: schedule.room?.roomString,
        sectionId: schedule.sectionId,
      });

      return schedule;
    } catch (error: any) {
      console.error(
        `❌ Error fetching schedule for section ${sectionId}:`,
        error
      );
      throw error;
    }
  }
}
