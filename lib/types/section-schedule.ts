// Section Schedule & TimeSlot Management Types
import { ReactNode } from "react";

export interface Faculty {
  empId: string;
  id: string;
  name: string;
  email: string;
}

export interface TimeSlot {
  id: number;
  inchargeFacultyId?: string; // Made optional for backward compatibility
  sectionId: string;
  roomId: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  slotType?: "REGULAR" | "BREAK" | "EXAM" | "SPECIAL"; // Made optional for backward compatibility
  title?: string; // Optional - for exams/breaks/special events
  description?: string; // Optional
  dayOfWeek?:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY"; // Made optional for backward compatibility

  // Display fields from API response
  inchargeFacultyName?: string;
  inchargeFacultyEmail?: string;
  inchargeFacultyPhone?: string;
  sectionName?: string;
  roomName?: string;

  // Legacy fields for backward compatibility (deprecated - will be removed)
  isBreak?: boolean; // Auto-set based on slotType
  breakDescription?: string; // Maps to title for BREAK type

  // Client-side computed fields
  duration?: number; // in minutes
  label?: string; // for display
  isCurrent?: boolean; // if currently active

  // 🎯 ATTENDANCE SYSTEM EXTENSIONS
  // Attendance-related fields
  hasAttendance?: boolean; // If attendance has been marked for today
  attendanceSessionId?: string; // Link to attendance session
  attendancePercentage?: number; // Today's attendance percentage
  lastAttendanceDate?: string; // Last date attendance was marked

  // Populated attendance data
  attendanceSession?: {
    id: string;
    date: string;
    topicTaught: string;
    presentCount: number;
    totalStudents: number;
    attendancePercentage: number;
  };

  // Faculty assignment details for attendance
  inchargeFaculty?: {
    id: string;
    name: string;
    email: string;
    canMarkAttendance: boolean; // Permission check
  };

  // Section details for attendance
  section?: {
    id: string;
    name: string;
    strength: number;
    activeStudents: number; // Students currently enrolled
  };

  // Room details for attendance
  room?: {
    id: string;
    roomString: string;
    capacity: number;
    roomType: string;
  };
}

// 🎯 NEW INTERFACES FOR WEEK SCHEDULE VIEW
export interface WeekScheduleCell {
  dayOfWeek: string;
  templateName: string;
  timeSlot?: TimeSlot;
  isEmpty: boolean;
}

export interface WeekScheduleRow {
  dayOfWeek: string;
  cells: WeekScheduleCell[];
}

export interface WeekScheduleView {
  sectionId: string;
  roomId: string;
  rows: WeekScheduleRow[];
  templates: string[]; // Template names
}

export interface CreateTimeSlotFromCellRequest {
  dayOfWeek: string;
  templateName: string;
  sectionId: string;
  roomId: string;
  isRecurring: boolean;
  // Other timeSlot fields will be populated from template
}

export interface CopyScheduleRequest {
  fromDay: string;
  toDay: string;
  sectionId: string;
  roomId: string;
  overwriteExisting?: boolean;
}

export interface QuickTemplateRequest {
  sectionId: string;
  roomId: string;
  templateName: string;
  days: string[]; // Array of day names
  isRecurring: boolean;
  facultyId: string;
  facultyName: string;
}

export interface SectionSchedule {
  id: string;
  sectionId: string;
  roomId: string;
  roomName: string;
  timeSlots: TimeSlot[];

  section?: {
    id: string;
    name: string;
    strength: number;
  };
  room?: {
    id: string;
    roomString: string;
    capacity: number;
  };
}

export interface CreateSectionScheduleRequest {
  sectionId: string;
  roomId: string;
}

// Updated request interfaces to match new API
export interface CreateTimeSlotRequest {
  inchargeFacultyId: string; // Required for new API
  sectionId: string; // Required
  roomId: string; // Required
  startTime: string; // Required - HH:mm format
  endTime: string; // Required - HH:mm format
  slotType?: "REGULAR" | "BREAK" | "EXAM" | "SPECIAL"; // Optional - Default: REGULAR
  title?: string; // Optional - for exams/breaks
  description?: string; // Optional
  dayOfWeek:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY"; // Required for new API

  // Legacy fields (deprecated - for backward compatibility)
  isBreak?: boolean; // Auto-set based on slotType
  breakDescription?: string; // Maps to title for BREAK type
}

export interface UpdateTimeSlotRequest {
  inchargeFacultyId?: string;
  sectionId?: string;
  roomId?: string;
  startTime?: string;
  endTime?: string;
  slotType?: "REGULAR" | "BREAK" | "EXAM" | "SPECIAL";
  title?: string;
  description?: string;
  dayOfWeek?:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";

  // Legacy fields (deprecated)
  isBreak?: boolean;
  breakDescription?: string;
}

// New validation response interface
export interface ValidationResponse {
  valid: boolean;
  message: string;
  reason?: string;
}

export interface ScheduleValidation {
  isValid: boolean;
  workMinutes: number; // Total work minutes
  breakMinutes: number; // Total break minutes
  requiredWorkMinutes: number; // 8 * 50 = 400
  requiredBreakMinutes: number; // 2 * 10 + 1 * 50 = 70
  warnings: string[];
}

export interface ScheduleFilters {
  sectionId?: string;
  roomId?: string;
  facultyId?: string;
}

// Helper function to ensure TimeSlot compatibility
export function ensureTimeSlotCompatibility(slot: Partial<TimeSlot>): TimeSlot {
  return {
    id: slot.id || 0,
    sectionId: slot.sectionId || "",
    roomId: slot.roomId || "",
    startTime: slot.startTime || "",
    endTime: slot.endTime || "",
    // Provide defaults for new optional fields
    inchargeFacultyId: slot.inchargeFacultyId || "",
    slotType: slot.slotType || (slot.isBreak ? "BREAK" : "REGULAR"),
    dayOfWeek: slot.dayOfWeek || "MONDAY",
    title: slot.title || (slot.isBreak ? slot.breakDescription : undefined),
    description: slot.description || "",
    // Legacy fields
    isBreak: slot.isBreak || slot.slotType === "BREAK",
    breakDescription:
      slot.breakDescription ||
      (slot.slotType === "BREAK" ? slot.title : undefined),
    // Copy other fields
    ...slot,
  } as TimeSlot;
}

// Day of week constants
export const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export const SLOT_TYPES = ["REGULAR", "BREAK", "EXAM", "SPECIAL"] as const;

// Helper type for day display
export const DAY_DISPLAY_NAMES: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

// Helper type for slot type display
export const SLOT_TYPE_DISPLAY_NAMES: Record<string, string> = {
  REGULAR: "Regular Class",
  BREAK: "Break",
  EXAM: "Examination",
  SPECIAL: "Special Event",
};
