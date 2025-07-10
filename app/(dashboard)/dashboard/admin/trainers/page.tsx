"use client";

import { TrainerManagement } from "@/components/admin/trainer-management";
import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function AdminTrainersPage() {
  return (
    <div className="space-y-6">
      <PageHeader>
        <h1 className="text-3xl font-bold">Trainer Management</h1>
      </PageHeader>
      <TrainerManagement />
    </div>
  );
}
