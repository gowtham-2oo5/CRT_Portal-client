export interface FilteredTimeSlot {
  timeSlotId: number;
  startTime: string;
  endTime: string;
  day: string;
  sectionId: string;
  sectionName: string;
  facultyId: string;
  facultyName: string;
  attendancePosted: boolean;
  pastEndTime: boolean;
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
  timeSlots: FilteredTimeSlot[];
  facultiesWithPendingAttendance: FacultyWithPendingAttendance[];
}

export interface DailyTimeSlot {
    id: string;
    startTime: string;
    endTime: string;
    attendanceStatus: 'SUBMITTED' | 'PENDING' | 'NOT_APPLICABLE';
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
    roomName: ReactNode; id: string; startTime: string; endTime: string 
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
  attendanceStatus: 'PENDING' | 'POSTED' | 'MISSED';
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
  status: 'success' | 'error';
  error?: string;
}

export interface BatchSubmissionResponse {
  success: boolean;
  message: string;
  results: BatchSubmissionResult[];
}
