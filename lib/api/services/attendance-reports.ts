// 🎯 CRT Portal Attendance System - Reports & Analytics Services
// Created: 2025-07-15 | Phase 1 - Task 1.2

import { publicApi } from "../client";
import type {
  AttendanceSession,
  AttendanceAnalytics,
  StudentAttendanceSummary,
  AttendanceFilters,
  AttendanceExportRequest,
  AttendanceApiResponse,
  TimePeriod,
  ReportType,
} from "../../types/attendance";
import type { Student } from "../../types/section-management";

/**
 * Attendance Report Service
 * Handles comprehensive reporting functionality for attendance data
 */
export class AttendanceReportService {
  // ============================================================================
  // COMPREHENSIVE REPORTS
  // ============================================================================

  /**
   * Generate comprehensive attendance report
   */
  static async generateComprehensiveReport(
    reportType: ReportType,
    filters: AttendanceFilters
  ): Promise<
    AttendanceApiResponse<{
      reportMetadata: {
        type: ReportType;
        generatedAt: string;
        filters: AttendanceFilters;
        totalRecords: number;
      };
      summary: {
        totalSessions: number;
        totalStudents: number;
        averageAttendance: number;
        highestAttendance: number;
        lowestAttendance: number;
      };
      data: AttendanceSession[] | StudentAttendanceSummary[];
    }>
  > {
    try {
      console.log("📊 Generating comprehensive report:", {
        reportType,
        filters,
      });

      const response = await api.post("/reports/comprehensive", {
        reportType,
        filters,
      });

      console.log("✅ Comprehensive report generated:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error generating comprehensive report:", error);
      throw new Error(
        error.response?.data?.message || "Failed to generate report"
      );
    }
  }

