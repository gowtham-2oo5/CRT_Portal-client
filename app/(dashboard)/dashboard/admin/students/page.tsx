"use client";

import { StudentManagement } from "@/components/admin/student-management";
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
