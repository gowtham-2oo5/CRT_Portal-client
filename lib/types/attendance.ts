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