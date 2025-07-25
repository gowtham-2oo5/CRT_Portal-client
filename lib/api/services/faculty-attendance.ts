// 🎯 CRT Portal Attendance System - Faculty Attendance Service
// Created: 2025-07-15 | Phase 1 - Task 1.2

import { apiClient } from "../client";
import type {
  AttendanceSession,
  CurrentSession,
  SubmitAttendanceRequest,
  AttendanceApiResponse,
  SessionStudentsResponse,
  AttendanceSubmissionResponse,
  AttendanceFilters,
  StudentAttendanceSummary,
} from "../../types/attendance";
import type { TimeSlot } from "../../types/section-schedule";
import type { Student } from "../../types/section-management";

// Updated types to match actual API response
interface FacultyDashboardApiResponse {
  profile: {
    id: string;
    name: string;
    email: string;
    department: string | null;
    employeeId: string | null;
    phone: string;
  };
  todaySchedule: Array<{
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    sectionName: string;
    room: string;
    active: boolean;
  }>;
  assignedSections: Array<{
    id: string;
    name: string;
    totalStudents: number;
    trainingName: string;
  }>;
  todayAttendanceCount: number;
  weeklyAttendanceCount: number;
}

interface CurrentSessionApiResponse {
  hasActiveSession: boolean;
  currentSlot: {
    id: string;
    startTime: string;
    endTime: string;
    sectionName: string;
    sectionId: string;
    room: string;
    active: boolean;
    timeRemaining?: number;
  } | null;
  nextSlot: {
    id: string;
    startTime: string;
    endTime: string;
    sectionName: string;
    sectionId: string;
    room: string;
    timeUntilStart?: number;
  } | null;
}

/**
 * Faculty Attendance Service
 * Handles faculty-specific attendance operations with role-based access control
 */
export class FacultyAttendanceService {
  // ============================================================================
  // FACULTY DASHBOARD & SESSION MANAGEMENT
  // ============================================================================

  /**
   * Get faculty dashboard data with real-time session information
   */
  static async getFacultyDashboard(
    facultyId: string
  ): Promise<FacultyDashboardApiResponse> {
    try {
      console.log("📊 Fetching faculty dashboard for:", facultyId);

      const response = await apiClient.get(
        `/faculty/dashboard?id=${facultyId}`
      );

      console.log("✅ Faculty dashboard loaded:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching faculty dashboard:", error);
      throw new Error(
        error.response?.data?.message || "Failed to load dashboard"
      );
    }
  }

  /**
   * Get current active session for faculty
   */
  static async getCurrentSession(
    facultyId: string
  ): Promise<CurrentSessionApiResponse> {
    try {
      console.log("🕐 Fetching current session for faculty:", facultyId);

      const response = await apiClient.get(
        `/faculty/current-session?id=${facultyId}`
      );

      console.log("✅ Current session loaded:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching current session:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get current session"
      );
    }
  }

  /**
   * Get today's schedule for faculty - returns the todaySchedule from dashboard
   */
  static async getTodaySchedule(facultyId: string): Promise<{
    data: Array<{
      id: string;
      day: string;
      startTime: string;
      endTime: string;
      sectionName: string;
      room: string;
      active: boolean;
    }>;
  }> {
    try {
      console.log("📅 Fetching today's schedule for faculty:", facultyId);

      // Get from dashboard API since it includes today's schedule
      const dashboardData = await this.getFacultyDashboard(facultyId);

      console.log("✅ Today's schedule loaded:", dashboardData.todaySchedule);
      return { data: dashboardData.todaySchedule };
    } catch (error: any) {
      console.error("❌ Error fetching today's schedule:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get today's schedule"
      );
    }
  }

  /**
   * Get weekly timetable for faculty
   */
  static async getWeeklyTimetable(
    facultyId: string,
    week?: string // Format: YYYY-WXX (e.g., 2024-W29)
  ): Promise<AttendanceApiResponse<TimeSlot[]>> {
    try {
      const params = new URLSearchParams();
      params.append("facultyId", facultyId);
      if (week) params.append("week", week);

      const response = await apiClient.get(
        `/faculty/timetable/weekly?${params}`
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching weekly timetable:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get weekly timetable"
      );
    }
  }

  // ============================================================================
  // ATTENDANCE MARKING
  // ============================================================================

  /**
   * Get students for a specific time slot (faculty can only access assigned slots)
   */
  static async getSessionStudents(
    timeSlotId: string
  ): Promise<AttendanceApiResponse<SessionStudentsResponse>> {
    try {
      console.log("👥 Fetching students for time slot:", timeSlotId);

      const response = await apiClient.get(
        `/faculty/session/${timeSlotId}/students`
      );

      console.log("✅ Session students loaded:", response.data);
      return response;
    } catch (error: any) {
      console.error("❌ Error fetching session students:", error);

      // Handle specific error cases
      if (error.response?.status === 403) {
        throw new Error("You are not authorized to access this session");
      }
      if (error.response?.status === 404) {
        throw new Error("Session not found or no students enrolled");
      }

      throw new Error(
        error.response?.data?.message || "Failed to load students"
      );
    }
  }

