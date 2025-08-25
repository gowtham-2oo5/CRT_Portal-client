import { apiClient } from "../client";
import type {
  AttendanceSession,
  AttendanceAnalytics,
  StudentAttendanceSummary,
  AttendanceFilters,
  AttendanceRecord,
  SubmitAttendanceRequest,
  SessionStudentsResponse,
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
