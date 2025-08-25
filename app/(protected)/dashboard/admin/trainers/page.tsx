"use client";

import { TrainerManagement } from "@/components/shared/forms/trainer-management";
import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function AdminTrainersPage() {
  return (
    <div className="space-y-6">
      <PageHeader />
      <TrainerManagement />
    </div>
  );
}
