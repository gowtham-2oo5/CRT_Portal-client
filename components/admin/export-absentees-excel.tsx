"use client";

import { AttendanceService } from "@/lib/api/services/attendance";
import { Absentee } from "@/lib/types/attendance";
import { MultiFormatExport } from "./multi-format-export";

interface ExportAbsenteesExcelProps {
  timeSlotId?: string;
  absentees?: Absentee[];
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
}

export function ExportAbsenteesExcel({
  timeSlotId,
  absentees,
  variant = "outline",
  size = "default",
  disabled = false,
}: ExportAbsenteesExcelProps) {

  // Define columns for absentees export
  const columns = [
    { key: 'id' as const, label: 'Student ID', width: 15, type: 'string' as const },
    { key: 'name' as const, label: 'Student Name', width: 25, type: 'string' as const },
    { key: 'email' as const, label: 'Email', width: 30, type: 'string' as const },
    { key: 'phone' as const, label: 'Phone', width: 15, type: 'string' as const },
    { key: 'sectionName' as const, label: 'Section', width: 15, type: 'string' as const },
    { key: 'date' as const, label: 'Date', width: 12, type: 'date' as const },
    { key: 'startTime' as const, label: 'Start Time', width: 12, type: 'string' as const },
    { key: 'endTime' as const, label: 'End Time', width: 12, type: 'string' as const },
    { key: 'facultyName' as const, label: 'Faculty', width: 20, type: 'string' as const },
  ];

  // Function to fetch absentee data
  const fetchData = async () => {
    // If absentees are provided directly, use them
    if (absentees && absentees.length > 0) {
      return absentees;
    }
    
    // Otherwise, fetch them using the timeSlotId
    if (timeSlotId) {
      const fetchedAbsentees = await AttendanceService.getAbsentees(timeSlotId);
      return fetchedAbsentees;
    }
    
    // If no data source, try to get today's absentees
    const today = new Date().toISOString().split('T')[0];
    const timeSlots = await AttendanceService.filterTimeSlots(today);
    
    const allAbsentees: any[] = [];
    for (const slot of timeSlots) {
      if (slot.attendancePosted) {
        const slotAbsentees = await AttendanceService.getAbsentees(slot.id.toString());
        
        slotAbsentees.forEach((absentee) => {
          allAbsentees.push({
            ...absentee,
            timeSlotId: slot.id,
            sectionName: slot.sectionName,
            date: today,
            startTime: slot.startTime,
            endTime: slot.endTime,
            facultyName: slot.inchargeFacultyName,
          });
        });
      }
    }
    
    if (allAbsentees.length === 0) {
      throw new Error("No absentees found to export");
    }
    
    return allAbsentees;
  };

  // Transform data for export
  const transformData = (data: any[]) => {
    return data.map(absentee => ({
      ...absentee,
      phone: absentee.phone || 'N/A',
      sectionName: absentee.sectionName || 'N/A',
      date: absentee.date ? new Date(absentee.date) : new Date(),
      startTime: absentee.startTime || 'N/A',
      endTime: absentee.endTime || 'N/A',
      facultyName: absentee.facultyName || 'N/A',
    }));
  };

  return (
    <MultiFormatExport
      fetchData={fetchData}
      columns={columns}
      filenamePrefix="absentees"
      transformData={transformData}
      buttonText="Export Absentees"
      variant={variant}
      size={size}
      disabled={disabled}
      showProgress={true}
      excelOptions={{
        title: "Student Absentees Report",
        subtitle: `Absentee records as of ${new Date().toLocaleDateString()}`,
        showSummary: true,
        summaryType: "absentees",
        companyInfo: {
          name: "CRT Portal - Attendance Management System",
          address: "Academic Institution",
        },
      }}
      onExportStart={(format) => {
        console.log(`Starting ${format} export for absentees`);
      }}
      onExportComplete={(format, count) => {
        console.log(`${format} export completed: ${count} absentee records`);
      }}
      onExportError={(format, error) => {
        console.error(`Absentees ${format} export failed:`, error);
      }}
    />
  );
}
