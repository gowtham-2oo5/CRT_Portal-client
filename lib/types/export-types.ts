/**
 * Types for CSV export functionality
 */

// Student absentee data
export interface AbsenteeExportData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  timeSlotId?: string;
  sectionName?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  facultyName?: string;
}

// Absentee record data for export
export interface AbsenteeRecordExportData {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  date: string;
  startTime: string;
  endTime: string;
  sectionName: string;
  facultyName: string;
}

// Faculty data for export
export interface FacultyExportData {
  id: string;
  employeeId?: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  isActive: boolean | string;
  lastLogin?: string;
}

// Faculty with pending attendance data
export interface PendingFacultyExportData {
  id: string;
  name: string;
  email: string;
  phone: string;
  pendingCount: number;
  date: string;
}

// Student data for batch attendance
export interface StudentAttendanceData {
  id: string;
  name: string;
  regNum?: string;
  email?: string;
  section?: string;
}

// Generic export response
export interface ExportResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}
