import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { TimeSlot } from "@/lib/types/section-schedule";
import type { TimeSlotTemplate } from "@/lib/types/timeslot-template";

export interface SectionScheduleData {
  sectionId: string;
  sectionName: string;
  roomName: string;
  timeSlots: TimeSlot[];
  templates: TimeSlotTemplate[];
  sectionStrength?: number;
  trainingName?: string;
  hasSchedule?: boolean;
}

export interface ExportOptions {
  includeEmptySlots: boolean;
  includeMetadata: boolean;
  colorCode: boolean;
  filename: string;
}

const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];
const DAY_DISPLAY_NAMES = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export class ScheduleExcelExporter {
  static async exportSingleSectionSchedule(
    sectionData: SectionScheduleData,
    options: ExportOptions
  ): Promise<void> {
    try {
      console.log(
        "📊 Exporting single section schedule:",
        sectionData.sectionName
      );

      const workbook = XLSX.utils.book_new();

      // Create the main schedule sheet
      this.addScheduleGridSheet(workbook, sectionData, options);

      // Add metadata sheet if requested
      if (options.includeMetadata) {
        this.addMetadataSheet(workbook, [sectionData]);
      }

      // Generate and download the file
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, options.filename);

      console.log("✅ Single section schedule exported successfully");
    } catch (error) {
      console.error("❌ Error exporting single section schedule:", error);
      throw error;
    }
  }

  static async exportAllSectionsSchedule(
    sectionsData: SectionScheduleData[],
    options: ExportOptions
  ): Promise<void> {
    try {
      console.log("📊 Exporting all sections schedules:", sectionsData.length);

      const workbook = XLSX.utils.book_new();

      // Add overview sheet
      this.addOverviewSheet(workbook, sectionsData);

      // Add individual schedule sheets for each section
      sectionsData.forEach((sectionData, index) => {
        if (sectionData.hasSchedule && sectionData.timeSlots.length > 0) {
          this.addScheduleGridSheet(
            workbook,
            sectionData,
            options,
            `${sectionData.sectionName}_Schedule`
          );
        }
      });

      // Add metadata sheet if requested
      if (options.includeMetadata) {
        this.addMetadataSheet(workbook, sectionsData);
      }

      // Generate and download the file
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, options.filename);

      console.log("✅ All sections schedules exported successfully");
    } catch (error) {
      console.error("❌ Error exporting all sections schedules:", error);
      throw error;
    }
  }

  private static addScheduleGridSheet(
    workbook: XLSX.WorkBook,
    sectionData: SectionScheduleData,
    options: ExportOptions,
    sheetName?: string
  ): void {
    const wsName = sheetName || `${sectionData.sectionName}_Schedule`;

    // Get all unique time slots from templates and actual slots
    const allTimeSlots = new Set<string>();

    // Add template times
    sectionData.templates.forEach((template) => {
      allTimeSlots.add(`${template.startTime}-${template.endTime}`);
    });

    // Add actual slot times
    sectionData.timeSlots.forEach((slot) => {
      allTimeSlots.add(`${slot.startTime}-${slot.endTime}`);
    });

    const sortedTimeSlots = Array.from(allTimeSlots).sort((a, b) => {
      const timeA = a.split("-")[0];
      const timeB = b.split("-")[0];
      return timeA.localeCompare(timeB);
    });

    // Create the grid data
    const gridData: any[][] = [];

    // Header row with section info
    gridData.push([
      `Section: ${sectionData.sectionName}`,
      `Room: ${sectionData.roomName}`,
      `Training: ${sectionData.trainingName || "N/A"}`,
      `Students: ${sectionData.sectionStrength || "N/A"}`,
      ...Array(Math.max(0, sortedTimeSlots.length - 3)).fill(""),
    ]);

    gridData.push([]); // Empty row

    // Time slots header row (TimeSlots as columns)
    const timeSlotsHeader = ["Day", ...sortedTimeSlots];
    gridData.push(timeSlotsHeader);

    // Day rows (Days as rows)
    DAYS_OF_WEEK.forEach((day) => {
      const row = [DAY_DISPLAY_NAMES[day as keyof typeof DAY_DISPLAY_NAMES]];

      sortedTimeSlots.forEach((timeSlotRange) => {
        // Find if there's a time slot for this day and time
        const slot = sectionData.timeSlots.find(
          (s) =>
            s.dayOfWeek === day &&
            `${s.startTime}-${s.endTime}` === timeSlotRange
        );

        if (slot) {
          // Format the slot information
          let cellValue = "";

          if (slot.slotType === "BREAK") {
            cellValue = `BREAK: ${slot.title || "Break"}`;
          } else if (slot.slotType === "EXAM") {
            cellValue = `EXAM: ${slot.title || "Exam"}`;
          } else if (slot.slotType === "SPECIAL") {
            cellValue = `SPECIAL: ${slot.title || "Special"}`;
          } else {
            cellValue = `CLASS: ${sectionData.sectionName}`;
          }

          // Add faculty info if available
          if (slot.inchargeFacultyName) {
            cellValue += `\nFaculty: ${slot.inchargeFacultyName}`;
          }

          // Add description if available
          if (slot.description) {
            cellValue += `\nNote: ${slot.description}`;
          }

          row.push(cellValue);
        } else if (options.includeEmptySlots) {
          row.push(""); // Empty slot
        } else {
          row.push(""); // Empty slot
        }
      });

      gridData.push(row);
    });

    // Add summary at the bottom
    gridData.push([]); // Empty row
    gridData.push(["SUMMARY", ...Array(sortedTimeSlots.length).fill("")]);
    gridData.push([
      "Total Time Slots:",
      sectionData.timeSlots.length,
      ...Array(sortedTimeSlots.length - 1).fill(""),
    ]);
    gridData.push([
      "Regular Classes:",
      sectionData.timeSlots.filter((s) => s.slotType === "REGULAR").length,
      ...Array(sortedTimeSlots.length - 1).fill(""),
    ]);
    gridData.push([
      "Breaks:",
      sectionData.timeSlots.filter((s) => s.slotType === "BREAK").length,
      ...Array(sortedTimeSlots.length - 1).fill(""),
    ]);
    gridData.push([
      "Exams:",
      sectionData.timeSlots.filter((s) => s.slotType === "EXAM").length,
      ...Array(sortedTimeSlots.length - 1).fill(""),
    ]);
    gridData.push([
      "Special Events:",
      sectionData.timeSlots.filter((s) => s.slotType === "SPECIAL").length,
      ...Array(sortedTimeSlots.length - 1).fill(""),
    ]);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(gridData);

    // Set column widths
    const colWidths = [
      { wch: 12 }, // Day column
      ...sortedTimeSlots.map(() => ({ wch: 18 })), // Time slot columns
    ];
    ws["!cols"] = colWidths;

    // Apply styling if color coding is enabled
    if (options.colorCode) {
      this.applyScheduleGridStyling(ws, gridData, sectionData.timeSlots);
    }

    XLSX.utils.book_append_sheet(workbook, ws, wsName);
  }

  private static addOverviewSheet(
    workbook: XLSX.WorkBook,
    sectionsData: SectionScheduleData[]
  ): void {
    const overviewData: any[][] = [];

    // Header
    overviewData.push(["SECTIONS SCHEDULE OVERVIEW"]);
    overviewData.push([`Generated on: ${new Date().toLocaleString()}`]);
    overviewData.push([]); // Empty row

    // Summary stats
    const totalSections = sectionsData.length;
    const sectionsWithSchedule = sectionsData.filter(
      (s) => s.hasSchedule
    ).length;
    const totalTimeSlots = sectionsData.reduce(
      (sum, s) => sum + s.timeSlots.length,
      0
    );

    overviewData.push(["SUMMARY STATISTICS"]);
    overviewData.push(["Total Sections:", totalSections]);
    overviewData.push(["Sections with Schedule:", sectionsWithSchedule]);
    overviewData.push(["Total Time Slots:", totalTimeSlots]);
    overviewData.push([]); // Empty row

    // Sections table header
    overviewData.push([
      "Section Name",
      "Room",
      "Training",
      "Students",
      "Total Slots",
      "Regular",
      "Breaks",
      "Exams",
      "Special",
      "Has Schedule",
    ]);

    // Sections data
    sectionsData.forEach((section) => {
      const regularSlots = section.timeSlots.filter(
        (s) => s.slotType === "REGULAR"
      ).length;
      const breakSlots = section.timeSlots.filter(
        (s) => s.slotType === "BREAK"
      ).length;
      const examSlots = section.timeSlots.filter(
        (s) => s.slotType === "EXAM"
      ).length;
      const specialSlots = section.timeSlots.filter(
        (s) => s.slotType === "SPECIAL"
      ).length;

      overviewData.push([
        section.sectionName,
        section.roomName,
        section.trainingName || "N/A",
        section.sectionStrength || "N/A",
        section.timeSlots.length,
        regularSlots,
        breakSlots,
        examSlots,
        specialSlots,
        section.hasSchedule ? "Yes" : "No",
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(overviewData);

    // Set column widths
    ws["!cols"] = [
      { wch: 15 }, // Section Name
      { wch: 25 }, // Room
      { wch: 20 }, // Training
      { wch: 10 }, // Students
      { wch: 12 }, // Total Slots
      { wch: 10 }, // Regular
      { wch: 10 }, // Breaks
      { wch: 10 }, // Exams
      { wch: 10 }, // Special
      { wch: 12 }, // Has Schedule
    ];

    XLSX.utils.book_append_sheet(workbook, ws, "Overview");
  }

  private static addMetadataSheet(
    workbook: XLSX.WorkBook,
    sectionsData: SectionScheduleData[]
  ): void {
    const metadataData: any[][] = [];

    metadataData.push(["EXPORT METADATA"]);
    metadataData.push(["Generated on:", new Date().toLocaleString()]);
    metadataData.push(["Total sections:", sectionsData.length]);
    metadataData.push(["Export format:", "Excel (.xlsx)"]);
    metadataData.push([]); // Empty row

    metadataData.push(["LEGEND"]);
    metadataData.push(["REGULAR:", "Regular class sessions"]);
    metadataData.push(["BREAK:", "Break periods"]);
    metadataData.push(["EXAM:", "Examination sessions"]);
    metadataData.push(["SPECIAL:", "Special events or sessions"]);
    metadataData.push([]); // Empty row

    metadataData.push(["TIME FORMAT"]);
    metadataData.push(["All times are in 24-hour format (HH:MM)"]);
    metadataData.push(["Time slots show start-end time range"]);

    const ws = XLSX.utils.aoa_to_sheet(metadataData);
    ws["!cols"] = [{ wch: 15 }, { wch: 30 }];

    XLSX.utils.book_append_sheet(workbook, ws, "Metadata");
  }

  private static applyScheduleGridStyling(
    ws: XLSX.WorkSheet,
    gridData: any[][],
    timeSlots: TimeSlot[]
  ): void {
    // This would apply cell styling based on slot types
    // Implementation depends on the Excel library's styling capabilities
    // For now, we'll keep it simple as XLSX.js has limited styling support
    // You could implement cell coloring here if needed
    // Example: Different background colors for different slot types
  }
}
