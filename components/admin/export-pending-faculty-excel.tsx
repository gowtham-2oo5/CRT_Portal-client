"use client";

import { AttendanceService } from "@/lib/api/services/attendance";
import {
  FilteredTimeSlot,
  FacultyWithPendingAttendance,
} from "@/lib/types/attendance";
import { MultiFormatExport } from "./multi-format-export";

interface ExportPendingFacultyExcelProps {
  date?: string;
  pendingFaculty?: FacultyWithPendingAttendance[];
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
}

export function ExportPendingFacultyExcel({
  date,
  pendingFaculty,
  variant = "outline",
  size = "default",
  disabled = false,
}: ExportPendingFacultyExcelProps) {
  // Define columns for the export
  const columns = [
    {
      key: "facultyName" as const,
      label: "Faculty Name",
      width: 25,
      type: "string" as const,
    },
    {
      key: "facultyEmail" as const,
      label: "Faculty Email",
      width: 30,
      type: "string" as const,
    },
    {
      key: "facultyPhone" as const,
      label: "Faculty Phone",
      width: 15,
      type: "string" as const,
    },
    {
      key: "sectionName" as const,
      label: "Section Name",
      width: 15,
      type: "string" as const,
    },
    {
      key: "roomName" as const,
      label: "Room",
      width: 12,
      type: "string" as const,
    },
    { key: "day" as const, label: "Day", width: 12, type: "string" as const },
    {
      key: "startTime" as const,
      label: "Start Time",
      width: 12,
      type: "string" as const,
    },
    {
      key: "endTime" as const,
      label: "End Time",
      width: 12,
      type: "string" as const,
    },
    {
      key: "isBreak" as const,
      label: "Is Break",
      width: 10,
      type: "string" as const,
    },
    {
      key: "breakDescription" as const,
      label: "Break Description",
      width: 20,
      type: "string" as const,
    },
    {
      key: "attendancePosted" as const,
      label: "Attendance Posted",
      width: 18,
      type: "string" as const,
    },
  ];

  // Function to fetch and transform data
  const fetchData = async () => {
    let timeSlotsData: FilteredTimeSlot[] = [];

    if (date) {
      timeSlotsData = await AttendanceService.getPendingFaculties(date);
    } else {
      const today = new Date().toISOString().split("T")[0];
      timeSlotsData = await AttendanceService.getPendingFaculties(today);
    }

    console.log("Raw timeSlotsData:", timeSlotsData);
    console.log("Is array?", Array.isArray(timeSlotsData));

    // Ensure we have an array
    if (!Array.isArray(timeSlotsData)) {
      console.error(
        "timeSlotsData is not an array:",
        typeof timeSlotsData,
        timeSlotsData
      );
      throw new Error("Invalid data format received from server");
    }

    if (timeSlotsData.length === 0) {
      throw new Error("No pending attendance timeslots found");
    }

    return timeSlotsData;
  };

  // Transform data for export
  const transformData = (data: FilteredTimeSlot[]) => {
    console.log("Transform data input:", data);
    console.log("Transform data is array?", Array.isArray(data));

    // Safety check
    if (!Array.isArray(data)) {
      console.error("Transform data is not an array:", typeof data, data);
      throw new Error("Data is not an array in transformData");
    }

    const dayOrder = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];

    const exportableData = data.map((slot) => ({
      facultyName: slot.inchargeFacultyName || "N/A",
      facultyEmail: slot.inchargeFacultyEmail || "N/A",
      facultyPhone: slot.inchargeFacultyPhone || "N/A",
      sectionName: slot.sectionName || "N/A",
      roomName: slot.roomName || "N/A",
      day: slot.day || "N/A",
      startTime: slot.startTime || "N/A",
      endTime: slot.endTime || "N/A",
      isBreak: slot.isBreak ? "Yes" : "No",
      breakDescription: slot.breakDescription || "N/A",
      attendancePosted: slot.attendancePosted ? "Yes" : "No",
    }));

    // Sort the data
    exportableData.sort((a, b) => {
      // Sort by facultyName first
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

    console.log("Transformed data:", exportableData);
    return exportableData;
  };

  const exportDate = date || new Date().toISOString().split("T")[0];

  return (
    <MultiFormatExport
      fetchData={fetchData}
      columns={columns}
      filenamePrefix={`pending-attendance-timeslots-${exportDate}`}
      transformData={transformData}
      buttonText="Export Pending Faculty"
      variant={variant}
      size={size}
      disabled={disabled}
      showProgress={true}
      excelOptions={{
        title: "Pending Attendance Report",
        subtitle: `Faculty with pending attendance for ${exportDate}`,
        showSummary: true,
        summaryType: "attendance",
        companyInfo: {
          name: "CRT Portal - Attendance Management System",
          address: "Academic Institution",
        },
      }}
      onExportStart={(format) => {
        console.log(`Starting ${format} export for pending faculty`);
      }}
      onExportComplete={(format, count) => {
        console.log(`${format} export completed: ${count} records`);
      }}
      onExportError={(format, error) => {
        console.error(`${format} export failed:`, error);
      }}
    />
  );
}
