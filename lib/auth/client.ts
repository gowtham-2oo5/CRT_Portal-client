"use client";

import { apiClient } from "@/lib/api/client";
import { handleApiError } from "@/lib/api/utils";
import type {
  User,
  LoginRequest,
  LoginResponse,
  OtpRequest,
  OtpVerificationResponse,
} from "./types";

// Client-side authentication utilities
export class ClientAuth {
  // Store user info in session storage
  private static setUserInfo(user: User) {
    if (typeof window === "undefined") return;
    console.log("[ClientAuth] setUserInfo - Storing user:", user);
    console.log("[ClientAuth] setUserInfo - isFirstLogin:", user.isFirstLogin);
    sessionStorage.setItem("user-info", JSON.stringify(user));
  }

  // Clear user info from session storage and attempt to clear cookies
  private static clearUserInfo() {
    if (typeof window === "undefined") return;

    // Clear session storage
    sessionStorage.removeItem("user-info");

    // For httpOnly cookies, we can't directly clear them from JavaScript
    // The actual cookie clearing happens via the /auth/logout endpoint
    // But we can set expired cookies for any non-httpOnly cookies that might exist
    document.cookie =
      "jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict";
    document.cookie =
      "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict";
  }

  // Get user info from session storage
  static getUserInfo(): User | null {
    if (typeof window === "undefined") {
      return null;
    }

    const userInfo = sessionStorage.getItem("user-info");
    console.log("[ClientAuth] getUserInfo - Raw from sessionStorage:", userInfo);
    
    if (!userInfo) {
      console.log("[ClientAuth] getUserInfo - No user in sessionStorage");
      return null;
    }

    try {
      const user = JSON.parse(userInfo) as User;
      console.log("[ClientAuth] getUserInfo - Parsed user:", user);
      console.log("[ClientAuth] getUserInfo - isFirstLogin:", user.isFirstLogin);
      return user;
    } catch (error) {
      console.error("[ClientAuth] Error parsing user info:", error);
      return null;
    }
  }

  // Check if user is authenticated based on stored user info
  static async isAuthenticated(): Promise<boolean> {
    try {
      // First check if we have user info in session storage
      const userInfo = this.getUserInfo();
      if (userInfo) return true;

      // If not, try to get current user from API
      const user = await this.getCurrentUser();
      return user !== null;
    } catch (error) {
      return false;
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get("/users/me");
      const user = response.data;

      if (user) {
        console.log("AT API CLIENT: USER: ", user);
        this.setUserInfo(user);
        return user;
      }
      return null;
    } catch (error) {
      console.error("[ClientAuth] Error getting current user:", error);
      return null;
    }
  }

  // Step 1: Initial login (username/email + password)
  static async login(
    usernameOrEmail: string,
    password: string
  ): Promise<{ success: boolean; data?: LoginResponse; message: string }> {
    try {
      console.log("[ClientAuth] Attempting login for:", usernameOrEmail);

      const response = await apiClient.post("/auth/login", {
        usernameOrEmail,
        password,
      } as LoginRequest);

      console.log("[ClientAuth] Login successful");
      return {
        success: true,
        data: response.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("[ClientAuth] Login error:", error);
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
      console.log("[ClientAuth] Verifying OTP for:", usernameOrEmail);

      const response = await apiClient.post("/auth/verify-otp", {
        usernameOrEmail,
        otp,
      } as OtpRequest);

      // Store user info from response
      if (response.data.user) {
        this.setUserInfo(response.data.user);
      }

      return {
        success: true,
        data: response.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("[ClientAuth] OTP verification error:", error);
      const apiError = handleApiError(error);
      return {
        success: false,
        message: apiError.message,
      };
    }
  }

  // Logout method
  static async logout(): Promise<void> {
    console.log("[ClientAuth] Logging out");

    try {
      // Call logout endpoint to clear httpOnly cookies
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.log("[ClientAuth] Logout endpoint error (non-critical):", error);
    }

    // Clear user info from session storage and any non-httpOnly cookies
    this.clearUserInfo();
    window.location.href = "/";
  }

  // Forgot password
  static async forgotPassword(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log("Sending pwd reset to ", email);
      const response = await apiClient.post(
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

  // Reset password
  static async resetPassword(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log("[ClientAuth] Resetting password for:", email);

      const response = await apiClient.put("/users/password", {
        email,
        newPassword: password,
        currentPassword: "",
      });

      return {
        success: true,
        message: response.data.message || "Password reset successful.",
      };
    } catch (error) {
      console.error("[ClientAuth] Password reset error:", error);
      const apiError = handleApiError(error);
      return {
        success: false,
        message: apiError.message || "Failed to reset password.",
      };
    }
  }
}
