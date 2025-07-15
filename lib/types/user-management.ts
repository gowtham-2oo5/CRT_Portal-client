// User Management Types based on your API specification

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  role: 'ADMIN' | 'FACULTY';
  department: 'CSE' | 'ME' | 'CE' | 'ECE' | 'EEE';
  employeeId?: string; // For faculty
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  phone: string;
  username: string;
  role: 'ADMIN' | 'FACULTY';
  department: 'CSE' | 'ME' | 'CE' | 'ECE' | 'EEE';
  employeeId?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  username?: string;
  role?: 'ADMIN' | 'FACULTY';
  department?: 'CSE' | 'ME' | 'CE' | 'ECE' | 'EEE';
  employeeId?: string;
  isActive?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: 'ADMIN' | 'FACULTY' | 'ALL';
  department?: 'CSE' | 'ME' | 'CE' | 'ECE' | 'EEE' | 'ALL';
  status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
}

export interface UserTableColumn {
  key: keyof User;
  label: string;
  sortable: boolean;
  filterable: boolean;
}

export interface BulkUserOperation {
  userIds: string[];
  operation: 'DELETE' | 'ACTIVATE' | 'DEACTIVATE' | 'CHANGE_ROLE';
  newRole?: 'ADMIN' | 'FACULTY';
}
// 🎯 ATTENDANCE SYSTEM EXTENSIONS FOR USER MANAGEMENT

/**
 * Extended User interface with attendance-specific fields
 * This extends the base User interface with attendance permissions and tracking
 */
export interface UserWithAttendance extends User {
  // Faculty-specific attendance permissions and assignments
  facultyAssignments?: {
    assignedSections: string[]; // Section IDs assigned to this faculty
    assignedTimeSlots: string[]; // TimeSlot IDs assigned to this faculty
    canMarkAttendance: boolean; // Permission to mark attendance
    canViewReports: boolean; // Permission to view attendance reports
    canExportData: boolean; // Permission to export attendance data
  };
  
  // Admin-specific attendance permissions
  adminPermissions?: {
    canAccessAllSections: boolean; // Access to all sections
    canManageAttendance: boolean; // Manage any attendance
    canArchiveData: boolean; // Archive attendance records
    canBulkOperations: boolean; // Perform bulk operations
    canViewAnalytics: boolean; // Access advanced analytics
  };
  
  // Attendance activity tracking
  attendanceActivity?: {
    lastAttendanceMarked?: string; // Last time user marked attendance
    totalAttendanceMarked?: number; // Total attendance sessions marked
    averageSessionsPerWeek?: number; // Average sessions per week
    lastReportGenerated?: string; // Last time user generated a report
  };
  
  // Notification preferences for attendance
  notificationPreferences?: {
    emailNotifications: boolean; // Email notifications enabled
    attendanceReminders: boolean; // Attendance marking reminders
    lowAttendanceAlerts: boolean; // Low attendance alerts
    reportNotifications: boolean; // Report generation notifications
  };
}

/**
 * Faculty assignment request for attendance system
 */
export interface FacultyAssignmentRequest {
  facultyId: string;
  sectionIds: string[];
  timeSlotIds: string[];
  permissions: {
    canMarkAttendance: boolean;
    canViewReports: boolean;
    canExportData: boolean;
  };
}

/**
 * User permission check response
 */
export interface UserPermissionCheck {
  userId: string;
  canAccessSection: (sectionId: string) => boolean;
  canMarkAttendance: (timeSlotId: string) => boolean;
  canViewReports: (sectionId?: string) => boolean;
  canExportData: boolean;
  canBulkOperations: boolean;
  isAdmin: boolean;
  isFaculty: boolean;
}
