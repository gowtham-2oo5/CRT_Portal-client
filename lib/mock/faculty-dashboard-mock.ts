// 🎯 CRT Portal Attendance System - Faculty Dashboard Mock Data
// Created: 2025-07-15 | For testing EnhancedFacultyDashboard

/**
 * Mock data generator for faculty dashboard testing
 * Simulates real API responses with realistic data
 */

export interface MockFacultyDashboardData {
  profile: {
    id: string;
    name: string;
    email: string;
    department: string | null;
    employeeId: string | null;
    phone: string;
  };
  todaySchedule: Array<{
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    sectionName: string;
    room: string;
    active: boolean;
    hasAttendance?: boolean;
    section?: {
      id: string;
      name: string;
      strength: number;
    };
    room?: {
      id: string;
      roomString: string;
    };
    isBreak?: boolean;
  }>;
  assignedSections: Array<{
    id: string;
    name: string;
    totalStudents: number;
    trainingName: string;
  }>;
  todayAttendanceCount: number;
  weeklyAttendanceCount: number;
  todayStats?: {
    completedSessions: number;
    totalSessions: number;
    attendanceSubmitted: number;
    averageAttendance: number;
  };
  weeklyStats?: {
    attendanceSubmitted: number;
    totalSessions: number;
    averageAttendance: number;
  };
}

export interface MockCurrentSession {
  hasActiveSession: boolean;
  currentSlot: {
    id: string;
    startTime: string;
    endTime: string;
    sectionName: string;
    sectionId: string;
    room: string;
    active: boolean;
    timeRemaining?: number;
  } | null;
  nextSlot: {
    id: string;
    startTime: string;
    endTime: string;
    sectionName: string;
    sectionId: string;
    room: string;
    timeUntilStart?: number;
  } | null;
}

/**
 * Generate mock faculty dashboard data
 */
export function generateMockFacultyDashboard(facultyId: string): MockFacultyDashboardData {
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const currentTime = currentHour * 60 + currentMinute; // Minutes since midnight
  
  // Generate today's schedule
  const scheduleSlots = [
    { start: "09:00", end: "10:00", section: "CSE-A", room: "Lab-101", sectionId: "sec_1" },
    { start: "10:15", end: "11:15", section: "CSE-B", room: "Room-205", sectionId: "sec_2" },
    { start: "11:30", end: "12:30", section: "CSE-C", room: "Lab-102", sectionId: "sec_3" },
    { start: "14:00", end: "15:00", section: "CSE-A", room: "Room-301", sectionId: "sec_1" },
    { start: "15:15", end: "16:15", section: "CSE-D", room: "Lab-103", sectionId: "sec_4" },
  ];

  const todaySchedule = scheduleSlots.map((slot, index) => {
    const [startHour, startMin] = slot.start.split(':').map(Number);
    const [endHour, endMin] = slot.end.split(':').map(Number);
    const slotStartTime = startHour * 60 + startMin;
    const slotEndTime = endHour * 60 + endMin;
    
    const isActive = currentTime >= slotStartTime && currentTime <= slotEndTime;
    const isPast = currentTime > slotEndTime;
    
    return {
      id: `slot_${index + 1}`,
      day: "Monday",
      startTime: slot.start,
      endTime: slot.end,
      sectionName: slot.section,
      room: slot.room,
      active: isActive,
      hasAttendance: isPast && Math.random() > 0.3, // 70% chance of having attendance for past sessions
      section: {
        id: slot.sectionId,
        name: slot.section,
        strength: Math.floor(Math.random() * 20) + 25, // 25-45 students
      },
      room: {
        id: `room_${index + 1}`,
        roomString: slot.room,
      },
      isBreak: false,
    };
  });

  // Calculate stats based on schedule
  const completedSessions = todaySchedule.filter(slot => {
    const [endHour, endMin] = slot.endTime.split(':').map(Number);
    const slotEndTime = endHour * 60 + endMin;
    return currentTime > slotEndTime;
  }).length;

  const attendanceSubmitted = todaySchedule.filter(slot => slot.hasAttendance).length;
  const totalSessions = todaySchedule.length;

  return {
    profile: {
      id: facultyId,
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@university.edu",
      department: "Computer Science & Engineering",
      employeeId: "FAC001",
      phone: "+1-555-0123",
    },
    todaySchedule,
    assignedSections: [
      {
        id: "sec_1",
        name: "CSE-A",
        totalStudents: 32,
        trainingName: "Data Structures & Algorithms",
      },
      {
        id: "sec_2",
        name: "CSE-B",
        totalStudents: 28,
        trainingName: "Database Management Systems",
      },
      {
        id: "sec_3",
        name: "CSE-C",
        totalStudents: 35,
        trainingName: "Web Development",
      },
      {
        id: "sec_4",
        name: "CSE-D",
        totalStudents: 30,
        trainingName: "Machine Learning Basics",
      },
    ],
    todayAttendanceCount: attendanceSubmitted,
    weeklyAttendanceCount: Math.floor(Math.random() * 15) + 10, // 10-25 sessions this week
    todayStats: {
      completedSessions,
      totalSessions,
      attendanceSubmitted,
      averageAttendance: Math.floor(Math.random() * 20) + 75, // 75-95% average
    },
    weeklyStats: {
      attendanceSubmitted: Math.floor(Math.random() * 15) + 10,
      totalSessions: Math.floor(Math.random() * 10) + 20,
      averageAttendance: Math.floor(Math.random() * 15) + 80, // 80-95% average
    },
  };
}

