import { ClientAuth } from "@/lib/auth/client";
import { AdminMockService } from "./admin-mock";
import type { DashboardMetrics, RecentAction } from "@/lib/types/admin";

// Toggle this to switch between real API and mock data
const USE_MOCK_DATA = true; // Set to false when backend is ready

export class AdminService {
  private static async getAuthenticatedApi() {
    try {
      return ClientAuth.createAuthenticatedApi();
    } catch (error) {
      console.error("[AdminService] Failed to create authenticated API:", error);
      throw new Error("Authentication required");
    }
  }

  // Fetch dashboard metrics
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    if (USE_MOCK_DATA) {
      console.log("[AdminService] Using mock data for dashboard metrics");
      return AdminMockService.getDashboardMetrics();
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.get('/admin/dashboard/metrics');

      console.log("[AdminService] Dashboard metrics fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("[AdminService] Error fetching dashboard metrics:", error);
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
      const api = await this.getAuthenticatedApi();
      const response = await api.get(`/admin/dashboard/recent-actions?limit=${limit}`);

      console.log("[AdminService] Recent actions fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("[AdminService] Error fetching recent actions:", error);
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
        this.getRecentActions(limit)
      ]);

      return { metrics, recentActions };
    } catch (error) {
      console.error("[AdminService] Error refreshing dashboard data:", error);
      throw error;
    }
  }
}
