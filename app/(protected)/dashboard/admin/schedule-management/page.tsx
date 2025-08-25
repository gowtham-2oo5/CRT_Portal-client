"use client";

import { ScheduleManagement } from "@/components/schedule/management/schedule-management";
import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function AdminScheduleManagementPage() {
  return (
    <div className="space-y-6">
      <PageHeader />
      <ScheduleManagement />
    </div>
  );
}
