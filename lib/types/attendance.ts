// 🎯 CRT Portal Attendance System - Type Definitions
// Created: 2025-07-15 | Phase 1 - Task 1.1

import type { Student } from './section-management';
import type { TimeSlot } from './section-schedule';
import type { User } from './user-management';

// ============================================================================
// CORE ATTENDANCE INTERFACES
// ============================================================================

/**
 * Individual student attendance record for a specific session
 */
export interface AttendanceRecord {
  id?: string; // Optional for creation, required for updates
  studentId: string;
  rollNumber: string;
  name: string;
  present: boolean;
  feedback?: string; // Optional feedback/notes about the student
  lateArrival?: boolean; // If student arrived late
  earlyDeparture?: boolean; // If student left early
  attendanceTime?: string; // ISO timestamp when attendance was marked
}

/**
 * Complete attendance session for a time slot
 */
export interface AttendanceSession {
  id: string;
  facultyId: string;
  sectionId: string;
  timeSlotId: string;
  date: string; // YYYY-MM-DD format
  topicTaught: string;
  sessionNotes?: string; // Additional notes about the session
  
  // Session metadata
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  room: string;
  
  // Attendance statistics
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount?: number;
  attendancePercentage: number;
  
  // Timestamps
  submittedAt: string; // ISO timestamp
  createdAt?: string;
  updatedAt?: string;
  
  // Related data
  attendanceRecords: AttendanceRecord[];
  section?: {
    id: string;
    name: string;
    strength: number;
  };
  faculty?: {
    id: string;
    name: string;
    email: string;
  };
  timeSlot?: TimeSlot;
}

/**
 * Archived attendance data for historical records
 */
export interface AttendanceArchive {
  id: string;
  originalSessionId: string;
  archiveDate: string; // YYYY-MM-DD when archived
  academicYear: string; // e.g., "2024-25"
  semester: string; // e.g., "Fall", "Spring"
  
  // Archived session data (snapshot)
  sessionData: AttendanceSession;
  
  // Archive metadata
  archivedBy: string; // User ID who archived
  reason?: string; // Reason for archiving
  createdAt: string;
}

// ============================================================================
// FACULTY DASHBOARD INTERFACES
// ============================================================================

/**
 * Enhanced faculty profile with attendance-related data
 */
export interface FacultyProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  employeeId: string;
  subjects: string[];
  assignedSections: string[]; // Section IDs assigned to this faculty
}

/**
 * Current active session information
 */
export interface CurrentSession {
  hasActiveSession: boolean;
  currentSlot?: {
    id: string;
    startTime: string;
    endTime: string;
    sectionName: string;
    sectionId: string;
    room: string;
    active: boolean;
    timeRemaining?: number; // Minutes remaining in session
  };
  nextSlot?: {
    id: string;
    startTime: string;
    endTime: string;
    sectionName: string;
    sectionId: string;
    room: string;
    timeUntilStart?: number; // Minutes until session starts
  };
}

/**
 * Faculty dashboard data aggregation
 */
export interface FacultyDashboardData {
  profile: FacultyProfile;
  currentSession: CurrentSession;
  todaySchedule: TimeSlot[];
  todayStats: {
    totalSessions: number;
    completedSessions: number;
    attendanceSubmitted: number;
    averageAttendance: number;
  };
  weeklyStats: {
    totalSessions: number;
    attendanceSubmitted: number;
    averageAttendance: number;
  };
  recentSessions: AttendanceSession[];
}

// ============================================================================
// ANALYTICS & REPORTING INTERFACES
// ============================================================================

/**
 * Attendance analytics for sections and students
 */
export interface AttendanceAnalytics {
  overallStats: {
    totalSessions: number;
    totalStudents: number;
    averageAttendance: number;
    presentToday: number;
    absentToday: number;
    trendDirection: 'up' | 'down' | 'stable';
  };
  
  sectionStats: {
    sectionId: string;
    sectionName: string;
    totalSessions: number;
    averageAttendance: number;
    totalStudents: number;
    lastSessionDate: string;
  }[];
  
  dailyTrends: {
    date: string; // YYYY-MM-DD
    attendancePercentage: number;
    totalSessions: number;
    presentCount: number;
    absentCount: number;
  }[];
  
