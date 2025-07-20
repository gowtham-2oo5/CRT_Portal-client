/**
 * CSV Export Utility
 * Provides functions to convert data to CSV format and trigger downloads
 */

/**
 * Convert array of objects to CSV string
 * @param data Array of objects to convert
 * @param headers Optional custom headers (if not provided, will use object keys)
 * @returns CSV formatted string
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  headers?: { key: keyof T; label: string }[]
): string {
  if (!data || data.length === 0) {
    return '';
  }

  // If headers not provided, use object keys
  const csvHeaders = headers || 
    Object.keys(data[0]).map(key => ({ 
      key: key as keyof T, 
      label: key.charAt(0).toUpperCase() + key.slice(1) 
    }));

  // Create header row
  const headerRow = csvHeaders.map(h => `"${h.label}"`).join(',');

  // Create data rows
  const rows = data.map(item => {
    return csvHeaders
      .map(header => {
        const value = item[header.key];
        // Handle different data types
        if (value === null || value === undefined) {
          return '""';
        } else if (typeof value === 'string') {
          // Escape quotes in strings
          return `"${value.replace(/"/g, '""')}"`;
        } else if (value instanceof Date) {
          return `"${value.toISOString()}"`;
        } else {
          return `"${value}"`;
        }
      })
      .join(',');
  });

  // Combine header and rows
  return [headerRow, ...rows].join('\n');
}

/**
 * Check if code is running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Download data as CSV file
 * @param data Array of objects to convert to CSV
 * @param filename Filename for the downloaded file (without extension)
 * @param headers Optional custom headers
 */
export function downloadCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: { key: keyof T; label: string }[]
): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Check if running in browser environment
  if (!isBrowser()) {
    console.warn('CSV download is only available in browser environment');
    return;
  }

  const csvContent = convertToCSV(data, headers);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Set link properties
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  // Append to document, trigger download, and clean up
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format date for CSV filename
 * @returns Formatted date string (YYYY-MM-DD)
 */
export function getFormattedDate(): string {
  const now = new Date();
  
  // Format as YYYY-MM-DD
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Generate a standardized filename with date
 * @param prefix Prefix for the filename
 * @returns Formatted filename with date
 */
export function generateFilename(prefix: string): string {
  return `${prefix}_${getFormattedDate()}`;
}
