"use client";

import axios from "axios";
import { handleApiError } from "@/lib/api/utils";

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
const API_TIMEOUT = 10000;
const BULK_UPLOAD_API_TIMEOUT = 300000;

// Base axios instance for all API calls
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // This is crucial - it tells axios to send cookies
});

// For bulk uploads with different timeout
export const bulkUploadClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: BULK_UPLOAD_API_TIMEOUT,
  headers: {
    "Content-Type": "multipart/form-data",
  },
  withCredentials: true, // Also send cookies with bulk uploads
});

// Add response interceptor for handling 401 errors and token refresh
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

    // Check if the error is a 401 and it's not a retry request
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh if this is already a refresh token request
      if (originalRequest.url === "/auth/refresh-token") {
        console.log("[API] Refresh token is invalid, logging out");
        // Clear user info from session storage
        sessionStorage.removeItem("user-info");
        window.location.href = "/";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If a refresh is already in progress, queue the original request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // Retry the original request
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

    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      console.log("[API] Access denied - insufficient permissions");
      // Redirect to unauthorized page
      window.location.href = "/unauthorized";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Apply the same interceptor to bulk upload client
bulkUploadClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // For simplicity, just redirect to login on 401 for bulk uploads
      sessionStorage.removeItem("user-info");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Export the public API for convenience
export const publicApi = apiClient;
