"use client";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function AdminDashboardPage() {
  return (
    <div>
      <PageHeader 
        title="Admin Dashboard" 
        description="Overview of system statistics and recent activities"
      />
      <AdminDashboard />
    </div>
  );
}
