"use client";

import { TimeSlotManagement } from "@/components/shared/forms/timeslot-management";
import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function AdminTimeSlotManagementPage() {
  return (
    <div className="space-y-6">
      <PageHeader />
      <TimeSlotManagement />
    </div>
  );
}
