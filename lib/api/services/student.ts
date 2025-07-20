import { createClientSecuredApi } from "../client";

const token = sessionStorage.getItem("auth-token");
if (!token) {
  throw new Error("No authentication token found");
}
const apiClient = createClientSecuredApi(token);

class StudentServiceClass {
  async sendBulkEmail(
    subject: string,
    body: string,
    emailIds: string[]
  ): Promise<void> {
    await apiClient.post("/students/send-mail-in-bulk", {
      subject,
      body,
      emailIds,
    });
  }
}

export const StudentService = new StudentServiceClass();