  /**
   * Get attendance summary by date range
   */
  static async getAttendanceSummaryByDateRange(
    startDate: string,
    endDate: string,
    sectionId?: string,
    facultyId?: string
  ): Promise<
    AttendanceApiResponse<{
      dateRange: { start: string; end: string };
      totalDays: number;
      sessionsPerDay: Array<{
        date: string;
        sessionCount: number;
        averageAttendance: number;
        totalStudents: number;
        presentCount: number;
      }>;
      overallSummary: {
        totalSessions: number;
        averageAttendance: number;
        bestDay: { date: string; attendance: number };
        worstDay: { date: string; attendance: number };
      };
    }>
  > {
    try {
      const params = new URLSearchParams();
      params.append("startDate", startDate);
      params.append("endDate", endDate);
      if (sectionId) params.append("sectionId", sectionId);
      if (facultyId) params.append("facultyId", facultyId);

      const response = await api.get(`/reports/date-range-summary?${params}`);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching date range summary:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get date range summary"
      );
    }
  }

  /**
   * Get low attendance students report
   */
  static async getLowAttendanceStudents(
    threshold: number = 75,
    sectionId?: string,
    facultyId?: string
  ): Promise<
    AttendanceApiResponse<{
      threshold: number;
      studentsBelow: Array<{
        student: Student;
        attendancePercentage: number;
        totalSessions: number;
        attendedSessions: number;
        consecutiveAbsences: number;
        lastAttended: string;
        sections: string[];
      }>;
      summary: {
        totalStudents: number;
        studentsBelow: number;
        percentageBelow: number;
      };
    }>
  > {
    try {
      const params = new URLSearchParams();
      params.append("threshold", threshold.toString());
      if (sectionId) params.append("sectionId", sectionId);
      if (facultyId) params.append("facultyId", facultyId);

      const response = await api.get(`/reports/low-attendance?${params}`);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching low attendance report:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get low attendance report"
      );
    }
  }

  /**
   * Get section comparison report
   */
  static async getSectionComparisonReport(
    sectionIds: string[],
    timePeriod: TimePeriod = "month"
  ): Promise<
    AttendanceApiResponse<{
      timePeriod: TimePeriod;
      sections: Array<{
        sectionId: string;
        sectionName: string;
        totalStudents: number;
        totalSessions: number;
        averageAttendance: number;
        highestAttendance: number;
        lowestAttendance: number;
        trend: "improving" | "declining" | "stable";
      }>;
      comparison: {
        bestPerforming: { sectionId: string; attendance: number };
        worstPerforming: { sectionId: string; attendance: number };
        overallAverage: number;
      };
    }>
  > {
    try {
      const response = await api.post("/reports/section-comparison", {
        sectionIds,
        timePeriod,
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching section comparison:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get section comparison"
      );
    }
  }

  // ============================================================================
  // EXPORT FUNCTIONALITY
  // ============================================================================

  /**
   * Export attendance report as CSV
   */
  static async exportAsCSV(
    filters: AttendanceFilters,
    includeDetails: boolean = true
  ): Promise<Blob> {
    try {
      console.log("📤 Exporting attendance as CSV:", filters);

      const response = await api.post(
        "/reports/export/csv",
        {
          filters,
          includeDetails,
        },
        {
          responseType: "blob",
        }
      );

      console.log("✅ CSV export completed");
      return response.data;
    } catch (error: any) {
      console.error("❌ Error exporting CSV:", error);
      throw new Error(error.response?.data?.message || "Failed to export CSV");
    }
  }

  /**
   * Export attendance report as Excel
   */
  static async exportAsExcel(
    filters: AttendanceFilters,
    includeCharts: boolean = true
  ): Promise<Blob> {
    try {
      console.log("📊 Exporting attendance as Excel:", filters);

      const response = await api.post(
        "/reports/export/excel",
        {
          filters,
          includeCharts,
        },
        {
          responseType: "blob",
        }
      );

      console.log("✅ Excel export completed");
      return response.data;
    } catch (error: any) {
      console.error("❌ Error exporting Excel:", error);
      throw new Error(
        error.response?.data?.message || "Failed to export Excel"
      );
    }
  }

  /**
   * Export attendance report as PDF
   */
  static async exportAsPDF(
    filters: AttendanceFilters,
    includeAnalytics: boolean = true
  ): Promise<Blob> {
    try {
      console.log("📄 Exporting attendance as PDF:", filters);

      const response = await api.post(
        "/reports/export/pdf",
        {
          filters,
          includeAnalytics,
        },
        {
          responseType: "blob",
        }
      );

      console.log("✅ PDF export completed");
      return response.data;
    } catch (error: any) {
      console.error("❌ Error exporting PDF:", error);
      throw new Error(error.response?.data?.message || "Failed to export PDF");
    }
  }

  // ============================================================================
  // SCHEDULED REPORTS
  // ============================================================================

  /**
   * Schedule automatic report generation
   */
  static async scheduleReport(reportConfig: {
    name: string;
    reportType: ReportType;
    filters: AttendanceFilters;
    frequency: "daily" | "weekly" | "monthly";
    recipients: string[]; // Email addresses
    format: "csv" | "excel" | "pdf";
  }): Promise<AttendanceApiResponse<{ scheduleId: string }>> {
    try {
      console.log("⏰ Scheduling report:", reportConfig);

      const response = await api.post("/reports/schedule", reportConfig);

      console.log("✅ Report scheduled:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error scheduling report:", error);
      throw new Error(
        error.response?.data?.message || "Failed to schedule report"
      );
    }
  }

  /**
   * Get scheduled reports
   */
  static async getScheduledReports(): Promise<
    AttendanceApiResponse<
      Array<{
        id: string;
        name: string;
        reportType: ReportType;
        frequency: string;
        nextRun: string;
        isActive: boolean;
        createdAt: string;
      }>
    >
  > {
    try {
      const response = await api.get("/reports/scheduled");
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching scheduled reports:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get scheduled reports"
      );
    }
  }
}

