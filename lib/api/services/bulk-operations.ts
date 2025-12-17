import axios, { AxiosResponse } from "axios";

// Constants
const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api",
  TIMEOUT: 300000, // 5 minutes
} as const;

const BULK_ENDPOINTS = {
  STUDENTS: "/bulk/students/upload",
  SIMPLE_ROOMS: "/bulk/simple-room/upload",
  TRAININGS: "/bulk/Trainings/upload",
  SECTIONS: "/bulk/section/upload",
  STUDENT_REGISTRATION: "/bulk/register-students",
  FACULTIES: "/bulk/faculties",
  TIMETABLE: "/bulk/timetable/upload",
} as const;

// Types
interface BulkUploadResponse {
  success: boolean;
  message: string;
  data?: any;
}

type BulkUploadResult = Promise<AxiosResponse<BulkUploadResponse>>;

// Axios instance configuration
const bulkUploadApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

/**
 * Generic file upload function to eliminate code duplication
 * @param file - The file to upload
 * @param endpoint - The API endpoint for the upload
 * @returns Promise resolving to the API response
 * @throws Error if file is invalid or upload fails
 */
const uploadFile = async (file: File, endpoint: string): BulkUploadResult => {
  if (!file) {
    throw new Error("File is required for bulk upload");
  }

  if (file.size === 0) {
    throw new Error("File cannot be empty");
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    return await bulkUploadApi.post(endpoint, formData);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Upload failed: ${error.response?.data?.message || error.message}`
      );
    }
    throw error;
  }
};

/**
 * Upload students data in bulk
 * @param file - CSV/Excel file containing students data
 * @returns Promise resolving to the upload response
 */
export const bulkUploadStudents = async (file: File): BulkUploadResult => {
  return uploadFile(file, BULK_ENDPOINTS.STUDENTS);
};

/**
 * Create simple rooms in bulk
 * @param file - CSV/Excel file containing room data
 * @returns Promise resolving to the upload response
 */
export const bulkCreateSimpleRooms = async (file: File): BulkUploadResult => {
  return uploadFile(file, BULK_ENDPOINTS.SIMPLE_ROOMS);
};

/**
 * Upload training data in bulk
 * @param file - CSV/Excel file containing training data
 * @returns Promise resolving to the upload response
 */
export const bulkUploadTrainings = async (file: File): BulkUploadResult => {
  return uploadFile(file, BULK_ENDPOINTS.TRAININGS);
};

/**
 * Upload sections data in bulk
 * @param file - CSV/Excel file containing sections data
 * @returns Promise resolving to the upload response
 */
export const bulkUploadSections = async (file: File): BulkUploadResult => {
  return uploadFile(file, BULK_ENDPOINTS.SECTIONS);
};

/**
 * Register students to sections in bulk
 * @param file - CSV/Excel file containing student-section mappings
 * @returns Promise resolving to the upload response
 */
export const bulkRegisterStudentsToSections = async (
  file: File
): BulkUploadResult => {
  return uploadFile(file, BULK_ENDPOINTS.STUDENT_REGISTRATION);
};

/**
 * Upload faculty data in bulk
 * @param file - CSV/Excel file containing faculty data
 * @returns Promise resolving to the upload response
 */
export const bulkUploadFaculties = async (file: File): BulkUploadResult => {
  return uploadFile(file, BULK_ENDPOINTS.FACULTIES);
};

/**
 * Upload timetable data in bulk
 * @param file - CSV/Excel file containing timetable data
 * @returns Promise resolving to the upload response
 */
export const bulkUploadTimetable = async (file: File): BulkUploadResult => {
  return uploadFile(file, BULK_ENDPOINTS.TIMETABLE);
};
