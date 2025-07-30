import { ReactNode } from "react";
import { Student } from "./student-management";

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
  attendanceTime: string;
  feedback: any;
  name: any;
  regNum: any;
  studentId: string;
  present: boolean;
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
