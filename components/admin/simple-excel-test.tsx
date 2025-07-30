"use client";

import { Button } from "@/components/ui/button";
import { AttendanceService } from "@/lib/api/services/attendance";
import {
  quickExcelExport,
  SimpleExcelColumn,
} from "@/lib/utils/simple-excel-export";
import { FilteredTimeSlot } from "@/lib/types/attendance";
import { FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SimpleExcelTestProps {
  date?: string;
}

export function SimpleExcelTest({ date }: SimpleExcelTestProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      console.log("=== SIMPLE EXCEL TEST ===");

      // Fetch data
      const exportDate = date || new Date().toISOString().split("T")[0];
      console.log("Fetching data for date:", exportDate);

      const rawData = await AttendanceService.getPendingFaculties(exportDate);
      console.log("Raw data received:", rawData);
      console.log("Raw data type:", typeof rawData);
      console.log("Is array?", Array.isArray(rawData));
      console.log("Length:", rawData?.length);

      if (!Array.isArray(rawData)) {
        throw new Error(`Expected array, got ${typeof rawData}`);
      }

      if (rawData.length === 0) {
        toast.warning("No data found");
        return;
      }

      // Transform data for Excel
      const transformedData = rawData.map((slot: FilteredTimeSlot) => ({
        facultyName: slot.inchargeFacultyName || "N/A",
        facultyEmail: slot.inchargeFacultyEmail || "N/A",
        facultyPhone: slot.inchargeFacultyPhone || "N/A",
        sectionName: slot.sectionName || "N/A",
        roomName: slot.roomName || "N/A",
        startTime: slot.startTime || "N/A",
        endTime: slot.endTime || "N/A",
        isBreak: slot.isBreak ? "Yes" : "No",
        attendancePosted: slot.attendancePosted ? "Yes" : "No",
      }));

      console.log("Transformed data for Excel:", transformedData);

      // Define columns
      const columns: SimpleExcelColumn[] = [
        { key: "facultyName", label: "Faculty Name", width: 25 },
        { key: "facultyEmail", label: "Faculty Email", width: 30 },
        { key: "facultyPhone", label: "Faculty Phone", width: 15 },
        { key: "sectionName", label: "Section Name", width: 15 },
        { key: "roomName", label: "Room", width: 12 },
        { key: "startTime", label: "Start Time", width: 12 },
        { key: "endTime", label: "End Time", width: 12 },
        { key: "isBreak", label: "Is Break", width: 10 },
        { key: "attendancePosted", label: "Attendance Posted", width: 18 },
      ];

      // Export to Excel
      console.log("Calling quickExcelExport...");
      quickExcelExport(
        transformedData,
        columns,
        `simple_excel_test_${exportDate}`,
        `Pending Attendance Report - ${exportDate}`
      );

      toast.success(
        `${transformedData.length} records exported to Excel successfully`
      );
      console.log("=== EXCEL EXPORT COMPLETED ===");
    } catch (error) {
      console.error("=== EXCEL EXPORT ERROR ===", error);
      toast.error(
        `Excel export failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="default"
      onClick={handleExport}
      disabled={isExporting}
    >
      <FileSpreadsheet className="h-4 w-4 mr-2" />
      {isExporting ? "Exporting..." : "Simple Excel Test"}
    </Button>
  );
}
