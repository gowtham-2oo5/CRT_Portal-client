// Mock data for development testing - remove when backend is ready
import type { DashboardMetrics, RecentAction } from "@/lib/types/admin";

export class AdminMockService {
  // Mock dashboard metrics
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    // Simulate faster API response
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      totalStudents: 6,
      totalFaculties: 3,
      totalSections: 2,
      totalRooms: 2,
      totalTimeSlots: 0,
      activeStudents: 1,
      totalAttendanceRecords: 0
    };
  }

  // Mock recent actions
  static async getRecentActions(limit: number = 15): Promise<RecentAction[]> {
    // Simulate faster API response
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const mockActions: RecentAction[] = [
      {
        action: "gowtham-2o05 - Gowtham posted attendance for Java Basics for 09:00-10:30 and 85.5%",
        timestamp: "2025-06-26T21:30:00",
        facultyId: "gowtham-2o05",
        facultyName: "Gowtham",
        sectionName: "Java Basics",
        timeSlotInfo: "09:00-10:30",
        attendancePercentage: 85.5
      },
      {
        action: "sarah-johnson - Dr. Sarah Johnson posted attendance for Data Structures for 11:00-12:30 and 92.1%",
        timestamp: "2025-06-26T20:45:00",
        facultyId: "sarah-johnson",
        facultyName: "Dr. Sarah Johnson",
        sectionName: "Data Structures",
        timeSlotInfo: "11:00-12:30",
        attendancePercentage: 92.1
      },
      {
        action: "michael-chen - Prof. Michael Chen posted attendance for Algorithms for 14:00-15:30 and 78.3%",
        timestamp: "2025-06-26T19:15:00",
        facultyId: "michael-chen",
        facultyName: "Prof. Michael Chen",
        sectionName: "Algorithms",
        timeSlotInfo: "14:00-15:30",
        attendancePercentage: 78.3
      },
      {
        action: "priya-sharma - Dr. Priya Sharma posted attendance for Database Systems for 09:00-10:30 and 95.2%",
        timestamp: "2025-06-26T18:30:00",
        facultyId: "priya-sharma",
        facultyName: "Dr. Priya Sharma",
        sectionName: "Database Systems",
        timeSlotInfo: "09:00-10:30",
        attendancePercentage: 95.2
      },
      {
        action: "raj-kumar - Prof. Raj Kumar posted attendance for Web Development for 13:00-14:30 and 67.8%",
        timestamp: "2025-06-26T17:45:00",
        facultyId: "raj-kumar",
        facultyName: "Prof. Raj Kumar",
        sectionName: "Web Development",
        timeSlotInfo: "13:00-14:30",
        attendancePercentage: 67.8
      }
    ];

    return mockActions.slice(0, limit);
  }

  // Mock refresh all data
  static async refreshDashboardData(limit: number = 15): Promise<{
    metrics: DashboardMetrics;
    recentActions: RecentAction[];
  }> {
    // Parallel loading for better performance
    const [metrics, recentActions] = await Promise.all([
      this.getDashboardMetrics(),
      this.getRecentActions(limit)
    ]);

    return { metrics, recentActions };
  }
}
