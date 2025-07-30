/**
 * Excel Export Utility
 * Advanced Excel export with formatting, multiple sheets, and charts
 */

import * as XLSX from 'xlsx';

export interface ExcelColumn {
  key: string;
  label: string;
  width?: number;
  type?: 'string' | 'number' | 'date' | 'boolean';
  format?: string; // Excel format code
}

export interface ExcelSheet {
  name: string;
  data: any[];
  columns: ExcelColumn[];
  title?: string;
  subtitle?: string;
  showSummary?: boolean;
  summaryData?: Record<string, any>;
}

export interface ExcelExportOptions {
  filename: string;
  sheets: ExcelSheet[];
  includeTimestamp?: boolean;
  companyInfo?: {
    name: string;
    address?: string;
    logo?: string; // base64 or URL
  };
  author?: string;
  subject?: string;
  keywords?: string[];
}

export interface ExcelStyling {
  headerStyle?: {
    backgroundColor?: string;
    fontColor?: string;
    fontSize?: number;
    bold?: boolean;
  };
  titleStyle?: {
    backgroundColor?: string;
    fontColor?: string;
    fontSize?: number;
    bold?: boolean;
  };
  dataStyle?: {
    alternateRowColor?: string;
    borderStyle?: string;
  };
}

class ExcelExportService {
  private defaultStyling: ExcelStyling = {
    headerStyle: {
      backgroundColor: '#4F46E5',
      fontColor: '#FFFFFF',
      fontSize: 12,
      bold: true,
    },
    titleStyle: {
      backgroundColor: '#F8FAFC',
      fontColor: '#1E293B',
      fontSize: 16,
      bold: true,
    },
    dataStyle: {
      alternateRowColor: '#F8FAFC',
      borderStyle: 'thin',
    },
  };

