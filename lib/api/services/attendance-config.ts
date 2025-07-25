import { apiClient } from "../client";

interface AttendanceConfig {
  enforceEndTimeRestriction: boolean;
}

class AttendanceConfigServiceClass {
  async getConfig(): Promise<AttendanceConfig> {
    const response = await apiClient.get<AttendanceConfig>(
      "/attendance-config"
    );
    return response.data;
  }

  async updateEnforceEndTime(enabled: boolean): Promise<void> {
    await apiClient.put("/attendance-config/enforce-end-time", { enabled });
  }
}

export const AttendanceConfigService = new AttendanceConfigServiceClass();
