"use client";

import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://ec2-35-170-179-81.compute-1.amazonaws.com";
const API_TIMEOUT = 10000;
const BULK_UPLOAD_API_TIMEOUT = 300000;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const bulkUploadClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: BULK_UPLOAD_API_TIMEOUT,
  headers: {
    "Content-Type": "multipart/form-data",
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(undefined);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url === "/auth/refresh-token") {
        console.log("[API] Refresh token is invalid, logging out");
        sessionStorage.removeItem("user-info");
        window.location.href = "/";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post("/auth/refresh-token");

        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        sessionStorage.removeItem("user-info");
        window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 403) {
      console.log("[API] Access denied - insufficient permissions");

      // window.location.href = "/unauthorized";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

bulkUploadClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("user-info");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Export the public API for convenience
export const publicApi = apiClient;
