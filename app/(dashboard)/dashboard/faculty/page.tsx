"use client";

import { FacultyDashboard } from "@/components/faculty/faculty-dashboard";
import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function FacultyDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader>
        <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
      </PageHeader>
      <FacultyDashboard />
    </div>
  );
}
