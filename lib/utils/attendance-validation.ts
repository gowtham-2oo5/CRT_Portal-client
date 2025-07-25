// 🎯 CRT Portal Attendance System - Attendance Validation Utilities
// Created: 2025-07-15 | Phase 3 - Task 3.3

import type {
  SubmitAttendanceRequest,
  AttendanceRecord,
  AttendanceValidation,
} from "@/lib/types/attendance";
import type { Student } from "@/lib/types/section-management";

/**
 * Comprehensive attendance validation utility
 */
export class AttendanceValidator {
  /**
   * Validate attendance submission request
   */
  static validateSubmissionRequest(
    request: SubmitAttendanceRequest,
    students: Student[]
  ): AttendanceValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic field validation
    if (!request.timeSlotId) {
      errors.push("Time slot ID is required");
    }

    if (!request.sectionId) {
      errors.push("Section ID is required");
    }

    if (!request.date) {
      errors.push("Date is required");
    }

    if (!request.topicTaught?.trim()) {
      errors.push("Topic taught is required");
    }

    if (!request.attendanceRecords || request.attendanceRecords.length === 0) {
      errors.push("Attendance records are required");
    }

    // Date validation
    if (request.date) {
      const submissionDate = new Date(request.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (submissionDate > today) {
        errors.push("Cannot mark attendance for future dates");
      }

      // Check if date is too old (more than 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      if (submissionDate < weekAgo) {
        warnings.push("Marking attendance for a session more than 7 days old");
      }
    }

    // Topic validation
    if (request.topicTaught && request.topicTaught.length > 200) {
      errors.push("Topic taught must be less than 200 characters");
    }

    // Session notes validation
    if (request.sessionNotes && request.sessionNotes.length > 1000) {
      errors.push("Session notes must be less than 1000 characters");
    }

