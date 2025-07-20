"use client";

import { PageHeader } from "@/components/dashboard/breadcrumb";
import { AttendanceConfig } from "@/components/admin/attendance-config";
import { DataExportSettings } from "@/components/admin/data-export-settings";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader />
      <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
      <p className="text-muted-foreground">
        Configure system settings and manage data exports.
      </p>
      
      <div className="grid gap-6">
        <AttendanceConfig />
        <DataExportSettings />
      </div>
    </div>
  );
}
