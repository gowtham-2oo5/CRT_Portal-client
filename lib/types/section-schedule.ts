// Section Schedule & TimeSlot Management Types

export interface Faculty {
  id: string;
  name: string;
  email: string;
}

export interface TimeSlot {
  id: number;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isBreak: boolean;
  breakDescription?: string;
  inchargeFacultyId?: string; // Optional for breaks
  sectionId: string;
  roomId: string;
  // Additional fields for UI
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

export interface SectionSchedule {
  id: string;
  sectionId: string;
  roomId: string;
  timeSlots: TimeSlot[];
  // Populated data for display
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

export interface CreateTimeSlotRequest {
  startTime: string;
  endTime: string;
  isBreak: boolean;
  breakDescription: string; // Always send
  inchargeFacultyId: string; // Always send (even for breaks)
  sectionId: string; // Always send
  roomId: string; // Always send
}

export interface UpdateTimeSlotRequest {
  startTime?: string;
  endTime?: string;
  isBreak?: boolean;
  breakDescription?: string;
  inchargeFacultyId?: string;
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
