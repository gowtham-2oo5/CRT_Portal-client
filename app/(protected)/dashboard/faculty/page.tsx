"use client";

import { ConsistentFacultyDashboard } from "@/components/faculty/consistent-faculty-dashboard";
import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function FacultyDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader></PageHeader>
      <ConsistentFacultyDashboard />
    </div>
  );
}
