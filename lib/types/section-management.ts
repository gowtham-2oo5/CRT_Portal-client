// Section Management Types based on API schema

export interface Training {
  id: string;
  name: string;
  sn: string;
  sections?: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  regNum: string; // Registration number (unique)
  department: string;
  batch: string; // Academic batch/year
  section: string; // Section of the student
  crtEligibility: boolean;
  feedback?: string; // Max 500 characters
  attendancePercentage: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Section {
  id: string;
  name: string;
  training: Training; // Changed from 'trainer' to 'training' to match API
  students: Student[];
  strength: number;
}

export interface CreateSectionRequest {
  TrainingId: string; 
  sectionName: string;
}

export interface UpdateSectionRequest {
  TrainingId?: string; 
  sectionName?: string;
}

export interface SectionFilters {
  search?: string; // Search by section name or training name
  TrainingId?: string; // This is actually trainingId
}

export interface BulkSectionOperation {
  sectionIds: string[];
  operation: "DELETE";
}

export interface RegisterStudentsRequest {
  file: File;
}

export interface UpdateStudentSectionRequest {
  studentId: string;
  sectionId: string;
}
