"use client";

import { Button } from "@/components/ui/button";
import { AttendanceService } from "@/lib/api/services/attendance";
import { downloadCSV, generateFilename } from "@/lib/utils/csv-export";
import {
  FacultyWithPendingAttendance,
  FilteredTimeSlot,
  TimeSlotFilterResponse,
} from "@/lib/types/attendance";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { time } from "console";

interface ExportPendingFacultyCSVProps {
  date?: string;
  pendingFaculty?: FacultyWithPendingAttendance[];
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
}

export function ExportPendingFacultyCSV({
  date,
  pendingFaculty,
  variant = "outline",
  size = "default",
  disabled = false,
}: ExportPendingFacultyCSVProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      let facultyData: FacultyWithPendingAttendance[] = [];
      let timeSlotsData: FilteredTimeSlot[] = [];

      if (pendingFaculty && pendingFaculty.length > 0) {
        facultyData = pendingFaculty;
      } else if (date) {
        const response = await AttendanceService.filterTimeSlots(date);
        console.log("Actual resposne: ", response);
        timeSlotsData = response.timeSlots;
        facultyData = response.facultiesWithPendingAttendance;
      } else {
        const today = new Date().toISOString().split("T")[0];
        const response = await AttendanceService.filterTimeSlots(today);
        console.log("Actual resposne: ", response);
        facultyData = response.facultiesWithPendingAttendance;
        timeSlotsData = response.timeSlots;
      }

      const finalData = [...timeSlotsData, ...facultyData];
      console.log("{DEBUG ANNA}");
      console.log(timeSlotsData, facultyData);
      if (timeSlotsData.length === 0) {
        toast.warning("No pending attendance timeslots found");
        return;
      }

      // Define CSV headers with proper field order
      const dayOrder = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

      const exportableTimeSlots = timeSlotsData.map((slot) => ({
        facultyName: slot.facultyName,
        facEmpId: slot.facEmpId,
        sectionName: slot.sectionName,
        room: slot.room,
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        attendancePosted: slot.attendancePosted ? "Yes" : "No",
      }));

      exportableTimeSlots.sort((a, b) => {
        // Sort by facultyName
        if (a.facultyName < b.facultyName) return -1;
        if (a.facultyName > b.facultyName) return 1;

        // Then by day
        const dayA = dayOrder.indexOf(a.day.toUpperCase());
        const dayB = dayOrder.indexOf(b.day.toUpperCase());
        if (dayA < dayB) return -1;
        if (dayA > dayB) return 1;

        // Then by startTime
        if (a.startTime < b.startTime) return -1;
        if (a.startTime > b.startTime) return 1;

        return 0;
      });

      const headers = [
        { key: "facultyName" as const, label: "Faculty Name" },
        { key: "facEmpId" as const, label: "Faculty Employee ID" },
        { key: "sectionName" as const, label: "Section Name" },
        { key: "room" as const, label: "Room" },
        { key: "day" as const, label: "Day" },
        { key: "startTime" as const, label: "Start Time" },
        { key: "endTime" as const, label: "End Time" },
        { key: "attendancePosted" as const, label: "Attendance Posted" },
      ];

      const exportDate = date || new Date().toISOString().split("T")[0];
      const filename = `pending-attendance-timeslots-${exportDate}`;
      downloadCSV(exportableTimeSlots, filename, headers);

      toast.success(
        `${exportableTimeSlots.length} pending attendance timeslots exported successfully`
      );
    } catch (error: any) {
      console.error("Error exporting faculty with pending attendance:", error);
      toast.error(error.message || "Failed to export faculty data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting || disabled}
    >
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? "Exporting..." : "Export Pending Faculty CSV"}
    </Button>
  );
}
