"use client";

import { TrainerManagement } from "@/components/admin/trainer-management";
import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function AdminTrainersPage() {
  return (
    <div>
      <PageHeader 
        title="Trainer Management" 
        description="Manage external trainers and their assignments"
      />
      <TrainerManagement />
    </div>
  );
}
