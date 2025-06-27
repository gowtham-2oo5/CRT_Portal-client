import { publicApi, securedApi } from '../server';
import { handleApiError } from '../utils';
import type { 
  User, 
  LoginRequest,
  LoginResponse,
  OtpRequest,
  OtpVerificationResponse,
  RefreshTokenResponse
} from '@/lib/auth/types';

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'FACULTY';
  studentId?: string;
  facultyId?: string;
}

// Authentication API service
export class AuthService {
  // Public endpoints
  static async login(data: LoginRequest): Promise<{ success: boolean; data?: LoginResponse; message: string }> {
    try {
      const response = await publicApi.post('/login', data);
      return {
        success: true,
        data: response.data,
        message: response.data.message
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  static async verifyOtp(data: OtpRequest): Promise<{ success: boolean; data?: OtpVerificationResponse; message: string }> {
    try {
      const response = await publicApi.post('/verify-otp', data);
      return {
        success: true,
        data: response.data,
        message: response.data.message
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  static async register(data: RegisterRequest): Promise<{ success: boolean; data?: User; message: string }> {
    try {
      const response = await publicApi.post('/register', data);
      return {
        success: true,
        data: response.data.user,
        message: response.data.message
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  static async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await publicApi.post(`/forgot-password?email=${encodeURIComponent(email)}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  // Secured endpoints
  static async getCurrentUser(): Promise<{ success: boolean; data?: User; message: string }> {
    try {
      const response = await securedApi.get('/auth/me');
      return {
        success: true,
        data: response.data.user,
        message: 'User retrieved successfully'
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  static async updateProfile(data: Partial<User>): Promise<{ success: boolean; data?: User; message: string }> {
    try {
      const response = await securedApi.put('/auth/profile', data);
      return {
        success: true,
        data: response.data.user,
        message: response.data.message
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await securedApi.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  static async refreshToken(): Promise<{ success: boolean; data?: RefreshTokenResponse; message: string }> {
    try {
      const response = await securedApi.post('/auth/refresh');
      return {
        success: true,
        data: response.data,
        message: response.data.message
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  static async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await securedApi.post('/auth/logout');
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        success: false,
        message: apiError.message
      };
    }
  }
}
