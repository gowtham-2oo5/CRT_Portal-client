import { apiClient } from "@/lib/api/client";
import type { 
  SubmitAttendanceRequest, 
  AttendanceRecord,
  TimeSlotValidationResponse,
  BatchableTimeSlotsResponse,
  BatchSubmissionResponse
} from "@/lib/types/attendance";
import { handleError } from "@/lib/utils/error-handler";

class BatchAttendanceServiceClass {
  /**
   * Get authenticated API client
   */
  private async getAuthenticatedApi() {
    try {
      return await ClientAuth.createAuthenticatedApi();
    } catch (error) {
      throw handleError(error, "BatchAttendanceService.getAuthenticatedApi", false);
    }
  }

  /**
   * Submit attendance for multiple time slots in a batch
   */
  async submitBatchAttendance(data: {
    date: string;
    sectionId: string;
    topicTaught: string;
    sessionNotes?: string;
    timeSlotIds: string[];
    attendanceRecords: AttendanceRecord[];
    isAdminRequest?: boolean;
  }): Promise<BatchSubmissionResponse> {
    try {
      // Using apiClient
      const response = await apiClient.post("/attendance/submit-batch", data);
      return response.data;
    } catch (error) {
      throw handleError(error, "BatchAttendanceService.submitBatchAttendance", false);
    }
  }

  /**
   * Validate if selected time slots can be processed in a batch
   */
  async validateBatchTimeSlots(timeSlotIds: string[]): Promise<TimeSlotValidationResponse> {
    try {
      // Using apiClient
      const idsParam = timeSlotIds.join(',');
      const response = await apiClient.get(`/time-slots/validate-batch?ids=${idsParam}`);
      return response.data;
    } catch (error) {
      throw handleError(error, "BatchAttendanceService.validateBatchTimeSlots", false);
    }
  }

  /**
   * Get time slots that can be processed in batches, grouped by section
   */
  async getBatchableTimeSlots(facultyId: string, date: string): Promise<BatchableTimeSlotsResponse> {
    try {
      // Using apiClient
      const response = await apiClient.get(`/time-slots/faculty/${facultyId}/batchable?date=${date}`);
      return response.data;
    } catch (error) {
      throw handleError(error, "BatchAttendanceService.getBatchableTimeSlots", false);
    }
  }
}

export const BatchAttendanceService = new BatchAttendanceServiceClass();