  topPerformers: {
    studentId: string;
    name: string;
    rollNumber: string;
    attendancePercentage: number;
    totalSessions: number;
  }[];
  
  lowPerformers: {
    studentId: string;
    name: string;
    rollNumber: string;
    attendancePercentage: number;
    totalSessions: number;
    consecutiveAbsences: number;
  }[];
}

/**
 * Student-specific attendance summary
 */
export interface StudentAttendanceSummary {
  student: {
    id: string;
    regNum: string;
    name: string;
    rollNumber: string;
    section: string;
  };
  attendanceSummary: {
    totalSessions: number;
    attendedSessions: number;
    attendancePercentage: number;
    consecutiveAbsences: number;
    lastAttended: string; // ISO timestamp
    trend: 'improving' | 'declining' | 'stable';
  };
  sessionHistory: {
    id: string;
    date: string;
    topicTaught: string;
    timeSlot: string;
    room: string;
    present: boolean;
    feedback?: string;
    lateArrival?: boolean;
  }[];
}

// ============================================================================
// REQUEST/RESPONSE INTERFACES
// ============================================================================

/**
 * Faculty attendance submission request
 */
export interface SubmitAttendanceRequest {
  timeSlotId: string;
  sectionId: string;
  date: string; // YYYY-MM-DD
  topicTaught: string;
  sessionNotes?: string;
  attendanceRecords: AttendanceRecord[];
}

/**
 * Admin attendance marking request
 */
export interface AdminAttendanceRequest {
  timeSlotId: string;
  dateTime: string; // ISO timestamp
  absentStudentIds: string[];
  lateStudents?: {
    studentId: string;
    feedback?: string;
  }[];
  topicTaught?: string;
  sessionNotes?: string;
}

/**
 * Bulk attendance upload request
 */
export interface BulkAttendanceUploadRequest {
  file: File;
  timeSlotId: string;
  dateTime: string;
  topicTaught: string;
}

/**
 * Attendance report filters
 */
export interface AttendanceFilters {
  sectionId?: string;
  studentId?: string;
  facultyId?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  attendanceThreshold?: number; // Minimum attendance percentage
  includeArchived?: boolean;
}

/**
 * Export request parameters
 */
export interface AttendanceExportRequest {
  format: 'csv' | 'excel' | 'pdf';
  filters: AttendanceFilters;
  includeDetails: boolean;
  includeAnalytics: boolean;
}

// ============================================================================
// API RESPONSE INTERFACES
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface AttendanceApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Session students response
 */
export interface SessionStudentsResponse {
  students: Student[];
  totalCount: number;
  sectionName: string;
  sectionId: string;
  timeSlot: {
    id: number;
    startTime: string;
    endTime: string;
    roomId: string;
    sectionId: string;
    inchargeFacultyId: string;
    isBreak: boolean;
    breakDescription: string;
  };
}

/**
 * Attendance submission response
 */
export interface AttendanceSubmissionResponse {
  success: boolean;
  message: string;
  attendanceSession: AttendanceSession;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Attendance status enumeration
 */
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

/**
 * Session status enumeration
 */
export type SessionStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

/**
 * Report type enumeration
 */
export type ReportType = 'student' | 'section' | 'faculty' | 'overall';

/**
 * Time period for analytics
 */
export type TimePeriod = 'today' | 'week' | 'month' | 'semester' | 'custom';

/**
 * Sort options for attendance data
 */
export interface AttendanceSortOptions {
  field: 'date' | 'attendance' | 'name' | 'section';
  direction: 'asc' | 'desc';
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  total?: number;
}

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * Attendance validation rules
 */
export interface AttendanceValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validationRules: {
    timeSlotAssignment: boolean; // Faculty assigned to time slot
    sectionAccess: boolean; // Faculty can access section
    dateValidation: boolean; // Valid date, not future
    studentValidation: boolean; // All students belong to section
    duplicateCheck: boolean; // No duplicate attendance for session
  };
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  errors: {
    row: number;
    studentId?: string;
    error: string;
  }[];
  warnings: string[];
}
