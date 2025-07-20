"use client";

import { Button } from "@/components/ui/button";
import { downloadCSV, generateFilename } from "@/lib/utils/csv-export";
import { FilteredTimeSlot } from "@/lib/types/attendance";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AbsenteeRecord {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  timeSlotId: string;
  sectionName: string;
  date: string;
  startTime: string;
  endTime: string;
  facultyName: string;
}

interface ExportAbsenteeRecordsCSVProps {
  records: AbsenteeRecord[];
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  timeSlots?: FilteredTimeSlot[];
  disabled?: boolean;
}

export function ExportAbsenteeRecordsCSV({ 
  records,
  variant = "outline", 
  size = "default",
  timeSlots,
  disabled = false
}: ExportAbsenteeRecordsCSVProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      if (!records || records.length === 0) {
        toast.warning("No absentee records found to export");
        return;
      }

      // Define CSV headers with proper field order
      const headers = [
        { key: "studentId" as const, label: "Student ID" },
        { key: "studentName" as const, label: "Student Name" },
        { key: "studentEmail" as const, label: "Email" },
        { key: "studentPhone" as const, label: "Phone" },
        { key: "date" as const, label: "Date" },
        { key: "startTime" as const, label: "Start Time" },
        { key: "endTime" as const, label: "End Time" },
        { key: "sectionName" as const, label: "Section" },
        { key: "facultyName" as const, label: "Faculty" },
      ];

      // Generate filename and download
      const filename = generateFilename("absentee_records");
      downloadCSV(records, filename, headers);
      
      toast.success(`${records.length} absentee records exported successfully`);
    } catch (error: any) {
      console.error("Error exporting absentee records:", error);
      toast.error(error.message || "Failed to export absentee records");
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
      {isExporting ? "Exporting..." : "Export Absentee Records CSV"}
    </Button>
  );
}
