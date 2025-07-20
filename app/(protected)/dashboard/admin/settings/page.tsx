""use client";

import { PageHeader } from "@/components/dashboard/breadcrumb";
import { AttendanceConfig } from "@/components/admin/attendance-config";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader />
      <AttendanceConfig />
    </div>
  );
}
