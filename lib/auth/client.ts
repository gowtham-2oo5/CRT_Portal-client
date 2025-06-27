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
  // Helper to set tokens consistently
  private static setTokens(token: string, refreshToken: string) {
    // Store in sessionStorage for client-side access
    sessionStorage.setItem("auth-token", token);
    sessionStorage.setItem("refresh-token", refreshToken);

    // Set HTTP-only cookies for middleware (secure)
    document.cookie = `auth-token=${token}; path=/; secure; samesite=strict`;
    document.cookie = `refresh-token=${refreshToken}; path=/; secure; samesite=strict`;
  }

  // Helper to clear tokens consistently
  private static clearTokens() {
    sessionStorage.removeItem("auth-token");
    sessionStorage.removeItem("refresh-token");

    // Clear cookies
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }

  static getTokens(): { token: string | null; refreshToken: string | null } {
    if (typeof window === "undefined") {
      return { token: null, refreshToken: null };
    }
    
    const token = sessionStorage.getItem("auth-token");
    const refreshToken = sessionStorage.getItem("refresh-token");
    
    return { token, refreshToken };
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const { token } = this.getTokens();
      
      if (!token) {
        return null;
      }

      // Decode token to get user info
      const decoded = jwtDecode<TokenClaims>(token);
      
      // Check if token is expired
      const now = Date.now() / 1000;
      if (decoded.exp < now) {
        console.log("[ClientAuth] Token expired");
        this.clearTokens();
        return null;
      }

      // Convert TokenClaims to User
      const user: User = {
        name: decoded.name,
        email: decoded.email,
        userId: decoded.userId,
        sub: decoded.sub,
        role: decoded.role,
        isFirstLogin: decoded.isFirstLogin || false,
      };

      return user;
    } catch (error) {
      console.error("[ClientAuth] Error getting current user:", error);
      this.clearTokens();
      return null;
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  // Step 1: Initial login (username/email + password)
  static async login(
    usernameOrEmail: string,
    password: string
  ): Promise<{ success: boolean; data?: LoginResponse; message: string }> {
    try {
      console.log("[ClientAuth] Attempting login for:", usernameOrEmail);
      
      const response = await publicApi.post("/auth/login", {
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
      
      const response = await publicApi.post("/auth/verify-otp", {
        usernameOrEmail,
        otp,
      } as OtpRequest);

      if (response.data.token && response.data.refreshToken) {
        console.log("[ClientAuth] OTP verified, storing tokens");
        this.setTokens(response.data.token, response.data.refreshToken);
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
        this.setTokens(response.data.token, response.data.refreshToken);
      }

      return {
        success: true,
        data: response.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("[ClientAuth] Token refresh error:", error);
      this.clearTokens();
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
      // Optional: Call logout endpoint
      const { token } = this.getTokens();
      if (token) {
        await publicApi.post("/auth/logout", {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.log("[ClientAuth] Logout endpoint error (non-critical):", error);
    }
    
    this.clearTokens();
    window.location.href = "/";
  }

  // Forgot password
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
      const { token } = this.getTokens();

      const response = await publicApi.put(
        "/users/password",
        {
          email,
          newPassword: password,
          currentPassword: "",
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

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

  // Create authenticated API instance
  static createAuthenticatedApi() {
    const { token, refreshToken } = this.getTokens();
    if (!token) throw new Error("No authentication token available");

    return createClientSecuredApi(token, refreshToken || undefined);
  }
}
