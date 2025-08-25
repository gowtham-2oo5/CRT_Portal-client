import { ReactNode } from "react";
import { Student } from "./student-management";

// Missing types that other components are trying to import
export interface CurrentSession {
  id: string;
  timeSlotId: string;
  sectionId: string;
  date: string;
  topicTaught?: string;
  sessionNotes?: string;
  status: "ACTIVE" | "COMPLETED" | "PENDING";
  startTime: string;
  endTime: string;
  sectionName: string;
  roomName: string;
  facultyId: string;
  facultyName: string;
  // Additional properties used by components
  hasActiveSession?: boolean;
  nextSlot?: {
    id: string;
    startTime: string;
    endTime: string;
    sectionName: string;
    roomName: string;
  };
  currentSlot?: {
    id: string;
    startTime: string;
    endTime: string;
    sectionName: string;
    roomName: string;
  };
  // Legacy compatibility
  room?: string;
  active?: boolean;
  timeRemaining?: number;
}

export interface FacultyDashboardData {
  currentSession?: CurrentSession;
  todaysSessions: DailyTimeSlot[];
  pendingAttendance: FilteredTimeSlot[];
  recentSessions: AttendanceSession[];
  stats: {
    totalSessions: number;
    completedSessions: number;
    pendingSessions: number;
    averageAttendance: number;
  };
}

export interface AttendanceSession {
  id: string;
  timeSlotId: string;
  sectionId: string;
  date: string;
  topicTaught: string;
  sessionNotes?: string;
  presentCount: number;
  totalStudents: number;
  attendancePercentage: number;
  status: "COMPLETED" | "PENDING";
  submittedAt?: string;
  submittedBy?: string;
}

export interface AttendanceFilters {
  sectionId?: string;
  facultyId?: string;
  dateFrom?: string;
  dateTo?: string;
  startDate: string;
  endDate: string;
  status?: "COMPLETED" | "PENDING" | "ALL";
  minAttendance?: number;
  maxAttendance?: number;
}

export interface StudentAttendanceSummary {
  studentId: string;
  studentName: string;
  regNum: string;
  totalSessions: number;
  attendedSessions: number;
  attendancePercentage: number;
  recentAttendance: {
    date: string;
    present: boolean;
    timeSlotId: string;
  }[];
}

export interface AttendanceAnalytics {
  overallStats: {
    totalSessions: number;
    averageAttendance: number;
    totalStudents: number;
    activeSections: number;
  };
  sectionWiseStats: {
    sectionId: string;
    sectionName: string;
    totalSessions: number;
    averageAttendance: number;
    studentCount: number;
  }[];
  facultyWiseStats: {
    facultyId: string;
    facultyName: string;
    totalSessions: number;
    averageAttendance: number;
    sectionsHandled: number;
  }[];
  attendanceTrends: {
    date: string;
    attendancePercentage: number;
    sessionCount: number;
  }[];
}

export interface FilteredTimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  breakDescription?: string;
  inchargeFacultyId: string;
  inchargeFacultyName: string;
  inchargeFacultyEmail: string;
  inchargeFacultyPhone: string;
  sectionId: string;
  sectionName: string;
  roomId: string;
  roomName: string;
  // Additional fields that might be added by the filter endpoint
  attendancePosted?: boolean;
  pastEndTime?: boolean;
  day?: string;
}

export interface FacultyWithPendingAttendance {
  id: string;
  name: string;
  email: string;
  phone: string;
  pendingCount?: number; // Number of pending attendance sessions
}

export interface TimeSlotFilterResponse {
  totalTimeSlots: number;
  postedAttendanceCount: number;
  pendingAttendanceCount: number;
  timeSlots: FilteredTimeSlot[]; // These are now TimeSlotDTO objects
  facultiesWithPendingAttendance: FacultyWithPendingAttendance[];
}

export interface DailyTimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  attendanceStatus: "SUBMITTED" | "PENDING" | "NOT_APPLICABLE";
}

export interface Absentee {
  id: string;
  name: string;
  email: string;
}

export interface SessionStudentsResponse {
  students: Student[];
  totalCount: number;
  sectionName: string;
  sectionId: string;
  timeSlot: {
    roomName: ReactNode;
    id: string;
    startTime: string;
    endTime: string;
  };
}

export interface SubmitAttendanceRequest {
  timeSlotId: string;
  sectionId: string;
  date: string;
  topicTaught: string;
  sessionNotes?: string;
  attendanceRecords: AttendanceRecord[];
  isAdminRequest?: boolean; // New field for admin-based requests
}

export interface AttendanceRecord {
  studentId: string;
  present: boolean;
  attendanceTime?: string; // Made optional for backward compatibility
  feedback?: any; // Made optional for backward compatibility
  // Legacy fields for backward compatibility
  name?: any;
  regNum?: any;
}
// Batch attendance types
export interface TimeSlotValidationResponse {
  valid: boolean;
  message: string;
  reason?: string;
  timeSlots: {
    id: string;
    startTime: string;
    endTime: string;
    sectionId: string;
    sectionName: string;
  }[];
}

export interface BatchableTimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  attendanceStatus: "PENDING" | "POSTED" | "MISSED";
}

export interface BatchGroup {
  sectionId: string;
  sectionName: string;
  batchableSlots: BatchableTimeSlot[];
}

export interface BatchableTimeSlotsResponse {
  batchGroups: BatchGroup[];
}

export interface BatchSubmissionResult {
  timeSlotId: string;
  status: "success" | "error";
  error?: string;
}

export interface BatchSubmissionResponse {
  success: boolean;
  message: string;
  results: BatchSubmissionResult[];
}
