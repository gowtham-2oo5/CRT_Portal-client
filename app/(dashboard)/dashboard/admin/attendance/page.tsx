"use client";

import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function AdminAttendancePage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Attendance Management" 
        description="Monitor attendance, generate reports, and manage records"
      />
      
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Attendance Management System</h2>
        <p className="text-muted-foreground">Coming soon...</p>
      </div>
    </div>
  );
}