  /**
   * Export data to Excel with advanced formatting
   */
  async exportToExcel(options: ExcelExportOptions, styling?: ExcelStyling): Promise<void> {
    try {
      const workbook = XLSX.utils.book_new();
      const mergedStyling = { ...this.defaultStyling, ...styling };

      // Set workbook properties
      workbook.Props = {
        Title: options.filename,
        Subject: options.subject || 'Data Export',
        Author: options.author || 'CRT Portal',
        CreatedDate: new Date(),
        Keywords: options.keywords?.join(', ') || '',
      };

      // Process each sheet
      for (const sheetConfig of options.sheets) {
        const worksheet = this.createWorksheet(sheetConfig, mergedStyling, options);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetConfig.name);
      }

      // Generate filename with timestamp if requested
      const filename = this.generateFilename(options.filename, options.includeTimestamp);

      // Write and download the file
      XLSX.writeFile(workbook, filename);

      console.log(`Excel file exported: ${filename}`);
    } catch (error) {
      console.error('Excel export failed:', error);
      throw new Error(`Excel export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a formatted worksheet
   */
  private createWorksheet(
    sheetConfig: ExcelSheet,
    styling: ExcelStyling,
    options: ExcelExportOptions
  ): XLSX.WorkSheet {
    const ws: XLSX.WorkSheet = {};
    let currentRow = 1;

    // Add company info and title
    if (options.companyInfo?.name || sheetConfig.title) {
      if (options.companyInfo?.name) {
        ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 0 })] = {
          v: options.companyInfo.name,
          t: 's',
          s: {
            font: { bold: true, sz: 18, color: { rgb: '1E293B' } },
            alignment: { horizontal: 'center' },
          },
        };
        currentRow += 2;
      }

      if (sheetConfig.title) {
        ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 0 })] = {
          v: sheetConfig.title,
          t: 's',
          s: {
            font: { bold: true, sz: 14, color: { rgb: styling.titleStyle?.fontColor || '1E293B' } },
            fill: { fgColor: { rgb: styling.titleStyle?.backgroundColor?.replace('#', '') || 'F8FAFC' } },
          },
        };
        currentRow += 1;
      }

      if (sheetConfig.subtitle) {
        ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 0 })] = {
          v: sheetConfig.subtitle,
          t: 's',
          s: {
            font: { sz: 11, color: { rgb: '64748B' } },
          },
        };
        currentRow += 1;
      }

      currentRow += 1; // Add spacing
    }

    // Add timestamp
    if (options.includeTimestamp) {
      ws[XLSX.utils.encode_cell({ r: currentRow - 1, c: 0 })] = {
        v: `Generated on: ${new Date().toLocaleString()}`,
        t: 's',
        s: {
          font: { sz: 10, color: { rgb: '64748B' } },
        },
      };
      currentRow += 2;
    }

    const headerRow = currentRow;
    currentRow += 1;

    // Add headers
    sheetConfig.columns.forEach((col, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({ r: headerRow - 1, c: colIndex });
      ws[cellRef] = {
        v: col.label,
        t: 's',
        s: {
          font: {
            bold: styling.headerStyle?.bold || true,
            color: { rgb: styling.headerStyle?.fontColor?.replace('#', '') || 'FFFFFF' },
            sz: styling.headerStyle?.fontSize || 12,
          },
          fill: {
            fgColor: { rgb: styling.headerStyle?.backgroundColor?.replace('#', '') || '4F46E5' },
          },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
          alignment: { horizontal: 'center', vertical: 'center' },
        },
      };
    });

    // Add data rows
    sheetConfig.data.forEach((row, rowIndex) => {
      const isAlternateRow = rowIndex % 2 === 1;
      
      sheetConfig.columns.forEach((col, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({ r: currentRow + rowIndex - 1, c: colIndex });
        const value = row[col.key];
        
        ws[cellRef] = {
          v: this.formatCellValue(value, col.type),
          t: this.getCellType(value, col.type),
          s: {
            fill: isAlternateRow && styling.dataStyle?.alternateRowColor ? {
              fgColor: { rgb: styling.dataStyle.alternateRowColor.replace('#', '') }
            } : undefined,
            border: {
              top: { style: 'thin', color: { rgb: 'E2E8F0' } },
              bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
              left: { style: 'thin', color: { rgb: 'E2E8F0' } },
              right: { style: 'thin', color: { rgb: 'E2E8F0' } },
            },
            alignment: { 
              horizontal: col.type === 'number' ? 'right' : 'left',
              vertical: 'center' 
            },
            numFmt: col.format,
          },
        };
      });
    });

    // Add summary section if requested
    if (sheetConfig.showSummary && sheetConfig.summaryData) {
      const summaryStartRow = currentRow + sheetConfig.data.length + 1;
      this.addSummarySection(ws, sheetConfig.summaryData, summaryStartRow, styling);
    }

    // Set column widths
    const colWidths = sheetConfig.columns.map(col => ({
      wch: col.width || this.calculateColumnWidth(col.label, sheetConfig.data, col.key),
    }));
    ws['!cols'] = colWidths;

    // Set row heights for headers
    ws['!rows'] = [
      { hpt: 25 }, // Header row height
    ];

    // Set print settings
    ws['!margins'] = { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 };
    ws['!printSettings'] = {
      horizontalDpi: 300,
      verticalDpi: 300,
      orientation: 'portrait',
    };

    return ws;
  }

  /**
   * Add summary section to worksheet
   */
  private addSummarySection(
    ws: XLSX.WorkSheet,
    summaryData: Record<string, any>,
    startRow: number,
    styling: ExcelStyling
  ): void {
    // Summary title
    ws[XLSX.utils.encode_cell({ r: startRow - 1, c: 0 })] = {
      v: 'Summary',
      t: 's',
      s: {
        font: { bold: true, sz: 12, color: { rgb: '1E293B' } },
        fill: { fgColor: { rgb: 'F1F5F9' } },
      },
    };

    // Summary data
    Object.entries(summaryData).forEach(([key, value], index) => {
      const row = startRow + index;
      
      // Key
      ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = {
        v: key,
        t: 's',
        s: { font: { bold: true } },
      };
      
      // Value
      ws[XLSX.utils.encode_cell({ r: row, c: 1 })] = {
        v: value,
        t: typeof value === 'number' ? 'n' : 's',
        s: { alignment: { horizontal: 'right' } },
      };
    });
  }

  /**
   * Format cell value based on type
   */
  private formatCellValue(value: any, type?: string): any {
    if (value == null) return 'N/A';
    
    switch (type) {
      case 'date':
        return value instanceof Date ? value : new Date(value);
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'number':
        return typeof value === 'number' ? value : parseFloat(value) || 0;
      default:
        return String(value);
    }
  }

  /**
   * Get Excel cell type
   */
  private getCellType(value: any, type?: string): string {
    if (value == null) return 's';
    
    switch (type) {
      case 'date':
        return 'd';
      case 'number':
        return 'n';
      case 'boolean':
        return 's'; // We convert to Yes/No string
      default:
        return 's';
    }
  }

  /**
   * Calculate optimal column width
   */
  private calculateColumnWidth(header: string, data: any[], key: string): number {
    const maxLength = Math.max(
      header.length,
      ...data.map(row => String(row[key] || '').length)
    );
    return Math.min(Math.max(maxLength + 2, 10), 50);
  }

  /**
   * Generate filename with optional timestamp
   */
  private generateFilename(base: string, includeTimestamp?: boolean): string {
    const timestamp = includeTimestamp 
      ? `_${new Date().toISOString().split('T')[0]}_${new Date().toTimeString().split(' ')[0].replace(/:/g, '-')}`
      : '';
    
    return `${base}${timestamp}.xlsx`;
  }

  /**
   * Create summary data for common export types
   */
  createSummaryData(data: any[], type: 'faculty' | 'attendance' | 'absentees'): Record<string, any> {
    const summary: Record<string, any> = {
      'Total Records': data.length,
      'Export Date': new Date().toLocaleDateString(),
    };

    switch (type) {
      case 'faculty':
        const activeFaculty = data.filter(f => f.isActive === 'Yes' || f.isActive === true).length;
        summary['Active Faculty'] = activeFaculty;
        summary['Inactive Faculty'] = data.length - activeFaculty;
        break;
        
      case 'attendance':
        const postedCount = data.filter(a => a.attendancePosted === 'Yes' || a.attendancePosted === true).length;
        summary['Posted Attendance'] = postedCount;
        summary['Pending Attendance'] = data.length - postedCount;
        break;
        
      case 'absentees':
        const uniqueSections = new Set(data.map(a => a.sectionName)).size;
        summary['Unique Sections'] = uniqueSections;
        summary['Average per Section'] = Math.round(data.length / uniqueSections);
        break;
    }

    return summary;
  }
}

export const excelExportService = new ExcelExportService();

/**
 * Quick export function for simple use cases
 */
export async function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: ExcelColumn[],
  filename: string,
  options?: Partial<ExcelExportOptions>
): Promise<void> {
  const exportOptions: ExcelExportOptions = {
    filename,
    sheets: [{
      name: 'Data',
      data,
      columns,
      title: options?.subject || filename,
      showSummary: true,
    }],
    includeTimestamp: true,
    companyInfo: {
      name: 'CRT Portal System',
    },
    ...options,
  };

  await excelExportService.exportToExcel(exportOptions);
}
