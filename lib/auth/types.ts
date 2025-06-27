export interface User {
  name: string;
  email: string;
  userId: string;
  sub: string;
  role: "ADMIN" | "FACULTY";
  isFirstLogin: boolean;
}

export interface TokenClaims {
  role: "ADMIN" | "FACULTY";
  name: string;
  userId: string;
  email: string;
  sub: string;
  isFirstLogin: boolean;
  iat: number;
  exp: number;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: null;
  refreshToken: null;
}

export interface OtpRequest {
  usernameOrEmail: string;
  otp: string;
}

export interface OtpVerificationResponse {
  message: string;
  token: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenResponse {
  message: string;
  token: string;
  refreshToken: string;
  user: User;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tempCredentials: {
    usernameOrEmail: string;
    user: User;
  } | null;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
