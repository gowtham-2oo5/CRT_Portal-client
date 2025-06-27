// Student Management Types based on your API specification

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  regNum: string; // Registration number (unique)
  department: string;
  batch: string; // Academic batch/year
  crtEligibility: boolean;
  feedback?: string; // Max 500 characters
  attendancePercentage: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStudentRequest {
  name: string;
  email: string;
  phone: string;
  regNum: string;
  department: string;
  batch: string;
  crtEligibility?: boolean;
  feedback?: string;
}

export interface UpdateStudentRequest {
  name?: string;
  email?: string;
  phone?: string;
  regNum?: string;
  department?: string;
  batch?: string;
  crtEligibility?: boolean;
  feedback?: string;
}

export interface CRTEligibilityRequest {
  reason: string;
}

export interface StudentFilters {
  search?: string;
  department?: string | 'ALL';
  batch?: string | 'ALL';
  crtEligibility?: 'ALL' | 'ELIGIBLE' | 'NOT_ELIGIBLE';
  attendanceRange?: {
    min: number;
    max: number;
  };
}

export interface BulkStudentOperation {
  studentIds: string[];
  operation: 'DELETE' | 'ADD_TO_CRT' | 'REMOVE_FROM_CRT';
  reason?: string; // For CRT operations
}

// Department options
export const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication Engineering', 
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical & Electronics Engineering',
  'Information Technology',
  'Chemical Engineering',
  'Biotechnology'
] as const;

// Batch/Year options
export const BATCHES = [
  '2021-2025',
  '2022-2026', 
  '2023-2027',
  '2024-2028',
  '2025-2029'
] as const;

export type Department = typeof DEPARTMENTS[number];
export type Batch = typeof BATCHES[number];
