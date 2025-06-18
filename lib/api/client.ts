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
      if (error.response?.status === 401 && refreshToken) {
        try {
          console.log("[API] Attempting token refresh");
          // Try to refresh token
          const refreshResponse = await publicApi.post(
            "/auth/refresh-token",
            {},
            {
              headers: { Authorization: `Bearer ${refreshToken}` },
            }
          );

          if (refreshResponse.data.token) {
            console.log("[API] Token refresh successful");
            // Update tokens in sessionStorage (consistent with ClientAuth)
            sessionStorage.setItem("auth-token", refreshResponse.data.token);
            sessionStorage.setItem(
              "refresh-token",
              refreshResponse.data.refreshToken
            );

            // Update cookies
            document.cookie = `auth-token=${refreshResponse.data.token}; path=/`;
            document.cookie = `refresh-token=${refreshResponse.data.refreshToken}; path=/`;

            // Retry original request
            error.config.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
            return clientApi.request(error.config);
          }
        } catch (refreshError) {
          console.error("[API] Token refresh failed", refreshError);
          // Refresh failed, logout user
          sessionStorage.removeItem("auth-token");
          sessionStorage.removeItem("refresh-token");
          document.cookie =
            "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie =
            "refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          window.location.href = "/";
        }
      } else if (error.response?.status === 401) {
        console.log("[API] Unauthorized, logging out");
        // No refresh token, logout
        sessionStorage.removeItem("auth-token");
        sessionStorage.removeItem("refresh-token");
        document.cookie =
          "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/";
      }
      return Promise.reject(error);
    }
  );

  return clientApi;
};
