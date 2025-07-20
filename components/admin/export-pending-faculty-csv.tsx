"use client";

import { Button } from "@/components/ui/button";
import { AttendanceService } from "@/lib/api/services/attendance";
import { downloadCSV, generateFilename } from "@/lib/utils/csv-export";
import { FacultyWithPendingAttendance } from "@/lib/types/attendance";
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
  disabled = false
}: ExportPendingFacultyCSVProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // If pendingFaculty are provided directly, use them
      // Otherwise, fetch them using the date
      let facultyData: FacultyWithPendingAttendance[] = [];
      
      if (pendingFaculty && pendingFaculty.length > 0) {
        facultyData = pendingFaculty;
      } else if (date) {
        // Get time slots for the date
        const response = await AttendanceService.filterTimeSlots(date);
        facultyData = response.facultiesWithPendingAttendance;
      } else {
        // Default to today if no date provided
        const today = new Date().toISOString().split('T')[0];
        const response = await AttendanceService.filterTimeSlots(today);
        facultyData = response.facultiesWithPendingAttendance;
      }
      
      if (facultyData.length === 0) {
        toast.warning("No faculty with pending attendance found");
        return;
      }

      // Define CSV headers with proper field order
      const headers = [
        { key: "id" as const, label: "Faculty ID" },
        { key: "name" as const, label: "Name" },
        { key: "email" as const, label: "Email" },
        { key: "phone" as const, label: "Phone" },
        { key: "pendingCount" as const, label: "Pending Sessions" },
        { key: "date" as const, label: "Date" }
      ];

      // Format data for CSV - ensure all required fields exist
      const csvData = facultyData.map(faculty => ({
        ...faculty,
        pendingCount: faculty.pendingCount || 1, // Default to 1 if not provided
        date: date || new Date().toISOString().split('T')[0]
      }));

      // Generate filename and download
      const exportDate = date || new Date().toISOString().split('T')[0];
      const filename = `pending-attendance-faculty-${exportDate}`;
      downloadCSV(csvData, filename, headers);
      
      toast.success(`${facultyData.length} faculty with pending attendance exported successfully`);
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
