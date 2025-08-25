"use client";

import { StudentManagement } from "@/components/shared/forms/student-management";
import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function AdminStudentsPage() {
  return (
    <div>
      <PageHeader 
      />
      <StudentManagement />
    </div>
  );
}
