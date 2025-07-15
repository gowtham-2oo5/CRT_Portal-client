// Section Management Types based on API schema

export interface Training {
  id: string;
  name: string;
  sn: string;
  sections?: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  rollNumber: string;
  regNum: string;
  department: string;
  section: string;
  batch: "Y22" | "Y23" | "Y24" | "Y25";
  crtEligibility: boolean;
  feedback?: string;
  attendancePercentage: number;
  
  // 🎯 ATTENDANCE SYSTEM EXTENSIONS
  // Enhanced attendance tracking
  totalSessions?: number; // Total sessions conducted
  attendedSessions?: number; // Sessions attended
  consecutiveAbsences?: number; // Current streak of absences
  lastAttendanceDate?: string; // Last date student was present
  attendanceTrend?: 'improving' | 'declining' | 'stable'; // Attendance trend
  
  // Attendance alerts and flags
  lowAttendanceAlert?: boolean; // If attendance is below threshold
  attendanceThreshold?: number; // Required attendance percentage
  isEligibleForExam?: boolean; // Based on attendance criteria
  
  // Recent attendance history (last 5 sessions)
  recentAttendance?: {
    date: string;
    present: boolean;
    timeSlotId: string;
    feedback?: string;
  }[];
  
  // Attendance statistics
  attendanceStats?: {
    thisWeek: number; // This week's attendance percentage
    thisMonth: number; // This month's attendance percentage
    overall: number; // Overall attendance percentage
    lastUpdated: string; // When stats were last calculated
  };
}

export interface Section {
  id: string;
  name: string;
  training: Training; // Changed from 'trainer' to 'training' to match API
  students: Student[];
  strength: number;
}

export interface CreateSectionRequest {
  trainerId: string; // This maps to trainingId in the API
  sectionName: string;
}

export interface UpdateSectionRequest {
  trainerId?: string; // This maps to trainingId in the API
  sectionName?: string;
}

export interface SectionFilters {
  search?: string; // Search by section name or training name
  trainerId?: string; // This is actually trainingId
}

export interface BulkSectionOperation {
  sectionIds: string[];
  operation: "DELETE";
}

export interface RegisterStudentsRequest {
  file: File;
}

export interface UpdateStudentSectionRequest {
  studentId: string;
  sectionId: string;
}
