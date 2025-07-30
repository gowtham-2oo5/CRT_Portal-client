"use client";

import { Button } from "@/components/ui/button";
import { AttendanceService } from "@/lib/api/services/attendance";
import { downloadCSV, generateFilename } from "@/lib/utils/csv-export";
import {
  FacultyWithPendingAttendance,
  FilteredTimeSlot,
} from "@/lib/types/attendance";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

      let timeSlotsData: FilteredTimeSlot[] = [];

      if (date) {
        timeSlotsData = await AttendanceService.getPendingFaculties(date);
        console.log("Actual response: ", timeSlotsData);
      } else {
        const today = new Date().toISOString().split("T")[0];
        timeSlotsData = await AttendanceService.getPendingFaculties(today);
        console.log("Actual response: ", timeSlotsData);
      }

      console.log("{DEBUG ANNA}");
      console.log(timeSlotsData);

      if (timeSlotsData.length === 0) {
        toast.warning("No pending attendance timeslots found");
        return;
      }

      // Define CSV headers with proper field order
      const dayOrder = [
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
      ];

      const exportableTimeSlots = timeSlotsData.map((slot) => ({
        facultyName: slot.inchargeFacultyName,
        facultyEmail: slot.inchargeFacultyEmail,
        facultyPhone: slot.inchargeFacultyPhone,
        sectionName: slot.sectionName,
        roomName: slot.roomName,
        day: slot.day || "N/A",
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBreak: slot.isBreak ? "Yes" : "No",
        breakDescription: slot.breakDescription || "N/A",
        attendancePosted: slot.attendancePosted ? "Yes" : "No",
      }));

      exportableTimeSlots.sort((a, b) => {
        // Sort by facultyName
        if (a.facultyName < b.facultyName) return -1;
        if (a.facultyName > b.facultyName) return 1;

        // Then by day
        const dayA = dayOrder.indexOf(a.day.toUpperCase());
        const dayB = dayOrder.indexOf(b.day.toUpperCase());
        if (dayA !== -1 && dayB !== -1) {
          if (dayA < dayB) return -1;
          if (dayA > dayB) return 1;
        }

        // Then by startTime
        if (a.startTime < b.startTime) return -1;
        if (a.startTime > b.startTime) return 1;

        return 0;
      });

      const headers = [
        { key: "facultyName" as const, label: "Faculty Name" },
        { key: "facultyEmail" as const, label: "Faculty Email" },
        { key: "facultyPhone" as const, label: "Faculty Phone" },
        { key: "sectionName" as const, label: "Section Name" },
        { key: "roomName" as const, label: "Room" },
        { key: "day" as const, label: "Day" },
        { key: "startTime" as const, label: "Start Time" },
        { key: "endTime" as const, label: "End Time" },
        { key: "isBreak" as const, label: "Is Break" },
        { key: "breakDescription" as const, label: "Break Description" },
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
