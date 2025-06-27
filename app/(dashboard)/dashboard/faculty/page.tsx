"use client";

import { FacultyDashboard } from "@/components/faculty/faculty-dashboard";
import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function FacultyDashboardPage() {
  return (
    <div>
      <PageHeader 
        title="Faculty Dashboard" 
        description="Overview of your training sessions and student progress"
      />
      <FacultyDashboard />
    </div>
  );
}
