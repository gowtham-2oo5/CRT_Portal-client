/**
 * Error handling utility functions
 */

import { toast } from "sonner";

/**
 * Standard error types
 */
export enum ErrorType {
  NETWORK = "network",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  VALIDATION = "validation",
  NOT_FOUND = "not_found",
  SERVER = "server",
  UNKNOWN = "unknown"
}

/**
 * Error with additional context
 */
export interface AppError extends Error {
  type?: ErrorType;
  details?: Record<string, any>;
  originalError?: any;
}

/**
 * Create a user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: any): string {
  // If it's our AppError type, use its message
  if (error && error.type) {
    return error.message;
  }

  // Handle network errors
  if (error?.message?.includes('Network') || error?.message?.includes('fetch')) {
    return "Network error. Please check your connection and try again.";
  }

  // Handle authentication errors
  if (error?.response?.status === 401 || error?.message?.includes('authentication')) {
    return "Authentication error. Please log in again.";
  }

  // Handle authorization errors
  if (error?.response?.status === 403 || error?.message?.includes('permission')) {
    return "You don't have permission to perform this action.";
  }

  // Handle validation errors
  if (error?.response?.status === 400 || error?.message?.includes('validation')) {
    return "Invalid data. Please check your input and try again.";
  }

  // Handle not found errors
  if (error?.response?.status === 404 || error?.message?.includes('not found')) {
    return "The requested resource was not found.";
  }

  // Handle server errors
  if (error?.response?.status >= 500 || error?.message?.includes('server')) {
    return "Server error. Please try again later.";
  }

  // Default error message
  return error?.message || "An unexpected error occurred. Please try again.";
}

/**
 * Handle error with logging and user notification
 */
export function handleError(error: any, context: string, showToast = true): AppError {
  // Create a structured error object
  const appError: AppError = new Error(getUserFriendlyErrorMessage(error));
  
  // Add error type
  if (error?.type) {
    appError.type = error.type;
  } else if (error?.response?.status === 401) {
    appError.type = ErrorType.AUTHENTICATION;
  } else if (error?.response?.status === 403) {
    appError.type = ErrorType.AUTHORIZATION;
  } else if (error?.response?.status === 400) {
    appError.type = ErrorType.VALIDATION;
  } else if (error?.response?.status === 404) {
    appError.type = ErrorType.NOT_FOUND;
  } else if (error?.response?.status >= 500) {
    appError.type = ErrorType.SERVER;
  } else if (error?.message?.includes('Network') || error?.message?.includes('fetch')) {
    appError.type = ErrorType.NETWORK;
  } else {
    appError.type = ErrorType.UNKNOWN;
  }
  
  // Add original error for debugging
  appError.originalError = error;
  
  // Log the error with context
  console.error(`[${context}] ${appError.message}`, {
    type: appError.type,
    originalError: error
  });
  
  // Show toast notification if requested
  if (showToast) {
    toast.error(appError.message);
  }
  
  return appError;
}

/**
 * Try to execute a function and handle any errors
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  context: string,
  showToast = true
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const appError = handleError(error, context, showToast);
    return { data: null, error: appError };
  }
}
