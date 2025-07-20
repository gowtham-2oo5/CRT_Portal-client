import { createClientSecuredApi } from "../client";

interface AttendanceConfig {
  enforceEndTimeRestriction: boolean;
}

const token = sessionStorage.getItem("auth-token");
if (!token) {
  throw new Error("No authentication token found");
}
const apiClient = createClientSecuredApi(token);

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
