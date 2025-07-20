"use client";

import { PageHeader } from "@/components/dashboard/breadcrumb";
import { TimeSlotFilter } from "@/components/admin/timeslot-filter";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader />
      <TimeSlotFilter />
    </div>
  );
}