  /**
   * Submit attendance for faculty's assigned session
   * Now supports admin override with isAdminRequest flag
   */
  static async submitAttendance(
    request: SubmitAttendanceRequest
  ): Promise<AttendanceApiResponse<AttendanceSubmissionResponse>> {
    try {
      console.log("📝 Submitting attendance:", {
        timeSlotId: request.timeSlotId,
        sectionId: request.sectionId,
        date: request.date,
        topicTaught: request.topicTaught,
        isAdminRequest: request.isAdminRequest,
        recordCount: request.attendanceRecords.length,
      });

      // Check if this is an admin request
      const isAdminRequest =
        sessionStorage.getItem("isAdminRequest") === "true";

      // If it's an admin request, add the flag to the request
      const requestWithFlag = isAdminRequest
        ? { ...request, isAdminRequest: true }
        : request;

      // Log if this is an admin request
      if (isAdminRequest) {
        console.log("⚠️ Admin override request detected");
        // Clear the flag after use
        sessionStorage.removeItem("isAdminRequest");
      }

      const response = await apiClient.post(
        "/faculty/attendance",
        requestWithFlag
      );

      console.log("✅ Attendance submitted successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error submitting attendance:", error);

      // Handle specific error cases
      if (error.response?.status === 403) {
        throw new Error(
          "You are not authorized to mark attendance for this section"
        );
      }
      if (error.response?.status === 409) {
        throw new Error("Attendance has already been marked for this session");
      }
      if (error.response?.status === 400) {
        throw new Error(
          error.response?.data?.message || "Invalid attendance data"
        );
      }

      throw new Error(
        error.response?.data?.message || "Failed to submit attendance"
      );
    }
  }

  /**
   * Update existing attendance session (if faculty has permission)
   */
  static async updateAttendance(
    sessionId: string,
    updates: Partial<SubmitAttendanceRequest>
  ): Promise<AttendanceApiResponse<AttendanceSession>> {
    try {
      console.log("🔄 Updating attendance session:", sessionId, updates);

      const response = await apiClient.put(
        `/faculty/attendance/${sessionId}`,
        updates
      );

      console.log("✅ Attendance updated successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error updating attendance:", error);

      if (error.response?.status === 403) {
        throw new Error(
          "You are not authorized to update this attendance session"
        );
      }

      throw new Error(
        error.response?.data?.message || "Failed to update attendance"
      );
    }
  }

  // ============================================================================
  // FACULTY REPORTS & ANALYTICS
  // ============================================================================

