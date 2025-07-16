// 🎯 CRT Portal Attendance System - Section Attendance Service
// Created: 2025-07-16 | Phase 1 - Task 2.1

import { ClientAuth } from "@/lib/auth/client";

/**
 * Interface for section attendance records as specified in get-attd.md
 */
export interface SectionAttendanceRecord {
  regNum: string;
  name: string;
  attendancePercentage: number;
  monthTitle: string;
  totalClasses: number;
  absences: number;
}

/**
 * Service for managing section attendance records
 */
export class SectionAttendanceService {
  private static async getAuthenticatedApi() {
    try {
      return ClientAuth.createAuthenticatedApi();
    } catch (error) {
      console.error(
        "[SectionAttendanceService] Failed to create authenticated API:",
        error
      );
      throw new Error("Authentication required");
    }
  }

  /**
   * Get attendance records for all students in a section within a date range
   * @param sectionId - The section ID
   * @param startDate - Start date for attendance records (YYYY-MM-DD)
   * @param endDate - End date for attendance records (YYYY-MM-DD)
   * @returns Array of student attendance records
   */
  static async getSectionAttendance(
    sectionId: string,
    startDate: string,
    endDate: string
  ): Promise<SectionAttendanceRecord[]> {
    try {
      console.log("📊 Fetching section attendance:", {
        sectionId,
        startDate,
        endDate,
      });

      const api = await this.getAuthenticatedApi();
      const response = await api.get(
        `/attendance/section/${sectionId}?startDate=${startDate}&endDate=${endDate}`
      );

      console.log("✅ Section attendance loaded:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching section attendance:", error);

      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new Error("Invalid date format. Please use YYYY-MM-DD format.");
      }
      if (error.response?.status === 404) {
        throw new Error("Section not found");
      }
      if (error.response?.status === 401) {
        throw new Error("Unauthorized access");
      }

      throw new Error(
        error.response?.data?.message || "Failed to load section attendance"
      );
    }
  }

  /**
   * Get students list for a section
   * @param sectionId - The section ID
   * @returns Object containing array of students in the section
   */
  static async getSectionStudents(sectionId: string): Promise<{students: any[]}> {
    try {
      console.log("👥 Fetching section students:", sectionId);

      const api = await this.getAuthenticatedApi();
      const response = await api.get(`/faculty/students/${sectionId}`);

      console.log("✅ Section students loaded:", response.data);
      
      // Log the crtEligibility values to debug
      if (response.data && response.data.students && Array.isArray(response.data.students)) {
        response.data.students.forEach((student: any, index: number) => {
          console.log(`Student ${index} (${student.name}) crtEligibility:`, student.crtEligibility);
        });
      }
      
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching section students:", error);
      throw new Error(
        error.response?.data?.message || "Failed to load section students"
      );
    }
  }

  /**
   * Export section attendance as CSV
   * @param sectionId - The section ID
   * @param startDate - Start date for attendance records (YYYY-MM-DD)
   * @param endDate - End date for attendance records (YYYY-MM-DD)
   * @returns Blob containing CSV data
   */
  static async exportSectionAttendanceCSV(
    sectionId: string,
    startDate: string,
    endDate: string
  ): Promise<Blob> {
    try {
      console.log("📤 Exporting section attendance as CSV:", {
        sectionId,
        startDate,
        endDate,
      });

      const api = await this.getAuthenticatedApi();
      const response = await api.get(
        `/attendance/section/${sectionId}/export?startDate=${startDate}&endDate=${endDate}&format=csv`,
        {
          responseType: "blob",
        }
      );

      console.log("✅ Section attendance CSV exported");
      return response.data;
    } catch (error: any) {
      console.error("❌ Error exporting section attendance:", error);
      throw new Error(
        error.response?.data?.message || "Failed to export attendance data"
      );
    }
  }

  /**
   * Helper function to get default date range (current month)
   * @returns Object with startDate and endDate strings
   */
  static getDefaultDateRange(): { startDate: string; endDate: string } {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  }

  /**
   * Helper function to format date for display
   * @param dateStr - Date string in YYYY-MM-DD format
   * @returns Formatted date string (e.g., "January 2024")
   */
  static formatMonthTitle(dateStr: string): string {
    const date = new Date(dateStr);
    return date
      .toLocaleString("default", { month: "long", year: "numeric" })
      .toUpperCase();
  }
}
