import { TimeSlot } from "@/lib/types/faculty";
import { apiClient } from "../client";
import type {
  DailyTimeSlot,
  Absentee,
  TimeSlotFilterResponse,
  SubmitAttendanceRequest,
} from "@/lib/types/attendance";

class AttendanceServiceClass {
  async getDailyAttendance(
    sectionId: string,
    date: string
  ): Promise<DailyTimeSlot[]> {
    try {
      const response = await apiClient.get<DailyTimeSlot[]>(
        `/attendance/daily/${sectionId}?date=${date}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch daily attendance", error);
      throw error;
    }
  }

  async getAbsentees(timeSlotId: string): Promise<Absentee[]> {
    try {
      const response = await apiClient.get<Absentee[]>(
        `/attendance/absentees/${timeSlotId}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch absentees", error);
      throw error;
    }
  }

  async filterTimeSlots(
    date: string,
    startTime?: string,
    endTime?: string
  ): Promise<TimeSlotFilterResponse> {
    try {
      const params = new URLSearchParams({ date });
      if (startTime) params.append("startTime", startTime);
      if (endTime) params.append("endTime", endTime);
      const response = await apiClient.get<TimeSlotFilterResponse>(
        `/attendance/time-slots/filter?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to filter time slots", error);
      throw error;
    }
  }

  async getTimeSlotsBySection(sectionId: string): Promise<TimeSlot[]> {
    try {
      const response = await apiClient.get<TimeSlot[]>(
        `/time-slots/section/${sectionId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Failed to fetch time slots for section ${sectionId}`,
        error
      );
      throw error;
    }
  }

  async submitAttendance(data: SubmitAttendanceRequest): Promise<any> {
    try {
      const response = await apiClient.post("/attendance/submit", data);
      return response.data;
    } catch (error) {
      console.error("Failed to submit attendance", error);
      throw error;
    }
  }
}

export const AttendanceService = new AttendanceServiceClass();