  /**
   * Get attendance reports for faculty's assigned sections
   */
  static async getFacultyReports(
    facultyId: string,
    filters?: AttendanceFilters
  ): Promise<AttendanceApiResponse<AttendanceSession[]>> {
    try {
      console.log("📊 Fetching faculty reports:", { facultyId, filters });

      const params = new URLSearchParams();
      params.append("facultyId", facultyId);
      if (filters?.sectionId) params.append("sectionId", filters.sectionId);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);
      if (filters?.attendanceThreshold) {
        params.append(
          "attendanceThreshold",
          filters.attendanceThreshold.toString()
        );
      }

      const response = await apiClient.get(`/faculty/reports?${params}`);

      console.log("✅ Faculty reports loaded:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching faculty reports:", error);
      throw new Error(
        error.response?.data?.message || "Failed to load reports"
      );
    }
  }

  /**
   * Get student detail report (only for faculty's sections)
   */
  static async getStudentDetailReport(
    studentId: string
  ): Promise<AttendanceApiResponse<StudentAttendanceSummary>> {
    try {
      console.log("👤 Fetching student detail report:", studentId);

      const response = await apiClient.get(
        `/faculty/reports/student/${studentId}`
      );

      console.log("✅ Student detail report loaded:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching student report:", error);

      if (error.response?.status === 403) {
        throw new Error(
          "You are not authorized to view this student's attendance"
        );
      }

      throw new Error(
        error.response?.data?.message || "Failed to load student report"
      );
    }
  }

  /**
   * Get section-wise attendance summary for faculty
   */
  static async getSectionSummary(
    sectionId: string,
    filters?: AttendanceFilters
  ): Promise<
    AttendanceApiResponse<{
      section: { id: string; name: string; strength: number };
      totalSessions: number;
      averageAttendance: number;
      lastSessionDate: string;
      topPerformers: Student[];
      lowPerformers: Student[];
    }>
  > {
    try {
      console.log("📈 Fetching section summary:", sectionId);

      const params = new URLSearchParams();
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);

      const response = await apiClient.get(
        `/faculty/reports/section/${sectionId}?${params}`
      );

      console.log("✅ Section summary loaded:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching section summary:", error);

      if (error.response?.status === 403) {
        throw new Error("You are not authorized to view this section's data");
      }

      throw new Error(
        error.response?.data?.message || "Failed to load section summary"
      );
    }
  }

  // ============================================================================
  // FACULTY ANALYTICS
  // ============================================================================

  /**
   * Get attendance analytics for faculty's sections
   */
  static async getFacultyAnalytics(
    facultyId: string,
    filters?: AttendanceFilters
  ): Promise<
    AttendanceApiResponse<{
      overallStats: {
        totalSessions: number;
        totalStudents: number;
        averageAttendance: number;
        presentToday: number;
        absentToday: number;
      };
      sectionStats: Array<{
        sectionId: string;
        sectionName: string;
        totalSessions: number;
        averageAttendance: number;
        totalStudents: number;
        lastSessionDate: string;
      }>;
      dailyTrends: Array<{
        date: string;
        attendancePercentage: number;
        totalSessions: number;
        presentCount: number;
        absentCount: number;
      }>;
      topPerformers: Student[];
      lowPerformers: Student[];
    }>
  > {
    try {
      console.log("📊 Fetching faculty analytics:", { facultyId, filters });

      const params = new URLSearchParams();
      params.append("facultyId", facultyId);
      if (filters?.sectionId) params.append("sectionId", filters.sectionId);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);

      const response = await apiClient.get(
        `/faculty/analytics/attendance?${params}`
      );

      console.log("✅ Faculty analytics loaded:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching faculty analytics:", error);
      throw new Error(
        error.response?.data?.message || "Failed to load analytics"
      );
    }
  }

  /**
   * Export faculty attendance data as CSV
   */
  static async exportFacultyData(
    facultyId: string,
    filters?: AttendanceFilters
  ): Promise<Blob> {
    try {
      console.log("📤 Exporting faculty attendance data:", {
        facultyId,
        filters,
      });

      const params = new URLSearchParams();
      params.append("facultyId", facultyId);
      if (filters?.sectionId) params.append("sectionId", filters.sectionId);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);

      const response = await apiClient.get(
        `/faculty/analytics/export/csv?${params}`,
        {
          responseType: "blob",
        }
      );

      console.log("✅ Faculty data exported successfully");
      return response.data;
    } catch (error: any) {
      console.error("❌ Error exporting faculty data:", error);
      throw new Error(error.response?.data?.message || "Failed to export data");
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if faculty can mark attendance for a time slot
   */
  static async canMarkAttendance(
    facultyId: string,
    timeSlotId: string
  ): Promise<boolean> {
    try {
      const response = await apiClient.get(
        `/faculty/can-mark-attendance?facultyId=${facultyId}&timeSlotId=${timeSlotId}`
      );
      return response.data.canMark;
    } catch (error: any) {
      console.error("❌ Error checking attendance permission:", error);
      return false;
    }
  }

  /**
   * Get faculty's assigned sections
   */
  static async getAssignedSections(facultyId: string): Promise<
    AttendanceApiResponse<
      Array<{
        id: string;
        name: string;
        strength: number;
        training: { id: string; name: string };
      }>
    >
  > {
    try {
      const response = await apiClient.get(
        `/faculty/assigned-sections?id=${facultyId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching assigned sections:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get assigned sections"
      );
    }
  }

  /**
   * Format attendance submission for display
   */
  static formatAttendanceSubmission(session: AttendanceSession): {
    title: string;
    summary: string;
    details: string;
  } {
    const date = new Date(session.date).toLocaleDateString();
    const timeSlot = `${session.startTime}-${session.endTime}`;
    const percentage = session.attendancePercentage.toFixed(1);

    return {
      title: `${session.section?.name || "Section"} - ${date}`,
      summary: `${session.presentCount}/${session.totalStudents} students present (${percentage}%)`,
      details: `Topic: ${session.topicTaught} | Room: ${session.room} | Time: ${timeSlot}`,
    };
  }

  /**
   * Validate attendance data before submission
   */
  static validateAttendanceData(request: SubmitAttendanceRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check required fields
    if (!request.timeSlotId) errors.push("Time slot ID is required");
    if (!request.sectionId) errors.push("Section ID is required");
    if (!request.date) errors.push("Date is required");
    if (!request.topicTaught?.trim()) errors.push("Topic taught is required");
    if (!request.attendanceRecords?.length)
      errors.push("Attendance records are required");

    // Validate date format and not future date
    if (request.date) {
      const submissionDate = new Date(request.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today

      if (submissionDate > today) {
        errors.push("Cannot mark attendance for future dates");
      }
    }

    // Validate attendance records
    if (request.attendanceRecords) {
      console.log("Attendance records anta bhai", request.attendanceRecords);
      request.attendanceRecords.forEach((record, index) => {
        if (!record.studentId)
          errors.push(`Student ID missing for record ${index + 1}`);
        if (!record.regNum)
          errors.push(`Roll number missing for record ${index + 1}`);
        if (!record.name?.trim())
          errors.push(`Student name missing for record ${index + 1}`);
        if (typeof record.present !== "boolean")
          errors.push(`Attendance status invalid for record ${index + 1}`);
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
