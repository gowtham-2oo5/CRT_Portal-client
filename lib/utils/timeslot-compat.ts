import type { TimeSlot } from "@/lib/types/section-schedule";

/**
 * Ensures backward compatibility for TimeSlot objects
 * Provides defaults for new optional fields
 */
export function ensureTimeSlotCompatibility(data: any): TimeSlot {
  return {
    // Required fields
    id: data.id || 0,
    sectionId: data.sectionId || "",
    roomId: data.roomId || "",
    startTime: data.startTime || "",
    endTime: data.endTime || "",
    
    // New optional fields with defaults
    inchargeFacultyId: data.inchargeFacultyId || "",
    slotType: data.slotType || (data.isBreak ? "BREAK" : "REGULAR"),
    dayOfWeek: data.dayOfWeek || "MONDAY",
    title: data.title || (data.isBreak ? data.breakDescription : undefined),
    description: data.description || "",
    
    // Legacy fields for backward compatibility
    isBreak: data.isBreak || data.slotType === "BREAK",
    breakDescription: data.breakDescription || (data.slotType === "BREAK" ? data.title : undefined),
    
    // Copy all other fields as-is
    ...data,
  };
}

/**
 * Creates a TimeSlot object from legacy attendance data
 */
export function createTimeSlotFromAttendanceData(attendanceData: any): TimeSlot {
  return ensureTimeSlotCompatibility({
    id: attendanceData.timeSlot?.id || attendanceData.id,
    startTime: attendanceData.timeSlot?.startTime || attendanceData.startTime,
    endTime: attendanceData.timeSlot?.endTime || attendanceData.endTime,
    sectionId: attendanceData.sectionId,
    roomId: attendanceData.timeSlot?.roomId || attendanceData.roomId,
    isBreak: attendanceData.timeSlot?.isBreak || false,
    inchargeFacultyName: attendanceData.timeSlot?.inchargeFacultyName,
    inchargeFacultyId: attendanceData.timeSlot?.inchargeFacultyId || "",
    // Add section and room data if available
    section: attendanceData.section || {
      id: attendanceData.sectionId,
      name: attendanceData.sectionName,
      strength: attendanceData.totalCount || 0,
      activeStudents: attendanceData.students?.length || 0,
    },
    room: attendanceData.room || attendanceData.timeSlot?.room || {
      id: attendanceData.timeSlot?.roomId || attendanceData.roomId,
      roomString: attendanceData.roomName || "Unknown",
      capacity: 0,
      roomType: "LECTURE_ROOM",
    },
  });
}
