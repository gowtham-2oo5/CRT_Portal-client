"use client";

import { BulkOperations } from "@/components/admin/bulk-operations";
import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function AdminBulkOperationsPage() {
  return (
    <div>
      <PageHeader 
      />
      <BulkOperations />
    </div>
  );
}