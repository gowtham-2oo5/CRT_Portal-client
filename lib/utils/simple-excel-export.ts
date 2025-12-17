/**
 * Simple Excel Export Utility
 * Reliable Excel export without complex formatting
 */

import * as ExcelJS from 'xlsx';

export interface SimpleExcelColumn {
  key: string;
  label: string;
  width?: number;
}

export interface SimpleExcelOptions {
  filename: string;
  sheetName?: string;
  title?: string;
  includeTimestamp?: boolean;
}

/**
 * Simple Excel export that actually works
 */
export function exportToSimpleExcel<T extends Record<string, any>>(
  data: T[],
  columns: SimpleExcelColumn[],
  options: SimpleExcelOptions
): void {
  try {
    console.log('=== SIMPLE EXCEL EXPORT DEBUG ===');
    console.log('Input data:', data);
    console.log('Data length:', data.length);
    console.log('Columns:', columns);
    console.log('Options:', options);

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No data to export');
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Prepare data for Excel
    const excelData: any[][] = [];

    // Add title if provided
    if (options.title) {
      excelData.push([options.title]);
      excelData.push([]); // Empty row
    }

    // Add timestamp if requested
    if (options.includeTimestamp) {
      excelData.push([`Generated on: ${new Date().toLocaleString()}`]);
      excelData.push([]); // Empty row
    }

    // Add headers
    const headers = columns.map(col => col.label);
    excelData.push(headers);

    // Add data rows
    data.forEach(row => {
      const excelRow = columns.map(col => {
        const value = row[col.key];
        // Handle different data types
        if (value === null || value === undefined) {
          return '';
        }
        if (typeof value === 'boolean') {
          return value ? 'Yes' : 'No';
        }
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        return String(value);
      });
      excelData.push(excelRow);
    });

    console.log('Excel data array:', excelData);

    // Create worksheet from array
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths
    const colWidths = columns.map(col => ({
      wch: col.width || Math.max(col.label.length + 2, 15)
    }));
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    const sheetName = options.sheetName || 'Data';
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate filename
    const timestamp = options.includeTimestamp 
      ? `_${new Date().toISOString().split('T')[0]}_${new Date().toTimeString().split(' ')[0].replace(/:/g, '-')}`
      : '';
    const filename = `${options.filename}${timestamp}.xlsx`;

    console.log('Writing file:', filename);

    // Write file
    XLSX.writeFile(workbook, filename);

    console.log('=== EXCEL EXPORT COMPLETED ===');
  } catch (error) {
    console.error('=== EXCEL EXPORT ERROR ===', error);
    throw error;
  }
}

/**
 * Quick export function with default options
 */
export function quickExcelExport<T extends Record<string, any>>(
  data: T[],
  columns: SimpleExcelColumn[],
  filename: string,
  title?: string
): void {
  exportToSimpleExcel(data, columns, {
    filename,
    title,
    includeTimestamp: true,
    sheetName: 'Export Data'
  });
}
