"use client";

import { SectionManagement } from "@/components/shared/forms/section-management";
import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function AdminSectionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader />
      <SectionManagement />
    </div>
  );
}
