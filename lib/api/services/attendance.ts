import { apiClient } from "../client";
import type {
  AttendanceSession,
  AttendanceAnalytics,
  StudentAttendanceSummary,
  AttendanceFilters,
  AttendanceRecord,
  SubmitAttendanceRequest,
  SessionStudentsResponse,
  TimeSlotFilterResponse,
  FilteredTimeSlot,
  TimeSlotStatusDTO,
  Absentee,
} from "../../types/attendance";

/**
 * Consolidated Attendance Service
 * Handles all attendance operations for both faculty and admin
 */
export class AttendanceService {
  // Faculty Dashboard
  static async getFacultyDashboard(facultyId: string) {
    try {
      const response = await apiClient.get(
        `/faculty/dashboard?id=${facultyId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to load dashboard"
      );
    }
  }

  // Current Session
  static async getCurrentSession(facultyId: string) {
    try {
      const response = await apiClient.get(
        `/faculty/current-session?id=${facultyId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get current session"
      );
    }
  }

  // Session Students
  static async getSessionStudents(timeSlotId: string, date?: string) {
    try {
      const params = date ? `?date=${date}` : "";
      const response = await apiClient.get(
        `/faculty/session/${timeSlotId}/students${params}`
      );
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to load students"
      );
    }
  }

  // Submit Attendance
  static async submitAttendance(request: SubmitAttendanceRequest) {
    try {
      const response = await apiClient.post("/faculty/attendance", request);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to submit attendance"
      );
    }
  }

  // Time Slots by Section
  static async getTimeSlotsBySection(sectionId: string) {
    try {
      const response = await apiClient.get(`/time-slots/section/${sectionId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to load time slots"
      );
    }
  }

  // Pending Faculties (Admin)
  static async getPendingFaculties(date: string) {
    try {
      const response = await apiClient.get(
        `/admin/attendance/pending?date=${date}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to load pending faculties"
      );
    }
  }

  // Analytics
  static async getAttendanceAnalytics(filters?: AttendanceFilters) {
    try {
      const params = new URLSearchParams();
      if (filters?.sectionId) params.append("sectionId", filters.sectionId);
      if (filters?.facultyId) params.append("facultyId", filters.facultyId);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);

      const response = await apiClient.get(`/analytics/attendance?${params}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to load analytics"
      );
    }
  }

  // Filter Time Slots (Admin)
  static async filterTimeSlots(
    date: string,
    startTime?: string,
    endTime?: string
  ): Promise<TimeSlotFilterResponse> {
    try {
      const params = new URLSearchParams();
      params.append("date", date);
      if (startTime) params.append("startTime", startTime);
      if (endTime) params.append("endTime", endTime);

      const response = await apiClient.get(
        `/attendance/time-slots/filter?${params}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to filter time slots"
      );
    }
  }

  // Get Pending Time Slots (Admin)
  static async getPendingTimeSlots(
    date: string,
    startTime?: string,
    endTime?: string
  ): Promise<FilteredTimeSlot[]> {
    try {
      const params = new URLSearchParams();
      params.append("date", date);
      if (startTime) params.append("startTime", startTime);
      if (endTime) params.append("endTime", endTime);

      const response = await apiClient.get(`/time-slots/pending?${params}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get pending time slots"
      );
    }
  }

  // Get Absentees for a Time Slot
  static async getAbsentees(timeSlotId: string): Promise<Absentee[]> {
    try {
      // Try the most likely endpoint path based on REST conventions
      const response = await apiClient.get(
        `/attendance/absentees/${timeSlotId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get absentees"
      );
    }
  }

  // Export CSV
  static async exportAsCSV(filters: AttendanceFilters): Promise<Blob> {
    try {
      const response = await apiClient.post(
        "/reports/export/csv",
        { filters },
        { responseType: "blob" }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to export CSV");
    }
  }
}

// Legacy exports for backward compatibility
export const FacultyAttendanceService = AttendanceService;
export const BatchAttendanceService = AttendanceService;
export const AttendanceReportService = AttendanceService;
