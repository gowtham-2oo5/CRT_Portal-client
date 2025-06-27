import axios, { AxiosInstance, AxiosResponse } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
const API_TIMEOUT = 10000;

// Token management utilities
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("auth-token")?.value || null;
  } catch {
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("refresh-token")?.value || null;
  } catch {
    return null;
  }
};

// Base axios instance for public routes (auth endpoints)
export const publicApi: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Axios instance for secured routes (server-side)
export const securedApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for secured API (server-side)
securedApi.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling (server-side)
securedApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token first
      try {
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
          const refreshResponse = await publicApi.post(
            "/refresh-token",
            {},
            {
              headers: { Authorization: `Bearer ${refreshToken}` },
            }
          );

          if (refreshResponse.data.token) {
            const cookieStore = await cookies();
            cookieStore.set("auth-token", refreshResponse.data.token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
            });
            cookieStore.set(
              "refresh-token",
              refreshResponse.data.refreshToken,
              {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
              }
            );

            // Retry original request
            error.config.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
            return securedApi.request(error.config);
          }
        }
      } catch {
        // Refresh failed, clear tokens and redirect
        const cookieStore = await cookies();
        cookieStore.delete("auth-token");
        cookieStore.delete("refresh-token");
      }

      redirect("/");
    }
    return Promise.reject(error);
  }
);

// Client-side axios instance for secured routes
export const createClientSecuredApi = async (
  token: string,
  refreshToken?: string
): Promise<AxiosInstance> => {
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
          // Try to refresh token
          const refreshResponse = await publicApi.post(
            "/refresh-token",
            {},
            {
              headers: { Authorization: `Bearer ${refreshToken}` },
            }
          );

          if (refreshResponse.data.token) {
            // Update tokens in storage
            localStorage.setItem("auth-token", refreshResponse.data.token);
            localStorage.setItem(
              "refresh-token",
              refreshResponse.data.refreshToken
            );

            // Update cookies
            document.cookie = `auth-token=${
              refreshResponse.data.token
            }; path=/; SameSite=Lax${
              process.env.NODE_ENV === "production" ? "; Secure" : ""
            }`;
            document.cookie = `refresh-token=${
              refreshResponse.data.refreshToken
            }; path=/; SameSite=Lax${
              process.env.NODE_ENV === "production" ? "; Secure" : ""
            }`;

            // Retry original request
            error.config.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
            return clientApi.request(error.config);
          }
        } catch {
          // Refresh failed, logout user
          localStorage.removeItem("auth-token");
          localStorage.removeItem("refresh-token");
          document.cookie =
            "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie =
            "refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          window.location.href = "/ogin";
        }
      } else if (error.response?.status === 401) {
        // No refresh token, logout
        localStorage.removeItem("auth-token");
        localStorage.removeItem("refresh-token");
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
