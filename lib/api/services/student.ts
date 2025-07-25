import { apiClient } from "../client";

class StudentServiceClass {
  async sendBulkEmail(
    subject: string,
    body: string,
    emailIds: string[]
  ): Promise<void> {
    console.log("Emails: ", emailIds);
    await apiClient.post("/students/send-mail-in-bulk", {
      subject,
      body,
      emailIds,
    });
  }
}

export const StudentService = new StudentServiceClass();
