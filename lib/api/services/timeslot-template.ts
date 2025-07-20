import { createClientSecuredApi } from "../client";
import type {
  TimeSlotTemplate,
  CreateTimeSlotTemplateRequest,
} from "@/lib/types/timeslot-template";

const token = sessionStorage.getItem("auth-token");
if (!token) {
  throw new Error("No authentication token found");
}
const apiClient = createClientSecuredApi(token);

class TimeSlotTemplateServiceClass {
  private endpoint = "/time-slot-templates";

  async getTemplates(): Promise<TimeSlotTemplate[]> {
    try {
      const response = await apiClient.get<TimeSlotTemplate[]>(this.endpoint);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch time slot templates", error);
      throw error;
    }
  }

  async createTemplate(
    data: CreateTimeSlotTemplateRequest
  ): Promise<TimeSlotTemplate> {
    try {
      const response = await apiClient.post<TimeSlotTemplate>(
        this.endpoint,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create time slot template", error);
      throw error;
    }
  }

  async updateTemplate(
    name: string,
    data: CreateTimeSlotTemplateRequest
  ): Promise<TimeSlotTemplate> {
    try {
      const response = await apiClient.put<TimeSlotTemplate>(
        `${this.endpoint}/${name}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(
        `Failed to update time slot template with name ${name}`,
        error
      );
      throw error;
    }
  }

  async deleteTemplate(name: string): Promise<void> {
    try {
      await apiClient.delete(`${this.endpoint}/${name}`);
    } catch (error) {
      console.error(
        `Failed to delete time slot template with name ${name}`,
        error
      );
      throw error;
    }
  }
}

export const TimeSlotTemplateService = new TimeSlotTemplateServiceClass();
