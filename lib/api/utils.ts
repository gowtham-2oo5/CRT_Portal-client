import type { ApiErrorResponse } from '@/lib/auth/types';

// Error handling utility
export function handleApiError(
  error: unknown
): { success: false; message: string; error?: ApiErrorResponse } {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: ApiErrorResponse } };
    if (axiosError.response?.data) {
      const apiError: ApiErrorResponse = axiosError.response.data;
      return {
        success: false,
        message: apiError.message || "An error occurred",
        error: apiError,
      };
    }
  }

  const errorMessage = error instanceof Error ? error.message : "Network error occurred";
  return {
    success: false,
    message: errorMessage,
  };
}
