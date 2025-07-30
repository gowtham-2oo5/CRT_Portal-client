"use client";

import { Button } from "@/components/ui/button";
import { AttendanceService } from "@/lib/api/services/attendance";
import { downloadCSV } from "@/lib/utils/csv-export";
import { FilteredTimeSlot } from "@/lib/types/attendance";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SimplePendingExportProps {
  date?: string;
}

export function SimplePendingExport({ date }: SimplePendingExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      console.log("=== SIMPLE EXPORT DEBUG ===");

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

      // Transform data
      console.log("Transforming data...");
      const transformedData = rawData.map((slot: FilteredTimeSlot) => {
        console.log("Processing slot:", slot);
        return {
          facultyName: slot.inchargeFacultyName || "N/A",
          facultyEmail: slot.inchargeFacultyEmail || "N/A",
          sectionName: slot.sectionName || "N/A",
          roomName: slot.roomName || "N/A",
          startTime: slot.startTime || "N/A",
          endTime: slot.endTime || "N/A",
          isBreak: slot.isBreak ? "Yes" : "No",
          attendancePosted: slot.attendancePosted ? "Yes" : "No",
        };
      });

      console.log("Transformed data:", transformedData);

      // Export as CSV
      const headers = [
        { key: "facultyName" as const, label: "Faculty Name" },
        { key: "facultyEmail" as const, label: "Faculty Email" },
        { key: "sectionName" as const, label: "Section Name" },
        { key: "roomName" as const, label: "Room" },
        { key: "startTime" as const, label: "Start Time" },
        { key: "endTime" as const, label: "End Time" },
        { key: "isBreak" as const, label: "Is Break" },
        { key: "attendancePosted" as const, label: "Attendance Posted" },
      ];

      const filename = `simple_pending_export_${exportDate}`;
      console.log("Downloading CSV with filename:", filename);

      downloadCSV(transformedData, filename, headers);

      toast.success(`${transformedData.length} records exported successfully`);
      console.log("=== EXPORT COMPLETED ===");
    } catch (error) {
      console.error("=== EXPORT ERROR ===", error);
      toast.error(
        `Export failed: ${
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
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? "Exporting..." : "Simple Test Export"}
    </Button>
  );
}
