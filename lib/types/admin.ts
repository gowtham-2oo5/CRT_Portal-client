// Admin dashboard types based on your API documentation

export interface DashboardMetrics {
  totalStudents: number;
  totalFaculties: number;
  totalSections: number;
  totalRooms: number;
  totalTimeSlots: number;
  activeStudents: number;
  totalAttendanceRecords: number;
}

export interface RecentAction {
  action: string;
  timestamp: string;
  facultyId: string;
  facultyName: string;
  sectionName: string;
  timeSlotInfo: string;
  attendancePercentage: number;
}

export interface AdminDashboardData {
  metrics: DashboardMetrics;
  recentActions: RecentAction[];
}
