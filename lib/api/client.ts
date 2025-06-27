"use client";

import axios, { type AxiosInstance, type AxiosResponse } from "axios";

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
const API_TIMEOUT = 10000;

// Base axios instance for public routes (auth endpoints)
export const publicApi: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}`,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

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

      if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
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
          document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie = "refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          window.location.href = "/";
          return Promise.reject(refreshError);
        }
      }

      // If 401 and no refresh token, or refresh failed, logout
      if (error.response?.status === 401) {
        console.log("[API] Unauthorized, clearing tokens");
        sessionStorage.removeItem("auth-token");
        sessionStorage.removeItem("refresh-token");
        document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/";
      }

      return Promise.reject(error);
    }
  );

  return clientApi;
};
