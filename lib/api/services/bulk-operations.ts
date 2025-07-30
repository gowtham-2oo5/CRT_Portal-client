import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
const BULK_UPLOAD_API_TIMEOUT = 300000;

const bulkUploadApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: BULK_UPLOAD_API_TIMEOUT,

  withCredentials: true,
});

export const bulkUploadStudents = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return bulkUploadApi.post("/bulk/students/upload", formData);
};

export const bulkCreateRoomsSimple = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return bulkUploadApi.post("/bulk/simple-room/upload", formData);
};

export const bulkUploadTrainings = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  // Ensuring exact match with backend endpoint (capital T in Trainings)
  return bulkUploadApi.post("/bulk/Trainings/upload", formData);
};

export const bulkUploadSections = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return bulkUploadApi.post("/bulk/section/upload", formData);
};

export const registerStudentsToSections = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return bulkUploadApi.post("/bulk/register-students", formData);
};

export const uploadFacs = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return bulkUploadApi.post("/bulk/faculties", formData);
};
