"use client";

import { createClientSecuredApi, publicApi } from "@/lib/api/client";
import { handleApiError } from "@/lib/api/utils";
import type {
  User,
  LoginRequest,
  LoginResponse,
  OtpRequest,
  OtpVerificationResponse,
  RefreshTokenResponse,
  TokenClaims,
} from "./types";
import { jwtDecode } from "jwt-decode";

// Client-side authentication utilities
export class ClientAuth {
  static async resetPassword(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log(
        "[ClientAuth] resetPassword: Attempting password reset for",
        email
      );
      const { token } = this.getTokens();

      const response = await publicApi.put(
        "/users/password",
        {
          email,
          newPassword: password,
          currentPassword: "", // optional
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      console.log("[ClientAuth] resetPassword: Success");
      return {
        success: true,
        message: response.data.message || "Password reset successful.",
      };
    } catch (error: unknown) {
      console.error("[ClientAuth] resetPassword: Error", error);
      const apiError = handleApiError(error);
      return {
        success: false,
        message: apiError.message || "Failed to reset password. Please try again.",
      };
    }
  }

  private static getTokenFromStorage(): {
    token: string | null;
    refreshToken: string | null;
  } {
    if (typeof window === "undefined") {
      console.log(
        "[ClientAuth] getTokenFromStorage: Running on server, returning null"
      );
      return { token: null, refreshToken: null };
    }
    const token = sessionStorage.getItem("auth-token");
    const refreshToken = sessionStorage.getItem("refresh-token");
    console.log("[ClientAuth] getTokenFromStorage:", {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
    });
    return { token, refreshToken };
  }

  static getTokens(): { token: string | null; refreshToken: string | null } {
    return this.getTokenFromStorage();
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const { token } = this.getTokens();
      console.log("[ClientAuth] getCurrentUser: Checking token");

      if (!token) {
        console.log("[ClientAuth] getCurrentUser: No token found");
        return null;
      }

      // Decode token to get user info
      const decoded = jwtDecode<TokenClaims>(token);
      console.log("[ClientAuth] getCurrentUser: Decoded token", decoded);

      // Convert TokenClaims to User
      const user: User = {
        name: decoded.name,
        email: decoded.email,
        userId: decoded.userId,
        sub: decoded.sub,
        role: decoded.role,
        isFirstLogin: decoded.isFirstLogin || false, // Default to false if not in token
      };

      return user;
    } catch (error) {
      console.error("[ClientAuth] getCurrentUser: Error decoding token", error);
      return null;
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    const { token } = this.getTokens();
    if (!token) {
      console.log("[ClientAuth] isAuthenticated: No token");
      return false;
    }

    try {
      // Check if token is expired
      const decoded = jwtDecode<TokenClaims>(token);
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        console.log("[ClientAuth] isAuthenticated: Token expired");
        return false;
      }

      console.log("[ClientAuth] isAuthenticated: Token valid");
      return true;
    } catch (error) {
      console.error("[ClientAuth] isAuthenticated: Token decode error", error);
      return false;
    }
  }

  // Step 1: Initial login (username/email + password)
  static async login(
    usernameOrEmail: string,
    password: string
  ): Promise<{ success: boolean; data?: LoginResponse; message: string }> {
    try {
      console.log("[ClientAuth] login: Attempting login for", usernameOrEmail);
      const response = await publicApi.post("/auth/login", {
        usernameOrEmail,
        password,
      } as LoginRequest);

      console.log("[ClientAuth] login: Success", response.data);
      return {
        success: true,
        data: response.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("[ClientAuth] login: Error", error);
      const apiError = handleApiError(error);
      return {
        success: false,
        message: apiError.message,
      };
    }
  }

  // Step 2: OTP verification
  static async verifyOtp(
    usernameOrEmail: string,
    otp: string
  ): Promise<{
    success: boolean;
    data?: OtpVerificationResponse;
    message: string;
  }> {
    try {
      console.log(
        "[ClientAuth] verifyOtp: Attempting verification for",
        usernameOrEmail
      );
      const response = await publicApi.post("/auth/verify-otp", {
        usernameOrEmail,
        otp,
      } as OtpRequest);

      console.log("[ClientAuth] verifyOtp: Response received", response.data);

      if (response.data.token && response.data.refreshToken) {
        console.log("[ClientAuth] verifyOtp: Storing tokens");
        // Store tokens in sessionStorage
        sessionStorage.setItem("auth-token", response.data.token);
        sessionStorage.setItem("refresh-token", response.data.refreshToken);

        // Also set cookies for middleware
        document.cookie = `auth-token=${response.data.token}; path=/`;
        document.cookie = `refresh-token=${response.data.refreshToken}; path=/`;

        console.log("[ClientAuth] verifyOtp: Tokens stored successfully");
      }

      return {
        success: true,
        data: response.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("[ClientAuth] verifyOtp: Error", error);
      const apiError = handleApiError(error);
      return {
        success: false,
        message: apiError.message,
      };
    }
  }

  static async forgotPassword(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await publicApi.post(
        `/auth/forgot-password?email=${encodeURIComponent(email)}`
      );

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        success: false,
        message: apiError.message,
      };
    }
  }

  // Refresh token
  static async refreshToken(): Promise<{
    success: boolean;
    data?: RefreshTokenResponse;
    message: string;
  }> {
    try {
      const { refreshToken } = this.getTokens();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await publicApi.post(
        "/auth/refresh-token",
        {},
        {
          headers: { Authorization: `Bearer ${refreshToken}` },
        }
      );

      if (response.data.token && response.data.refreshToken) {
        sessionStorage.setItem("auth-token", response.data.token);
        sessionStorage.setItem("refresh-token", response.data.refreshToken);

        // Update cookies for middleware
        document.cookie = `auth-token=${response.data.token}; path=/`;
        document.cookie = `refresh-token=${response.data.refreshToken}; path=/`;
      }

      return {
        success: true,
        data: response.data,
        message: response.data.message,
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        success: false,
        message: apiError.message,
      };
    }
  }

  // Logout method
  static async logout(): Promise<void> {
    console.log("[ClientAuth] logout: Clearing tokens and redirecting");
    sessionStorage.removeItem("auth-token");
    sessionStorage.removeItem("refresh-token");

    // Clear cookies
    document.cookie =
      "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // Redirect to login
    window.location.href = "/";
  }

  // Create authenticated API instance
  static createAuthenticatedApi() {
    const { token, refreshToken } = this.getTokens();
    if (!token) throw new Error("No authentication token available");

    return createClientSecuredApi(token, refreshToken || undefined);
  }
}
