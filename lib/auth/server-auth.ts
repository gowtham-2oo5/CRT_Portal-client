import { publicApi } from "@/lib/api/server";
import { handleApiError } from "@/lib/api/utils";
import { redirect } from "next/navigation";
import type {
  LoginRequest,
  LoginResponse,
  OtpRequest,
  OtpVerificationResponse,
  RefreshTokenResponse,
  User,
} from "./types";

export class ServerAuth {
  static async getAuthToken(): Promise<string | null> {
    // Since we're using sessionStorage, we can't access it server-side
    // This will be handled by the client-side auth
    return null;
  }

  static async getRefreshToken(): Promise<string | null> {
    // Since we're using sessionStorage, we can't access it server-side
    // This will be handled by the client-side auth
    return null;
  }

  static async getCurrentUser(): Promise<User | null> {
    // Since we're using sessionStorage, we can't access it server-side
    // This will be handled by the client-side auth
    return null;
  }

  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }

  static async requireAuth(): Promise<User> {
    const user = await this.getCurrentUser();
    if (!user) {
      redirect("/");
    }
    return user;
  }

  static async requireRole(
    allowedRoles: Array<"ADMIN" | "FACULTY">
  ): Promise<User> {
    const user = await this.requireAuth();
    if (!allowedRoles.includes(user.role)) {
      redirect("/unauthorized");
    }
    return user;
  }

  // Step 1: Initial login (username/email + password)
  static async login(
    usernameOrEmail: string,
    password: string
  ): Promise<{ success: boolean; data?: LoginResponse; message: string }> {
    try {
      const response = await publicApi.post("/auth/login", {
        usernameOrEmail,
        password,
      } as LoginRequest);

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
      const response = await publicApi.post("/verify-otp", {
        usernameOrEmail,
        otp,
      } as OtpRequest);

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

  static async forgotPassword(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await publicApi.post(
        `/forgot-password?email=${encodeURIComponent(email)}`
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
      const response = await publicApi.post("/refresh-token");

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
    redirect("/");
  }
}
