import * as XLSX from "xlsx";
// Note: Using regular xlsx first to ensure functionality, then add styling
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

// Color scheme for different slot types
const SLOT_COLORS = {
  REGULAR: { bg: "E3F2FD", text: "1565C0" }, // Light blue
  BREAK: { bg: "FFF3E0", text: "EF6C00" }, // Light orange
  EXAM: { bg: "FFEBEE", text: "C62828" }, // Light red
  SPECIAL: { bg: "F3E5F5", text: "7B1FA2" }, // Light purple
  EMPTY: { bg: "F5F5F5", text: "757575" }, // Light gray
};

// Header styles
const HEADER_STYLE = {
  font: { bold: true, size: 14, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: "1976D2" } },
  alignment: { horizontal: "center", vertical: "center" },
  border: {
    top: { style: "thin", color: { rgb: "000000" } },
    bottom: { style: "thin", color: { rgb: "000000" } },
    left: { style: "thin", color: { rgb: "000000" } },
    right: { style: "thin", color: { rgb: "000000" } },
  },
};

const TITLE_STYLE = {
  font: { bold: true, size: 16, color: { rgb: "1976D2" } },
  alignment: { horizontal: "center" },
};

const DAY_STYLE = {
  font: { bold: true, size: 12 },
  fill: { fgColor: { rgb: "ECEFF1" } },
  alignment: { horizontal: "center", vertical: "center" },
  border: {
    top: { style: "thin", color: { rgb: "000000" } },
    bottom: { style: "thin", color: { rgb: "000000" } },
    left: { style: "thin", color: { rgb: "000000" } },
    right: { style: "thin", color: { rgb: "000000" } },
  },
};