/**
 * Generate mock current session data
 */
export function generateMockCurrentSession(): MockCurrentSession {
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  // Define session times
  const sessions = [
    { start: "09:00", end: "10:00", section: "CSE-A", room: "Lab-101", id: "slot_1" },
    { start: "10:15", end: "11:15", section: "CSE-B", room: "Room-205", id: "slot_2" },
    { start: "11:30", end: "12:30", section: "CSE-C", room: "Lab-102", id: "slot_3" },
    { start: "14:00", end: "15:00", section: "CSE-A", room: "Room-301", id: "slot_4" },
    { start: "15:15", end: "16:15", section: "CSE-D", room: "Lab-103", id: "slot_5" },
  ];

  let currentSlot = null;
  let nextSlot = null;
  let hasActiveSession = false;

  // Find current active session
  for (const session of sessions) {
    const [startHour, startMin] = session.start.split(':').map(Number);
    const [endHour, endMin] = session.end.split(':').map(Number);
    const sessionStart = startHour * 60 + startMin;
    const sessionEnd = endHour * 60 + endMin;

    if (currentTime >= sessionStart && currentTime <= sessionEnd) {
      hasActiveSession = true;
      currentSlot = {
        id: session.id,
        startTime: session.start,
        endTime: session.end,
        sectionName: session.section,
        sectionId: `sec_${session.id.split('_')[1]}`,
        room: session.room,
        active: true,
        timeRemaining: Math.floor((sessionEnd - currentTime)),
      };
      break;
    }
  }

  // Find next upcoming session
  if (!hasActiveSession) {
    for (const session of sessions) {
      const [startHour, startMin] = session.start.split(':').map(Number);
      const sessionStart = startHour * 60 + startMin;

      if (currentTime < sessionStart) {
        nextSlot = {
          id: session.id,
          startTime: session.start,
          endTime: session.end,
          sectionName: session.section,
          sectionId: `sec_${session.id.split('_')[1]}`,
          room: session.room,
          timeUntilStart: Math.floor((sessionStart - currentTime)),
        };
        break;
      }
    }
  }

  return {
    hasActiveSession,
    currentSlot,
    nextSlot,
  };
}

/**
 * Mock API response wrapper
 */
export class MockAttendanceService {
  static async getFacultyDashboard(facultyId: string): Promise<MockFacultyDashboardData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('🎭 Using mock faculty dashboard data for:', facultyId);
    return generateMockFacultyDashboard(facultyId);
  }

  static async getCurrentSession(facultyId: string): Promise<MockCurrentSession> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('🎭 Using mock current session data for:', facultyId);
    return generateMockCurrentSession();
  }

  static async getTodaySchedule(facultyId: string): Promise<{
    data: Array<{
      id: string;
      day: string;
      startTime: string;
      endTime: string;
      sectionName: string;
      room: string;
      active: boolean;
    }>;
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const dashboardData = await this.getFacultyDashboard(facultyId);
    console.log('🎭 Using mock today\'s schedule data for:', facultyId);
    
    return {
      data: dashboardData.todaySchedule.map(slot => ({
        id: slot.id,
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        sectionName: slot.sectionName,
        room: typeof slot.room === 'object' ? slot.room.roomString : slot.room,
        active: slot.active,
      }))
    };
  }
}

/**
 * Enable mock mode for testing
 * Add this to your component to use mock data instead of real API
 */
export const ENABLE_MOCK_MODE = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
