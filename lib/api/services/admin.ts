import { apiClient } from "@/lib/api/client";
import { AdminMockService } from "./admin-mock";
import type { DashboardMetrics, RecentAction } from "@/lib/types/admin";

// Toggle this to switch between real API and mock data
const USE_MOCK_DATA = false; // Set to false when backend is ready
const FALLBACK_TO_MOCK_ON_ERROR = false; // Fallback to mock data if API fails

export class AdminService {
  private static isNetworkError(error: any): boolean {
    return (
      error.code === "ERR_NETWORK" ||
      error.code === "NETWORK_ERROR" ||
      error.message === "Network Error" ||
      !error.response ||
      error.response?.status === 0
    );
  }

  // Fetch dashboard metrics
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    if (USE_MOCK_DATA) {
      console.log("[AdminService] Using mock data for dashboard metrics");
      return AdminMockService.getDashboardMetrics();
    }

    try {
      const response = await apiClient.get("/admin/dashboard/metrics");

      console.log("[AdminService] Dashboard metrics fetched:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[AdminService] Error fetching dashboard metrics:", error);

      // Check if it's a network error and fallback is enabled
      if (FALLBACK_TO_MOCK_ON_ERROR && this.isNetworkError(error)) {
        console.warn(
          "[AdminService] Network error detected, falling back to mock data"
        );
        return AdminMockService.getDashboardMetrics();
      }

      throw error;
    }
  }

  // Fetch recent actions
  static async getRecentActions(limit: number = 15): Promise<RecentAction[]> {
    if (USE_MOCK_DATA) {
      console.log("[AdminService] Using mock data for recent actions");
      return AdminMockService.getRecentActions(limit);
    }

    try {
      const response = await apiClient.get(
        `/admin/dashboard/recent-actions?limit=${limit}`
      );

      console.log("[AdminService] Recent actions fetched:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[AdminService] Error fetching recent actions:", error);

      // Check if it's a network error and fallback is enabled
      if (FALLBACK_TO_MOCK_ON_ERROR && this.isNetworkError(error)) {
        console.warn(
          "[AdminService] Network error detected, falling back to mock data"
        );
        return AdminMockService.getRecentActions(limit);
      }

      throw error;
    }
  }

  // Refresh all dashboard data
  static async refreshDashboardData(limit: number = 15): Promise<{
    metrics: DashboardMetrics;
    recentActions: RecentAction[];
  }> {
    if (USE_MOCK_DATA) {
      console.log("[AdminService] Using mock data for dashboard refresh");
      return AdminMockService.refreshDashboardData(limit);
    }

    try {
      const [metrics, recentActions] = await Promise.all([
        this.getDashboardMetrics(),
        this.getRecentActions(limit),
      ]);

      return { metrics, recentActions };
    } catch (error: any) {
      console.error("[AdminService] Error refreshing dashboard data:", error);

      // Check if it's a network error and fallback is enabled
      if (FALLBACK_TO_MOCK_ON_ERROR && this.isNetworkError(error)) {
        console.warn(
          "[AdminService] Network error detected, falling back to mock data"
        );
        return AdminMockService.refreshDashboardData(limit);
      }

      throw error;
    }
  }

  // Check server connectivity
  static async checkServerHealth(): Promise<{
    isOnline: boolean;
    message: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();

    try {
      const response = await apiClient.get("/health", { timeout: 5000 });
      const responseTime = Date.now() - startTime;

      return {
        isOnline: true,
        message: "Server is online and responding",
        responseTime,
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;

      if (this.isNetworkError(error)) {
        return {
          isOnline: false,
          message: "Server is offline or unreachable",
          responseTime,
        };
      }

      return {
        isOnline: false,
        message: `Server error: ${error.message}`,
        responseTime,
      };
    }
  }
}