const CELL_BORDER = {
  top: { style: "thin", color: { rgb: "CCCCCC" } },
  bottom: { style: "thin", color: { rgb: "CCCCCC" } },
  left: { style: "thin", color: { rgb: "CCCCCC" } },
  right: { style: "thin", color: { rgb: "CCCCCC" } },
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
      this.addOverviewSheetEnhanced(workbook, sectionsData);

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
    const wsName = sheetName || sectionData.sectionName;

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

    // Create the grid data using simple array approach
    const gridData: any[][] = [];

    // Title and section info
    gridData.push([`${sectionData.sectionName} - Weekly Schedule`]);
    gridData.push([]);
    gridData.push([
      `Room: ${sectionData.roomName || "Not Assigned"}`,
      `Training: ${sectionData.trainingName || "N/A"}`,
      `Students: ${sectionData.sectionStrength || "N/A"}`
    ]);
    gridData.push([]);

    // Time slots header row
    const timeSlotsHeader = ["Day", ...sortedTimeSlots];
    gridData.push(timeSlotsHeader);

    // Day rows
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
          const cellValue = this.formatSlotContent(slot, sectionData.sectionName);
          row.push(cellValue);
        } else {
          row.push(options.includeEmptySlots ? "" : "");
        }
      });

      gridData.push(row);
    });

    // Summary section
    gridData.push([]);
    gridData.push(["SCHEDULE SUMMARY"]);
    gridData.push(["Total Time Slots:", sectionData.timeSlots.length]);
    gridData.push(["Regular Classes:", sectionData.timeSlots.filter(s => s.slotType === "REGULAR").length]);
    gridData.push(["Break Periods:", sectionData.timeSlots.filter(s => s.slotType === "BREAK").length]);
    gridData.push(["Examinations:", sectionData.timeSlots.filter(s => s.slotType === "EXAM").length]);
    gridData.push(["Special Events:", sectionData.timeSlots.filter(s => s.slotType === "SPECIAL").length]);

    // Create worksheet from array data
    const ws = XLSX.utils.aoa_to_sheet(gridData);

    // Set column widths
    const colWidths = [
      { wch: 15 }, // Day column
      ...sortedTimeSlots.map(() => ({ wch: 20 })), // Time slot columns
    ];
    ws["!cols"] = colWidths;

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

    // Title and export details
    metadataData.push(['📋 EXPORT INFORMATION & LEGEND']);
    metadataData.push([]);
    metadataData.push(['📊 Export Details']);
    metadataData.push(['Generated on:', new Date().toLocaleString()]);
    metadataData.push(['Total sections:', sectionsData.length]);
    metadataData.push(['Export format:', 'Microsoft Excel (.xlsx)']);
    metadataData.push(['Generated by:', 'CRT Portal - Schedule Management System']);
    metadataData.push([]);

    // Legend
    metadataData.push(['🎨 Slot Type Legend']);
    metadataData.push(['📚 REGULAR', 'Regular class sessions']);
    metadataData.push(['🍽️ BREAK', 'Break periods & lunch time']);
    metadataData.push(['📝 EXAM', 'Examination sessions']);
    metadataData.push(['⭐ SPECIAL', 'Special events or sessions']);
    metadataData.push(['⬜ EMPTY', 'Unscheduled time slots']);
    metadataData.push([]);

    // Usage instructions
    metadataData.push(['📖 How to Read This Schedule']);
    metadataData.push(['• Each sheet represents one section\'s weekly schedule']);
    metadataData.push(['• Days are shown as rows (Monday to Sunday)']);
    metadataData.push(['• Time slots are shown as columns (e.g., 09:00-10:00)']);
    metadataData.push(['• Each cell contains: Activity Type, Faculty Name, Time, Notes']);
    metadataData.push(['• Colors indicate different types of activities']);
    metadataData.push(['• Empty cells represent unscheduled time slots']);
    metadataData.push(['• Summary statistics are provided at the bottom of each sheet']);

    const ws = XLSX.utils.aoa_to_sheet(metadataData);
    
    // Set column widths
    ws["!cols"] = [
      { wch: 35 }, // Main column
      { wch: 40 }, // Description column
    ];

    XLSX.utils.book_append_sheet(workbook, ws, "Info & Legend");
  }

  // Utility function to set cell value with style
  private static setCellValue(
    ws: XLSX.WorkSheet,
    address: string,
    value: any,
    style?: any
  ): void {
    ws[address] = {
      t: typeof value === 'number' ? 'n' : 's',
      v: value,
      s: style || {},
    };
  }

  // Convert column number to Excel column letter
  private static numberToColumn(num: number): string {
    let result = '';
    while (num > 0) {
      num--;
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26);
    }
    return result;
  }

  // Format slot content for display
  private static formatSlotContent(slot: TimeSlot, sectionName: string): string {
    let content = '';
    
    // Main activity
    switch (slot.slotType) {
      case 'BREAK':
        content = `🍽️ ${slot.title || 'Break'}`;
        break;
      case 'EXAM':
        content = `📝 ${slot.title || 'Examination'}`;
        break;
      case 'SPECIAL':
        content = `⭐ ${slot.title || 'Special Event'}`;
        break;
      default:
        content = `📚 ${sectionName}`;
    }
    
    // Add faculty information
    if (slot.inchargeFacultyName) {
      content += `\n👨‍🏫 ${slot.inchargeFacultyName}`;
    }
    
    // Add time for clarity
    content += `\n⏰ ${slot.startTime} - ${slot.endTime}`;
    
    // Add description if available
    if (slot.description && slot.description.trim()) {
      content += `\n📋 ${slot.description}`;
    }
    
    return content;
  }

  // Get style for slot type
  private static getSlotStyle(slotType: keyof typeof SLOT_COLORS): any {
    const colors = SLOT_COLORS[slotType];
    return {
      fill: { fgColor: { rgb: colors.bg } },
      font: { color: { rgb: colors.text }, size: 10 },
      border: CELL_BORDER,
      alignment: { 
        wrapText: true, 
        vertical: "top", 
        horizontal: "left",
        indent: 1
      },
    };
  }

  // Enhanced overview sheet with better formatting
  private static addOverviewSheetEnhanced(
    workbook: XLSX.WorkBook,
    sectionsData: SectionScheduleData[]
  ): void {
    const overviewData: any[][] = [];

    // Title and summary stats
    overviewData.push(["📊 SECTIONS OVERVIEW DASHBOARD"]);
    overviewData.push([`Generated: ${new Date().toLocaleString()}`]);
    overviewData.push([]);

    const totalSections = sectionsData.length;
    const sectionsWithSchedule = sectionsData.filter(s => s.hasSchedule).length;
    const totalTimeSlots = sectionsData.reduce((sum, s) => sum + s.timeSlots.length, 0);
    const totalStudents = sectionsData.reduce((sum, s) => sum + (s.sectionStrength || 0), 0);

    overviewData.push(["SUMMARY STATISTICS"]);
    overviewData.push(["🏫 Total Sections:", totalSections]);
    overviewData.push(["📅 Active Schedules:", sectionsWithSchedule]);
    overviewData.push(["⏰ Total Time Slots:", totalTimeSlots]);
    overviewData.push(["👥 Total Students:", totalStudents]);
    overviewData.push([]);

    // Detailed table header
    overviewData.push([
      'Section Name', 'Room', 'Training Program', 'Students', 
      'Total Slots', 'Classes', 'Breaks', 'Exams', 'Special', 'Status'
    ]);

    // Detailed table data
    sectionsData.forEach((section) => {
      const regularSlots = section.timeSlots.filter(s => s.slotType === "REGULAR").length;
      const breakSlots = section.timeSlots.filter(s => s.slotType === "BREAK").length;
      const examSlots = section.timeSlots.filter(s => s.slotType === "EXAM").length;
      const specialSlots = section.timeSlots.filter(s => s.slotType === "SPECIAL").length;
      
      overviewData.push([
        section.sectionName,
        section.roomName || "Not Assigned",
        section.trainingName || "N/A",
        section.sectionStrength || 0,
        section.timeSlots.length,
        regularSlots,
        breakSlots,
        examSlots,
        specialSlots,
        section.hasSchedule ? "✅ Active" : "❌ No Schedule"
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(overviewData);

    // Set column widths
    ws["!cols"] = [
      { wch: 18 }, // Section Name
      { wch: 25 }, // Room
      { wch: 20 }, // Training
      { wch: 10 }, // Students
      { wch: 12 }, // Total Slots
      { wch: 10 }, // Regular
      { wch: 10 }, // Breaks
      { wch: 10 }, // Exams
      { wch: 10 }, // Special
      { wch: 15 }, // Status
    ];

    XLSX.utils.book_append_sheet(workbook, ws, "Overview");
  }
}
