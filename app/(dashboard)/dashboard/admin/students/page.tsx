"use client";

import { StudentManagement } from "@/components/admin/student-management";
import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function AdminStudentsPage() {
  return (
    <div>
      <PageHeader 
        title="Student Management" 
        description="Manage student records, CRT eligibility, and bulk operations"
      />
      <StudentManagement />
    </div>
  );
}