/**
 * Attendance Analytics Service
 * Handles advanced analytics and insights for attendance data
 */
export class AttendanceAnalyticsService {
  // ============================================================================
  // ADVANCED ANALYTICS
  // ============================================================================

  /**
   * Get comprehensive attendance analytics
   */
  static async getAttendanceAnalytics(
    filters?: AttendanceFilters
  ): Promise<AttendanceApiResponse<AttendanceAnalytics>> {
    try {
      console.log("📊 Fetching attendance analytics:", filters);

      const params = new URLSearchParams();
      if (filters?.sectionId) params.append("sectionId", filters.sectionId);
      if (filters?.facultyId) params.append("facultyId", filters.facultyId);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);

      const response = await api.get(`/analytics/attendance?${params}`);

      console.log("✅ Analytics loaded:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching analytics:", error);
      throw new Error(
        error.response?.data?.message || "Failed to load analytics"
      );
    }
  }

  /**
   * Get attendance trends over time
   */
  static async getAttendanceTrends(
    timePeriod: TimePeriod,
    filters?: AttendanceFilters
  ): Promise<
    AttendanceApiResponse<{
      timePeriod: TimePeriod;
      trends: Array<{
        period: string; // Date or week/month identifier
        attendancePercentage: number;
        totalSessions: number;
        totalStudents: number;
        presentCount: number;
        absentCount: number;
      }>;
      analysis: {
        overallTrend: "improving" | "declining" | "stable";
        trendPercentage: number; // Percentage change
        bestPeriod: { period: string; attendance: number };
        worstPeriod: { period: string; attendance: number };
      };
    }>
  > {
    try {
      const params = new URLSearchParams();
      params.append("timePeriod", timePeriod);
      if (filters?.sectionId) params.append("sectionId", filters.sectionId);
      if (filters?.facultyId) params.append("facultyId", filters.facultyId);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);

      const response = await api.get(`/analytics/trends?${params}`);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching trends:", error);
      throw new Error(error.response?.data?.message || "Failed to get trends");
    }
  }

  /**
   * Get predictive attendance insights
   */
  static async getPredictiveInsights(
    sectionId?: string,
    studentId?: string
  ): Promise<
    AttendanceApiResponse<{
      predictions: {
        nextWeekAttendance: number;
        nextMonthAttendance: number;
        semesterProjection: number;
      };
      riskFactors: Array<{
        factor: string;
        impact: "high" | "medium" | "low";
        description: string;
      }>;
      recommendations: Array<{
        action: string;
        priority: "high" | "medium" | "low";
        expectedImpact: string;
      }>;
    }>
  > {
    try {
      const params = new URLSearchParams();
      if (sectionId) params.append("sectionId", sectionId);
      if (studentId) params.append("studentId", studentId);

      const response = await api.get(`/analytics/predictions?${params}`);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching predictions:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get predictions"
      );
    }
  }

  /**
   * Get attendance correlation analysis
   */
  static async getCorrelationAnalysis(
    factors: Array<
      "day_of_week" | "time_of_day" | "weather" | "events" | "holidays"
    >
  ): Promise<
    AttendanceApiResponse<{
      correlations: Array<{
        factor: string;
        correlation: number; // -1 to 1
        significance: "high" | "medium" | "low";
        insights: string[];
      }>;
      recommendations: string[];
    }>
  > {
    try {
      const response = await api.post("/analytics/correlations", { factors });
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching correlations:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get correlations"
      );
    }
  }

  // ============================================================================
  // PERFORMANCE METRICS
  // ============================================================================

  /**
   * Get faculty performance metrics
   */
  static async getFacultyPerformanceMetrics(facultyId?: string): Promise<
    AttendanceApiResponse<{
      facultyMetrics: Array<{
        facultyId: string;
        facultyName: string;
        assignedSections: number;
        totalSessions: number;
        averageAttendance: number;
        consistencyScore: number; // 0-100
        engagementScore: number; // 0-100
        ranking: number;
      }>;
      benchmarks: {
        averageAttendance: number;
        topPerformer: { facultyId: string; attendance: number };
        improvementNeeded: { facultyId: string; attendance: number };
      };
    }>
  > {
    try {
      const params = new URLSearchParams();
      if (facultyId) params.append("facultyId", facultyId);

      const response = await api.get(
        `/analytics/faculty-performance?${params}`
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching faculty metrics:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get faculty metrics"
      );
    }
  }

  /**
   * Get section performance comparison
   */
  static async getSectionPerformanceComparison(): Promise<
    AttendanceApiResponse<{
      sections: Array<{
        sectionId: string;
        sectionName: string;
        averageAttendance: number;
        consistency: number;
        improvement: number; // Percentage change over time
        ranking: number;
        studentsAtRisk: number; // Students below threshold
      }>;
      insights: {
        bestPerforming: string[];
        needsAttention: string[];
        mostImproved: string[];
        recommendations: string[];
      };
    }>
  > {
    try {
      const response = await api.get("/analytics/section-performance");
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching section performance:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get section performance"
      );
    }
  }

  // ============================================================================
  // REAL-TIME ANALYTICS
  // ============================================================================

  /**
   * Get real-time attendance dashboard data
   */
  static async getRealTimeDashboard(): Promise<
    AttendanceApiResponse<{
      currentStats: {
        activeSessions: number;
        studentsPresent: number;
        totalStudents: number;
        currentAttendanceRate: number;
      };
      todayStats: {
        completedSessions: number;
        averageAttendance: number;
        totalStudentsMarked: number;
      };
      alerts: Array<{
        type: "low_attendance" | "missing_session" | "system_issue";
        message: string;
        severity: "high" | "medium" | "low";
        timestamp: string;
      }>;
      recentActivity: Array<{
        action: string;
        facultyName: string;
        sectionName: string;
        timestamp: string;
        attendanceRate: number;
      }>;
    }>
  > {
    try {
      const response = await api.get("/analytics/real-time-dashboard");
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching real-time dashboard:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get real-time data"
      );
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Calculate attendance statistics
   */
  static calculateAttendanceStats(sessions: AttendanceSession[]): {
    totalSessions: number;
    averageAttendance: number;
    highestAttendance: number;
    lowestAttendance: number;
    totalStudents: number;
    totalPresent: number;
  } {
    if (!sessions.length) {
      return {
        totalSessions: 0,
        averageAttendance: 0,
        highestAttendance: 0,
        lowestAttendance: 0,
        totalStudents: 0,
        totalPresent: 0,
      };
    }

    const totalSessions = sessions.length;
    const attendancePercentages = sessions.map((s) => s.attendancePercentage);
    const totalStudents = sessions.reduce((sum, s) => sum + s.totalStudents, 0);
    const totalPresent = sessions.reduce((sum, s) => sum + s.presentCount, 0);

    return {
      totalSessions,
      averageAttendance:
        attendancePercentages.reduce((sum, p) => sum + p, 0) / totalSessions,
      highestAttendance: Math.max(...attendancePercentages),
      lowestAttendance: Math.min(...attendancePercentages),
      totalStudents,
      totalPresent,
    };
  }

  /**
   * Generate attendance insights
   */
  static generateInsights(analytics: AttendanceAnalytics): string[] {
    const insights: string[] = [];

    if (analytics.overallStats.averageAttendance < 75) {
      insights.push(
        "Overall attendance is below the recommended 75% threshold"
      );
    }

    if (analytics.overallStats.trendDirection === "down") {
      insights.push(
        "Attendance trend is declining - intervention may be needed"
      );
    }

    if (analytics.lowPerformers.length > analytics.topPerformers.length) {
      insights.push(
        "More students are underperforming than excelling in attendance"
      );
    }

    return insights;
  }
}
