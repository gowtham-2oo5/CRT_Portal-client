import { bulkUploadApi } from "../client";

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
