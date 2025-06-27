// Faculty-specific types

export interface FacultyProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  employeeId: string;
  phone?: string;
  subjects: string[];
}

export interface TimeSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // "09:00"
  endTime: string;   // "10:00"
  subject: string;
  section: string;
  room: string;
  isActive?: boolean; // Current active slot
}

export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  phone?: string;
  section: string;
  profileImage?: string;
}

export interface AttendanceRecord {
  studentId: string;
  rollNumber: string;
  name: string;
  isPresent: boolean;
  markedAt?: Date;
}

export interface AttendanceSession {
  id: string;
  facultyId: string;
  section: string;
  subject: string;
  date: string;
  timeSlot: string;
  room: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  records: AttendanceRecord[];
  submittedAt: Date;
}

export interface AttendanceReport {
  studentId: string;
  rollNumber: string;
  name: string;
  section: string;
  totalSessions: number;
  attendedSessions: number;
  attendancePercentage: number;
  lastAttended?: Date;
  sessions: AttendanceSession[];
}

export interface FacultySection {
  id: string;
  name: string; // "CSE-A", "CSE-B"
  subject: string;
  semester: number;
  totalStudents: number;
  students: Student[];
}

export interface FacultyDashboardData {
  profile: FacultyProfile;
  currentSlot?: TimeSlot;
  nextSlot?: TimeSlot;
  todaySchedule: TimeSlot[];
  weeklyTimetable: TimeSlot[];
  assignedSections: FacultySection[];
  todayAttendanceCount: number;
  weeklyAttendanceCount: number;
}
