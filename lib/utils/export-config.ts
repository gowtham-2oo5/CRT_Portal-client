/**
 * Export Configuration Management
 * Centralized configuration for all export types
 */

export interface ExportConfig<T = any> {
  id: string;
  name: string;
  description: string;
  headers: { key: keyof T; label: string }[];
  filenamePrefix: string;
  maxRecords: number;
  chunkSize: number;
  defaultFilters?: Record<string, any>;
  validation?: {
    required: (keyof T)[];
    custom?: (data: T[]) => { isValid: boolean; errors: string[] };
  };
}

// Predefined export configurations
export const EXPORT_CONFIGS = {
  FACULTY: {
    id: 'faculty',
    name: 'Faculty Export',
    description: 'Export all faculty members with their details',
    headers: [
      { key: 'id', label: 'ID' },
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'department', label: 'Department' },
      { key: 'isActive', label: 'Status' },
      { key: 'lastLogin', label: 'Last Login' },
    ],
    filenamePrefix: 'faculty_export',
    maxRecords: 5000,
    chunkSize: 500,
    validation: {
      required: ['id', 'name', 'email'],
    },
  },

  PENDING_ATTENDANCE: {
    id: 'pending_attendance',
    name: 'Pending Attendance Export',
    description: 'Export timeslots with pending attendance',
    headers: [
      { key: 'facultyName', label: 'Faculty Name' },
      { key: 'facultyEmail', label: 'Faculty Email' },
      { key: 'facultyPhone', label: 'Faculty Phone' },
      { key: 'sectionName', label: 'Section' },
      { key: 'roomName', label: 'Room' },
      { key: 'day', label: 'Day' },
      { key: 'startTime', label: 'Start Time' },
      { key: 'endTime', label: 'End Time' },
      { key: 'isBreak', label: 'Is Break' },
      { key: 'attendancePosted', label: 'Attendance Posted' },
    ],
    filenamePrefix: 'pending_attendance',
    maxRecords: 10000,
    chunkSize: 1000,
    validation: {
      required: ['facultyName', 'sectionName', 'startTime', 'endTime'],
    },
  },

  ABSENTEES: {
    id: 'absentees',
    name: 'Absentees Export',
    description: 'Export student absentee information',
    headers: [
      { key: 'id', label: 'Student ID' },
      { key: 'name', label: 'Student Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'sectionName', label: 'Section' },
      { key: 'date', label: 'Date' },
      { key: 'startTime', label: 'Start Time' },
      { key: 'endTime', label: 'End Time' },
      { key: 'facultyName', label: 'Faculty' },
    ],
    filenamePrefix: 'absentees',
    maxRecords: 15000,
    chunkSize: 1500,
    validation: {
      required: ['id', 'name', 'sectionName', 'date'],
    },
  },

  ATTENDANCE_RECORDS: {
    id: 'attendance_records',
    name: 'Attendance Records Export',
    description: 'Export detailed attendance records',
    headers: [
      { key: 'studentId', label: 'Student ID' },
      { key: 'studentName', label: 'Student Name' },
      { key: 'studentEmail', label: 'Email' },
      { key: 'studentPhone', label: 'Phone' },
      { key: 'date', label: 'Date' },
      { key: 'startTime', label: 'Start Time' },
      { key: 'endTime', label: 'End Time' },
      { key: 'sectionName', label: 'Section' },
      { key: 'facultyName', label: 'Faculty' },
      { key: 'status', label: 'Status' },
    ],
    filenamePrefix: 'attendance_records',
    maxRecords: 20000,
    chunkSize: 2000,
    validation: {
      required: ['studentId', 'studentName', 'date', 'sectionName'],
    },
  },
} as const;

export type ExportConfigId = keyof typeof EXPORT_CONFIGS;

/**
 * Get export configuration by ID
 */
export function getExportConfig(id: ExportConfigId): ExportConfig {
  return EXPORT_CONFIGS[id];
}

/**
 * Validate export data against configuration
 */
export function validateExportData<T>(
  data: T[],
  config: ExportConfig<T>
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if data exists
  if (!data || data.length === 0) {
    errors.push('No data to export');
    return { isValid: false, errors, warnings };
  }

  // Check record limit
  if (data.length > config.maxRecords) {
    errors.push(`Too many records: ${data.length}. Maximum allowed: ${config.maxRecords}`);
  }

  // Check required fields
  if (config.validation?.required) {
    const firstRecord = data[0];
    const missingFields = config.validation.required.filter(
      field => !(field in firstRecord) || firstRecord[field] == null
    );
    
    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  // Run custom validation
  if (config.validation?.custom) {
    const customResult = config.validation.custom(data);
    if (!customResult.isValid) {
      errors.push(...customResult.errors);
    }
  }

  // Add warnings for large datasets
  if (data.length > config.chunkSize * 5) {
    warnings.push(`Large dataset detected (${data.length} records). Export may take longer.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Transform data for export based on configuration
 */
export function transformExportData<T>(
  data: T[],
  config: ExportConfig<T>
): T[] {
  // Apply any common transformations here
  return data.map(item => {
    const transformed = { ...item };
    
    // Convert boolean values to readable strings
    Object.keys(transformed).forEach(key => {
      if (typeof transformed[key] === 'boolean') {
        transformed[key] = transformed[key] ? 'Yes' : 'No';
      }
      
      // Format dates
      if (transformed[key] instanceof Date) {
        transformed[key] = transformed[key].toLocaleDateString();
      }
      
      // Handle null/undefined values
      if (transformed[key] == null) {
        transformed[key] = 'N/A';
      }
    });
    
    return transformed;
  });
}