    // Attendance records validation
    if (request.attendanceRecords) {
      const studentIds = new Set<string>();

      request.attendanceRecords.forEach((record, index) => {
        const recordErrors = this.validateAttendanceRecord(record, index + 1);
        errors.push(...recordErrors);

        // Check for duplicate student IDs
        if (studentIds.has(record.studentId)) {
          errors.push(
            `Duplicate attendance record for student: ${record.name}`
          );
        }
        studentIds.add(record.studentId);
      });

      // Check if all students are accounted for
      const expectedStudentIds = new Set(students.map((s) => s.id));
      const providedStudentIds = new Set(
        request.attendanceRecords.map((r) => r.studentId)
      );

      const missingStudents = students.filter(
        (s) => !providedStudentIds.has(s.id)
      );
      const extraStudents = request.attendanceRecords.filter(
        (r) => !expectedStudentIds.has(r.studentId)
      );

      if (missingStudents.length > 0) {
        warnings.push(
          `${
            missingStudents.length
          } student(s) not included in attendance: ${missingStudents
            .map((s) => s.name)
            .join(", ")}`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      validationRules: {
        timeSlotAssignment: true, // This would be checked server-side
        sectionAccess: true, // This would be checked server-side
        dateValidation: !request.date || new Date(request.date) <= new Date(),
        studentValidation:
          errors.filter((e) => e.includes("not enrolled")).length === 0,
        duplicateCheck:
          errors.filter((e) => e.includes("Duplicate")).length === 0,
      },
    };
  }

  /**
   * Validate individual attendance record
   */
  static validateAttendanceRecord(
    record: AttendanceRecord,
    index: number
  ): string[] {
    const errors: string[] = [];

    if (!record.studentId) {
      errors.push(`Student ID missing for record ${index}`);
    }

    if (!record.regNum?.trim()) {
      errors.push(`Roll number missing for record ${index}`);
    }

    if (!record.name?.trim()) {
      errors.push(`Student name missing for record ${index}`);
    }

    if (typeof record.present !== "boolean") {
      errors.push(
        `Attendance status invalid for record ${index} (${
          record.name || "Unknown"
        })`
      );
    }

    // Feedback validation
    if (record.feedback && record.feedback.length > 500) {
      errors.push(
        `Feedback too long for record ${index} (${record.name || "Unknown"})`
      );
    }

    return errors;
  }

  /**
   * Calculate attendance statistics
   */
  static calculateAttendanceStats(records: AttendanceRecord[]): {
    total: number;
    present: number;
    absent: number;
    percentage: number;
    unmarked: number;
  } {
    const total = records.length;
    const present = records.filter((r) => r.present === true).length;
    const absent = records.filter((r) => r.present === false).length;
    const unmarked = records.filter((r) => r.present === undefined).length;
    const percentage =
      total > 0 ? Math.round((present / total) * 100 * 100) / 100 : 0;

    return { total, present, absent, unmarked, percentage };
  }

  /**
   * Check if attendance can be submitted
   */
  static canSubmitAttendance(
    records: Record<string, AttendanceRecord>,
    topicTaught: string
  ): { canSubmit: boolean; reason?: string } {
    if (!topicTaught.trim()) {
      return { canSubmit: false, reason: "Topic taught is required" };
    }

    const recordsArray = Object.values(records);
    const unmarked = recordsArray.filter((r) => r.present === undefined).length;

    if (unmarked > 0) {
      return {
        canSubmit: false,
        reason: `${unmarked} student(s) have unmarked attendance`,
      };
    }

    if (recordsArray.length === 0) {
      return { canSubmit: false, reason: "No students to mark attendance for" };
    }

    return { canSubmit: true };
  }

  /**
   * Format validation errors for display
   */
  static formatValidationErrors(validation: AttendanceValidation): {
    errorMessage: string;
    warningMessage?: string;
  } {
    let errorMessage = "";
    let warningMessage = "";

    if (validation.errors.length > 0) {
      errorMessage =
        validation.errors.length === 1
          ? validation.errors[0]
          : `${
              validation.errors.length
            } validation errors:\n• ${validation.errors.join("\n• ")}`;
    }

    if (validation.warnings.length > 0) {
      warningMessage =
        validation.warnings.length === 1
          ? validation.warnings[0]
          : `${
              validation.warnings.length
            } warnings:\n• ${validation.warnings.join("\n• ")}`;
    }

    return { errorMessage, warningMessage };
  }

  /**
   * Sanitize attendance data before submission
   */
  static sanitizeSubmissionData(
    request: SubmitAttendanceRequest
  ): SubmitAttendanceRequest {
    return {
      ...request,
      topicTaught: request.topicTaught.trim(),
      sessionNotes: request.sessionNotes?.trim() || undefined,
      attendanceRecords: request.attendanceRecords.map((record) => ({
        ...record,
        name: record.name.trim(),
        regNum: record.regNum.trim(),
        feedback: record.feedback?.trim() || undefined,
      })),
    };
  }
}

/**
 * Attendance submission helper functions
 */
export const AttendanceHelpers = {
  /**
   * Generate attendance summary text
   */
  generateSummaryText: (records: AttendanceRecord[]): string => {
    const stats = AttendanceValidator.calculateAttendanceStats(records);
    return `${stats.present}/${stats.total} students present (${stats.percentage}%)`;
  },

  /**
   * Check if session is within valid time range
   */
  isValidSessionTime: (startTime: string, endTime: string): boolean => {
    const now = new Date();
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const sessionStart = new Date();
    sessionStart.setHours(startHour, startMin, 0, 0);

    const sessionEnd = new Date();
    sessionEnd.setHours(endHour, endMin, 0, 0);

    // Allow marking attendance 30 minutes before session starts
    const allowedStart = new Date(sessionStart.getTime() - 30 * 60 * 1000);

    // Allow marking attendance up to 2 hours after session ends
    const allowedEnd = new Date(sessionEnd.getTime() + 2 * 60 * 60 * 1000);

    return now >= allowedStart && now <= allowedEnd;
  },

  /**
   * Format attendance record for display
   */
  formatAttendanceRecord: (record: AttendanceRecord): string => {
    const status =
      record.present === true
        ? "Present"
        : record.present === false
        ? "Absent"
        : "Unmarked";
    const feedback = record.feedback ? ` (${record.feedback})` : "";
    return `${record.name} (${record.regNum}): ${status}${feedback}`;
  },

  /**
   * Generate attendance export data
   */
  generateExportData: (
    records: AttendanceRecord[],
    sessionInfo: {
      sectionName: string;
      date: string;
      timeSlot: string;
      topicTaught: string;
    }
  ) => {
    return {
      sessionInfo,
      records: records.map((record) => ({
        regNum: record.regNum,
        name: record.name,
        status:
          record.present === true
            ? "Present"
            : record.present === false
            ? "Absent"
            : "Unmarked",
        feedback: record.feedback || "",
        markedAt: record.attendanceTime || "",
      })),
      summary: AttendanceValidator.calculateAttendanceStats(records),
    };
  },
};
