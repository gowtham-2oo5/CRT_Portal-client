"use client";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </PageHeader>
      <AdminDashboard />
    </div>
  );
}
