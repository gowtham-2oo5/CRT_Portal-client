"use client";

import { AttendanceService } from "@/lib/api/services/attendance";
import { Absentee } from "@/lib/types/attendance";
import { AbsenteeExportData } from "@/lib/types/export-types";
import { GenericCSVExport } from "./generic-csv-export";

interface ExportAbsenteesCSVProps {
  timeSlotId?: string;
  absentees?: Absentee[];
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
}

export function ExportAbsenteesCSV({ 
  timeSlotId,
  absentees,
  variant = "outline", 
  size = "default",
  disabled = false
}: ExportAbsenteesCSVProps) {
  // Define headers for the CSV
  const headers = [
    { key: "id" as const, label: "Student ID" },
    { key: "name" as const, label: "Student Name" },
    { key: "email" as const, label: "Email" },
    { key: "phone" as const, label: "Phone" },
  ];

  // Function to fetch or use provided absentee data
  const fetchAbsenteeData = async (): Promise<AbsenteeExportData[]> => {
    // If absentees are provided directly, use them
    if (absentees && absentees.length > 0) {
      return absentees.map(absentee => ({
        ...absentee,
        phone: absentee.phone || "N/A" // Handle missing phone field
      }));
    } 
    
    // Otherwise, fetch them using the timeSlotId
    if (timeSlotId) {
      const fetchedAbsentees = await AttendanceService.getAbsentees(timeSlotId);
      return fetchedAbsentees.map(absentee => ({
        ...absentee,
        phone: absentee.phone || "N/A" // Handle missing phone field
      }));
    }
    
    // No data source provided
    return [];
  };

  return (
    <GenericCSVExport<AbsenteeExportData>
      fetchData={fetchAbsenteeData}
      headers={headers}
      filenamePrefix="absentees"
      buttonText="Export Absentees CSV"
      successMessage="{count} absentees exported successfully"
      emptyDataMessage="No absentees found to export"
      variant={variant}
      size={size}
      disabled={disabled}
      errorContext="ExportAbsenteesCSV"
    />
  );
}
