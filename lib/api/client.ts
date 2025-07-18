"use client";

import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import { getAuthToken } from "./config";

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
const API_TIMEOUT = 10000;
const BULK_UPLOAD_API_TIMEOUT = 300000;

// Base axios instance for public routes (auth endpoints)
export const publicApi: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}`,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Base axios instance for bulk uploads
export const bulkUploadApi: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}`,
  timeout: BULK_UPLOAD_API_TIMEOUT,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// Add request interceptor to include auth token for bulk uploads
bulkUploadApi.interceptors.request.use(
  (config) => {
    // Get token from sessionStorage for client-side requests
    const token = sessionStorage.getItem("auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for handling 401 errors
bulkUploadApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error - redirect to login
      console.error("Unauthorized request in bulk upload");
      sessionStorage.removeItem("auth-token");
      sessionStorage.removeItem("refresh-token");
      document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Client-side axios instance for secured routes
export const createClientSecuredApi = (
  token: string,
  refreshToken?: string
): AxiosInstance => {
  const clientApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  clientApi.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        refreshToken
      ) {
        originalRequest._retry = true;

        try {
          console.log("[API] Attempting token refresh");

          const refreshResponse = await publicApi.post(
            "/auth/refresh-token",
            {},
            {
              headers: { Authorization: `Bearer ${refreshToken}` },
            }
          );

          if (refreshResponse.data.token) {
            console.log("[API] Token refresh successful");

            const newToken = refreshResponse.data.token;
            const newRefreshToken = refreshResponse.data.refreshToken;

            // Update tokens in storage
            sessionStorage.setItem("auth-token", newToken);
            sessionStorage.setItem("refresh-token", newRefreshToken);

            // Update cookies for middleware
            document.cookie = `auth-token=${newToken}; path=/; secure; samesite=strict`;
            document.cookie = `refresh-token=${newRefreshToken}; path=/; secure; samesite=strict`;

            // Update the authorization header and retry the original request
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return clientApi.request(originalRequest);
          }
        } catch (refreshError) {
          console.error("[API] Token refresh failed:", refreshError);
          // Refresh failed, clear tokens and redirect to login
          sessionStorage.removeItem("auth-token");
          sessionStorage.removeItem("refresh-token");
          document.cookie =
            "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie =
            "refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          window.location.href = "/";
          return Promise.reject(refreshError);
        }
      }

      // If 401 and no refresh token, or refresh failed, logout
      if (error.response?.status === 401) {
        console.log("[API] Unauthorized, clearing tokens");
        sessionStorage.removeItem("auth-token");
        sessionStorage.removeItem("refresh-token");
        document.cookie =
          "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie =
          "refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/";
      }

      return Promise.reject(error);
    }
  );

  return clientApi;
};
